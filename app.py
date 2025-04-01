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
import supervision as sv

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
tracker_instances: Dict[str, sv.ByteTrack] = {}
traces: Dict[str, Dict[int, deque]] = {}

MIN_FRAMES_BETWEEN_DETECTIONS = 30  
BUFFER_SIZE = 15 
POST_ACCIDENT_FRAMES = 15 
ACCIDENT_COOLDOWN_FRAMES = 90
ACCIDENT_STATE_DURATION = 120
TRACE_LENGTH = 30
MAX_TRACE_POINTS = 90
ACCIDENT_CLIPS_DIR = Path("accident_clips")
ACCIDENT_CLIPS_DIR.mkdir(exist_ok=True)

CLASS_NAMES = {
    0: "bike",
    1: "bike_bike_accident",
    2: "bike_object_accident",
    3: "bike_person_accident",
    4: "car",
    5: "car_bike_accident",
    6: "car_car_accident",
    7: "car_object_accident",
    8: "car_person_accident",
    9: "person"
}

VEHICLE_CLASS_IDS = [0, 4]
ACCIDENT_CLASS_IDS = [1, 2, 3, 5, 6, 7, 8]

@app.websocket("/ws/detect")
async def accident_detection_websocket(websocket: WebSocket):
    await websocket.accept()
    
    connection_id = f"conn_{id(websocket)}"
    active_connections[connection_id] = websocket
    detected_accidents[connection_id] = set()
    
    try:
        logging.info(f"Client connected: {connection_id}")
        await websocket.send_json({
            "message": "Connected to accident detection service",
            "severity": "info"
        })
        
        await websocket.send_json({
            "type": "ready",
            "message": "Backend ready for video processing",
            "severity": "info"
        })
        
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif data.get("type") == "process_video":
                video_url = data.get("video_url")
                if video_url:
                    await process_video_stream(websocket, video_url, connection_id)
    
    except WebSocketDisconnect:
        logging.info(f"Client disconnected: {connection_id}")
    
    except Exception as e:
        logging.error(f"Error in WebSocket: {str(e)}")
    
    finally:
        if connection_id in active_connections:
            del active_connections[connection_id]
        if connection_id in detected_accidents:
            del detected_accidents[connection_id]
        if connection_id in traces:
            del traces[connection_id]
        if connection_id in tracker_instances:
            del tracker_instances[connection_id]
        logging.info(f"Cleaned up connection: {connection_id}")

async def process_video_stream(websocket: WebSocket, video_url: str, connection_id: str):
    try:
        frame_buffers[connection_id] = deque(maxlen=BUFFER_SIZE)
        traces[connection_id] = {}
        
        tracker = sv.ByteTrack(
            track_activation_threshold=0.25,
            lost_track_buffer=30,
            minimum_matching_threshold=0.8,
            frame_rate=24
        )
        tracker_instances[connection_id] = tracker
        
        frame_count = 0
        accident_found = False
        in_accident_sequence = False
        post_accident_frame_count = 0
        last_accident_frame = 0
        in_accident_state = False
        accident_state_frames = 0
        
        if video_url.startswith('/'):
            video_path = f"d:/Nirikshan-AcciWatch/public{video_url}"
        else:
            video_path = video_url
            
        logging.info(f"Opening video from: {video_path}")
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise Exception(f"Could not open video file: {video_path}")
            
        original_fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        target_fps = min(original_fps, 24.0)
        frame_interval = 1.0 / target_fps
        
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        scale_factor = 1.0
        if width > 1280:
            scale_factor = 1280 / width
            width = 1280
            height = int(height * scale_factor)
        
        logging.info(f"Video opened: {width}x{height}, Original FPS: {original_fps}, Target FPS: {target_fps}")
        
        await websocket.send_json({
            "type": "video_info",
            "width": width,
            "height": height,
            "fps": target_fps,
            "original_fps": original_fps,
            "total_frames": total_frames,
            "message": f"Processing video at {target_fps} FPS ({width}x{height})",
            "severity": "info"
        })
        
        processing_time_avg = 0.0
        frame_times = []
        last_frame_time = asyncio.get_event_loop().time()
        
        box_annotator = sv.BoxAnnotator(
            thickness=2,
        )
            
        while cap.isOpened():
            batch_start_time = asyncio.get_event_loop().time()
            
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            
            if scale_factor < 1.0:
                frame = cv2.resize(frame, (width, height))
                
            frame_buffers[connection_id].append(frame.copy())
            
            boxes, class_ids, confidences = pipeline.model_trainer.detect_objects(frame)

            # If 'boxes' is a NumPy array, checking directly can cause truth-value errors.
            # Use size or shape explicitly, like this:
            if boxes is not None and hasattr(boxes, "shape") and boxes.shape[0] > 0:
                boxes_np = np.array(boxes, dtype=np.float32)
                confidences_np = np.array(confidences, dtype=np.float32)
                class_ids_np = np.array(class_ids, dtype=np.int32)

                detections = sv.Detections(
                    xyxy=boxes_np,
                    confidence=confidences_np,
                    class_id=class_ids_np
                )
                tracked_detections = tracker.update_with_detections(detections)
            else:
                tracked_detections = sv.Detections.empty()
            
            display_frame = frame.copy()
            
            accident_indices = []
            accident_detected = False
            
            if len(tracked_detections) > 0:
                for i in range(len(tracked_detections)):
                    track_id = tracked_detections.tracker_id[i]
                    if track_id is None:
                        continue
                        
                    class_id = int(tracked_detections.class_id[i])
                    confidence = float(tracked_detections.confidence[i])
                    
                    is_accident = False
                    for acid in ACCIDENT_CLASS_IDS:
                        if class_id == acid:
                            is_accident = True
                            break
                            
                    if is_accident and confidence >= pipeline.CONFIDENCE_THRESHOLD:
                        accident_indices.append(i)
                        accident_detected = True
                    
                    if track_id not in traces[connection_id]:
                        traces[connection_id][track_id] = deque(maxlen=MAX_TRACE_POINTS)
                    
                    bbox = tracked_detections.xyxy[i]
                    center_x = int((bbox[0] + bbox[2]) / 2)
                    center_y = int((bbox[1] + bbox[3]) / 2)
                    traces[connection_id][track_id].append((center_x, center_y))
        
            labels = []
            colors = []
            
            for i in range(len(tracked_detections)):
                track_id = tracked_detections.tracker_id[i]
                if track_id is None:
                    continue
                    
                class_id = int(tracked_detections.class_id[i])
                conf = float(tracked_detections.confidence[i])
                
                class_name = CLASS_NAMES.get(class_id, "Unknown")
                label = f"{class_name} {track_id}: {conf:.2f}"
                labels.append(label)
                
                is_accident = False
                for acid in ACCIDENT_CLASS_IDS:
                    if class_id == acid:
                        is_accident = True
                        break
                        
                if is_accident:
                    colors.append((0, 0, 255))
                elif class_id == 0:
                    colors.append((0, 165, 255))
                elif class_id == 4:
                    colors.append((0, 255, 0))
                else:
                    colors.append((255, 255, 255)) 
            
            vehicle_mask = []
            for i in range(len(tracked_detections)):
                c_id = int(tracked_detections.class_id[i])
                vehicle_mask.append(c_id == 0 or c_id == 4)
            non_vehicle_mask = [not vm for vm in vehicle_mask]

            non_vehicle_detections = tracked_detections[non_vehicle_mask]

            if len(non_vehicle_detections) > 0:
                box_annotator.annotate(
                    scene=display_frame,
                    detections=non_vehicle_detections)
            
            for track_id, trace_points in traces[connection_id].items():
                if len(trace_points) < 2:
                    continue
                
                track_class_id = -1
                for i in range(len(tracked_detections)):
                    current_track_id = tracked_detections.tracker_id[i]
                    if current_track_id is not None and int(current_track_id) == int(track_id):
                        track_class_id = int(tracked_detections.class_id[i])
                        break
                
                if track_class_id == 0 or track_class_id == 4:
                    color = (0, 165, 255) if track_class_id == 0 else (0, 255, 0)
                    points = np.array(list(trace_points), dtype=np.int32)
                    cv2.polylines(display_frame, [points], False, color, 3)
                    
                    if len(trace_points) >= 1:
                        end_pt = trace_points[-1]
                        cv2.circle(display_frame, end_pt, 5, color, -1)
                
                else:
                    is_accident = False
                    for acid in ACCIDENT_CLASS_IDS:
                        if track_class_id == acid:
                            is_accident = True
                            break
                            
                    if is_accident:
                        color = (0, 0, 255)
                        points = np.array(list(trace_points), dtype=np.int32)
                        cv2.polylines(display_frame, [points], False, color, 3)
                        
                        if len(trace_points) >= 1:
                            end_pt = trace_points[-1]
                            cv2.circle(display_frame, end_pt, 6, color, -1)
            
            if accident_detected and not in_accident_state:
                last_accident_frame = frame_count
                in_accident_state = True
                accident_state_frames = 0
                accident_found = True
                in_accident_sequence = True
                post_accident_frame_count = 0
                
                if accident_indices:
                    i = accident_indices[0]
                    confidence = float(tracked_detections.confidence[i])
                    class_id = int(tracked_detections.class_id[i])
                    class_name = CLASS_NAMES.get(class_id, "Unknown")
                    
                    await websocket.send_json({
                        "type": "accident",
                        "accident_detected": True,
                        "frame_number": frame_count,
                        "confidence": confidence,
                        "accident_type": class_name,
                        "message": f"{class_name} detected at frame {frame_count}",
                        "severity": "error",
                        "timestamp": datetime.now().timestamp()
                    })
            
            if in_accident_state:
                accident_state_frames += 1
                if accident_state_frames >= ACCIDENT_STATE_DURATION:
                    in_accident_state = False
            
            if in_accident_sequence:
                post_accident_frame_count += 1
                
                if post_accident_frame_count >= POST_ACCIDENT_FRAMES:
                    in_accident_sequence = False
                    frames_to_save = list(frame_buffers[connection_id])
                    clip_path = save_accident_clip(frames_to_save, connection_id, last_accident_frame)
                    
                    if clip_path:
                        await websocket.send_json({
                            "type": "clip_saved",
                            "message": f"Accident clip saved to {clip_path}",
                            "severity": "info",
                            "clip_path": str(clip_path)
                        })
            
            _, buffer = cv2.imencode('.jpg', display_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            encoded_frame = base64.b64encode(buffer).decode('utf-8')
            
            await websocket.send_json({
                "type": "frame",
                "frame": encoded_frame,
                "frame_number": frame_count,
                "timestamp": datetime.now().timestamp(),
                "display_time": frame_count / original_fps,
                "total_frames": total_frames,
                "progress": frame_count / total_frames if total_frames > 0 else 0
            })
        
            if frame_count % 30 == 0:
                await websocket.send_json({
                    "type": "progress",
                    "message": f"Processed {frame_count} of {total_frames} frames",
                    "severity": "info",
                    "frame_count": frame_count,
                    "progress": frame_count / total_frames if total_frames > 0 else 0
                })
            
            current_time = asyncio.get_event_loop().time()
            processing_time = current_time - batch_start_time
            frame_times.append(processing_time)
            
            if len(frame_times) > 10:
                frame_times.pop(0)
            processing_time_avg = sum(frame_times) / len(frame_times)
            
            elapsed = current_time - last_frame_time
            sleep_time = max(0, frame_interval - elapsed)
            
            await asyncio.sleep(sleep_time)
            last_frame_time = asyncio.get_event_loop().time()

        cap.release()
        
        await websocket.send_json({
            "type": "complete",
            "message": "Video processing completed",
            "severity": "info",
            "accident_found": accident_found,
            "total_frames": frame_count
        })
            
    except Exception as e:
        logging.error(f"Error processing video: {str(e)}")
        await websocket.send_json({
            "type": "error",
            "message": f"Error processing video: {str(e)}",
            "severity": "error"
        })

def save_accident_clip(frames, connection_id, frame_range):
    if not frames:
        return None
    
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = ACCIDENT_CLIPS_DIR / f"accident_{connection_id}_{frame_range}_{timestamp}.mp4"
        
        height, width = frames[0].shape[:2]
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, 5.0, (width, height))
        
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