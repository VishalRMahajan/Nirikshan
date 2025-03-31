from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import json
import asyncio
import tempfile
import os
from datetime import datetime
from typing import Dict, Set, List, Deque
from collections import deque
import base64
from fastapi.responses import JSONResponse
from Nirikshan.pipeline.training_pipeline import TrainingPipeline
from Nirikshan.logger import logging
from pathlib import Path

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
detected_accidents: Dict[str, Set[int]] = {}  
frame_buffers: Dict[str, Deque] = {}  
MIN_FRAMES_BETWEEN_DETECTIONS = 30  
BUFFER_SIZE = 15 
POST_ACCIDENT_FRAMES = 15 

# Create accident clips directory if it doesn't exist
ACCIDENT_CLIPS_DIR = Path("accident_clips")
ACCIDENT_CLIPS_DIR.mkdir(exist_ok=True)

@app.websocket("/ws/detect")
async def accident_detection_websocket(websocket: WebSocket):
    await websocket.accept()
    
    connection_id = f"conn_{id(websocket)}"
    active_connections[connection_id] = websocket
    detected_accidents[connection_id] = set()
    frame_buffers[connection_id] = deque(maxlen=BUFFER_SIZE)
    
    try:
        logging.info(f"Client connected: {connection_id}")
        await websocket.send_json({
            "message": "Connected to accident detection service",
            "severity": "info"
        })
        
        await websocket.send_json({
            "type": "ready",
            "message": "Backend ready for frame processing",
            "severity": "info"
        })
        
        frame_count = 0
        accident_found = False
        recording_accident = False
        post_accident_count = 0
        accident_frames = []
        current_accident_range = None
        
        while True:
            message = await websocket.receive()
            
            # Handle text messages (control commands)
            if "text" in message:
                data = json.loads(message["text"])
                logging.info(f"Received text message: {data}")
                
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                
                elif data.get("type") == "video_ended":
                    # If we were recording an accident clip, finalize it
                    if recording_accident and accident_frames:
                        clip_path = save_accident_clip(accident_frames, connection_id, current_accident_range)
                        if clip_path:
                            await websocket.send_json({
                                "message": f"Saved accident clip to {clip_path}",
                                "severity": "info",
                                "accident_clip": str(clip_path)
                            })
                    
                    await websocket.send_json({
                        "message": "Video playback ended",
                        "severity": "info",
                        "type": "processing_complete",
                        "accident_found": accident_found
                    })
                    logging.info(f"Video ended notification from client {connection_id}")
                
                elif data.get("type") == "start_detection":
                    detected_accidents[connection_id] = set()
                    frame_buffers[connection_id].clear()
                    frame_count = 0
                    accident_found = False
                    recording_accident = False
                    post_accident_count = 0
                    accident_frames = []
                    current_accident_range = None
                    pipeline.reset_state()
                    
                    await websocket.send_json({
                        "message": "Started new detection session",
                        "severity": "info"
                    })
                    logging.info(f"Started new detection session for client {connection_id}")
            
            elif "bytes" in message:
                frame_count += 1
                
                try:
                    # Process frame data
                    frame_data = message["bytes"]
                    nparr = np.frombuffer(frame_data, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame is not None:
                        frame_buffers[connection_id].append(frame)
                        
                        if recording_accident:
                            accident_frames.append(frame)
                            post_accident_count += 1
                            
                            # If we've recorded enough post-accident frames, save the clip
                            if post_accident_count >= POST_ACCIDENT_FRAMES:
                                clip_path = save_accident_clip(accident_frames, connection_id, current_accident_range)
                                if clip_path:
                                    await websocket.send_json({
                                        "message": f"Saved accident clip to {clip_path}",
                                        "severity": "info",
                                        "accident_clip": str(clip_path)
                                    })
                                recording_accident = False
                                accident_frames = []
                                post_accident_count = 0
                                current_accident_range = None
                        
                        # Process frame with detection pipeline
                        result = pipeline.process_frame(frame)
                        
                        # Check for accident detection
                        if result == "Accident detected":
                            # Check if we've detected an accident in this frame range
                            frame_range_key = frame_count // MIN_FRAMES_BETWEEN_DETECTIONS
                            
                            if frame_range_key not in detected_accidents[connection_id]:
                                detected_accidents[connection_id].add(frame_range_key)
                                accident_found = True
                                current_accident_range = frame_range_key
                                
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
                                    logging.info(f"Accident detected for client {connection_id} at frame {frame_count}")
                                    
                                    # Start recording accident clip
                                    if not recording_accident:
                                        recording_accident = True
                                        post_accident_count = 0
                                        # Initialize with buffer frames (before accident)
                                        accident_frames = list(frame_buffers[connection_id])
                                        await websocket.send_json({
                                            "message": f"Recording accident clip starting at frame {frame_count}",
                                            "severity": "info"
                                        })
                    
                    if frame_count % 10 == 0:
                        await websocket.send_json({
                            "message": f"Processed {frame_count} frames",
                            "severity": "info",
                            "frame_count": frame_count
                        })
                
                except Exception as e:
                    logging.error(f"Error processing frame {frame_count}: {str(e)}")
                    await websocket.send_json({
                        "message": f"Error processing frame {frame_count}: {str(e)}",
                        "severity": "warning"
                    })
    
    except WebSocketDisconnect:
        logging.info(f"Client disconnected: {connection_id}")
    
    except Exception as e:
        logging.error(f"Error in WebSocket: {str(e)}")
        try:
            await websocket.send_json({
                "message": f"Error in detection service: {str(e)}",
                "severity": "error"
            })
        except:
            pass
    
    finally:
        if connection_id in active_connections:
            del active_connections[connection_id]
        if connection_id in detected_accidents:
            del detected_accidents[connection_id]
        if connection_id in frame_buffers:
            del frame_buffers[connection_id]
        logging.info(f"Cleaned up connection: {connection_id}")


def save_accident_clip(frames, connection_id, frame_range):
    """Save accident frames as a video clip"""
    if not frames:
        return None
    
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = ACCIDENT_CLIPS_DIR / f"accident_{connection_id}_{frame_range}_{timestamp}.mp4"
        
        # Get frame dimensions from first frame
        height, width = frames[0].shape[:2]
        
        # Create VideoWriter with correct frame rate
        # Changed from 15.0 to 5.0 to match frontend frame capture rate
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, 5.0, (width, height))
        
        # Write frames to video
        for frame in frames:
            out.write(frame)
        
        out.release()
        logging.info(f"Saved accident clip to {output_path}")
        return output_path
    
    except Exception as e:
        logging.error(f"Error saving accident clip: {str(e)}")
        return None


def base64_to_image(base64_string):
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]
    imgdata = base64.b64decode(base64_string)
    nparr = np.frombuffer(imgdata, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


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
    video_path = os.path.join("uploads", f"videoUpload_{timestamp}.mp4")
    os.makedirs("uploads", exist_ok=True)
    
    with open(video_path, "wb") as f:
        f.write(contents)
    
    pipeline.reset_state()
    result = pipeline.process_video(video_path)
    return JSONResponse(content={"result": result})
