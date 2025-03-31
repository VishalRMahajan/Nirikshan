from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import json
import asyncio
import tempfile
import urllib.request
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set
from fastapi.responses import JSONResponse
from Nirikshan.pipeline.training_pipeline import TrainingPipeline
from Nirikshan.logger import logging

app = FastAPI()
pipeline = TrainingPipeline()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections: Dict[str, WebSocket] = {}
processing_tasks: Dict[str, asyncio.Task] = {}
detected_accidents: Dict[str, Set[int]] = {}  # Track detected accidents by connection_id and frame range

MIN_FRAMES_BETWEEN_DETECTIONS = 60  # Minimum frames between accident detections

@app.websocket("/ws/detect")
async def accident_detection_websocket(websocket: WebSocket):
    await websocket.accept()
    
    connection_id = f"conn_{id(websocket)}"
    active_connections[connection_id] = websocket
    detected_accidents[connection_id] = set()
    
    video_temp = None
    cap = None
    processing_task = None
    
    try:
        await websocket.send_json({
            "message": "Connected to accident detection service",
            "severity": "info"
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if "video_url" in message:
                video_url = message["video_url"]
                cctv_id = message.get("cctv_id", "unknown")
                
                if processing_task and not processing_task.done():
                    processing_task.cancel()
                    await asyncio.sleep(0.1)
                
                # Reset accident tracking for new video
                detected_accidents[connection_id] = set()
                
                await websocket.send_json({
                    "message": f"Starting accident detection for camera {cctv_id}",
                    "severity": "info"
                })
                
                pipeline.reset_state()
                
                video_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
                
                try:
                    # Download the video
                    if video_url.startswith('http'):
                        urllib.request.urlretrieve(video_url, video_temp.name)
                        video_path = video_temp.name
                    else:
                        if not video_url.startswith('/'):
                            video_url = '/' + video_url
                        full_url = f"http://localhost:3000{video_url}"
                        urllib.request.urlretrieve(full_url, video_temp.name)
                        video_path = video_temp.name
                    
                    cap = cv2.VideoCapture(video_path)
                    
                    if not cap.isOpened():
                        await websocket.send_json({
                            "message": f"Error: Could not open video stream from {video_url}",
                            "severity": "error"
                        })
                        continue
                    
                    # Get video properties for one-time processing
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                    
                    # Important: Send ready notification before starting processing
                    await websocket.send_json({
                        "type": "ready",
                        "message": "Backend ready to process video",
                        "severity": "info",
                        "total_frames": total_frames,
                        "fps": fps
                    })
                    
                    # Wait a moment to ensure frontend received the ready message
                    await asyncio.sleep(0.5)
                    
                    processing_task = asyncio.create_task(
                        process_video_once(websocket, cap, connection_id, total_frames)
                    )
                    processing_tasks[connection_id] = processing_task
                    
                except Exception as e:
                    await websocket.send_json({
                        "message": f"Error setting up video: {str(e)}",
                        "severity": "error"
                    })
            
            elif message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif message.get("type") == "video_ended":
                # Frontend notifies that video playback has completed
                if processing_task and not processing_task.done():
                    processing_task.cancel()
                    await websocket.send_json({
                        "message": "Detection stopped as video playback ended",
                        "severity": "info",
                        "type": "processing_complete"
                    })
            
    except WebSocketDisconnect:
        logging.info(f"Client disconnected: {connection_id}")
    
    except Exception as e:
        try:
            await websocket.send_json({
                "message": f"Error in WebSocket connection: {str(e)}",
                "severity": "error"
            })
        except:
            pass
        logging.error(f"WebSocket error: {str(e)}")
    
    finally:
        if connection_id in active_connections:
            del active_connections[connection_id]
        
        if connection_id in processing_tasks:
            task = processing_tasks[connection_id]
            if task and not task.done():
                task.cancel()
            del processing_tasks[connection_id]
        
        if connection_id in detected_accidents:
            del detected_accidents[connection_id]
        
        if cap and cap.isOpened():
            cap.release()
        
        if video_temp:
            try:
                os.unlink(video_temp.name)
            except:
                pass

async def process_video_once(websocket: WebSocket, cap: cv2.VideoCapture, connection_id: str, total_frames: int):
    """Process the video only once rather than looping continuously"""
    frame_count = 0
    log_interval = 30
    found_accident = False
    
    try:
        await websocket.send_json({
            "message": "Starting one-time accident detection analysis",
            "severity": "info"
        })
        
        while cap.isOpened() and connection_id in active_connections and frame_count < total_frames:
            ret, frame = cap.read()
            
            if not ret:
                await websocket.send_json({
                    "message": "End of video reached, detection complete",
                    "severity": "info",
                    "type": "processing_complete"
                })
                break
            
            frame_count += 1
            
            if frame_count % 1 == 0:
                result = pipeline.process_frame(frame)
                
                if result == "Accident detected":
                    # Check if we've already detected an accident in this frame range
                    frame_range_key = frame_count // MIN_FRAMES_BETWEEN_DETECTIONS
                    
                    if frame_range_key not in detected_accidents[connection_id]:
                        detected_accidents[connection_id].add(frame_range_key)
                        found_accident = True
                        
                        boxes, class_ids, confidences = pipeline.model_trainer.detect_objects(frame)
                        accident_indices = [
                            i for i, (cls, conf) in enumerate(zip(class_ids, confidences))
                            if cls in pipeline.ACCIDENT_CLASS_IDS and conf >= pipeline.CONFIDENCE_THRESHOLD
                        ]
                        
                        if accident_indices:
                            confidence = float(confidences[accident_indices[0]])
                            
                            await websocket.send_json({
                                "accident_detected": True,
                                "frame_number": frame_count,
                                "confidence": confidence,
                                "message": f"Accident detected at frame {frame_count}",
                                "severity": "error",
                                "timestamp": datetime.now().timestamp()
                            })
            
            if frame_count % log_interval == 0:
                progress = min(100, int((frame_count / total_frames) * 100))
                await websocket.send_json({
                    "message": f"Processed {frame_count}/{total_frames} frames ({progress}%)",
                    "severity": "info",
                    "progress": progress
                })
            
            await asyncio.sleep(0.01)  # Prevent blocking
        
        # Send completion message
        if connection_id in active_connections:
            await websocket.send_json({
                "message": "Video analysis complete",
                "severity": "info",
                "type": "processing_complete",
                "accident_found": found_accident
            })
    
    except asyncio.CancelledError:
        if connection_id in active_connections:
            await websocket.send_json({
                "message": "Video processing cancelled",
                "severity": "info",
                "type": "processing_complete"
            })
    
    except Exception as e:
        logging.error(f"Error processing video: {str(e)}")
        if connection_id in active_connections:
            await websocket.send_json({
                "message": f"Error processing video: {str(e)}",
                "severity": "error"
            })

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    result = pipeline.process_frame(img)
    return JSONResponse(content={"result": result})

@app.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    contents = await file.read()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_path = Path(f"uploads/videoUpload_{timestamp}.mp4")
    video_path.parent.mkdir(parents=True, exist_ok=True)
    with open(video_path, "wb") as f:
        f.write(contents)
    pipeline.reset_state()
    result = pipeline.process_video(video_path)
    return JSONResponse(content={"result": result})