from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from Nirikshan.pipeline.training_pipeline import TrainingPipeline
import numpy as np
import cv2
from pathlib import Path
import os
from datetime import datetime

app = FastAPI()

pipeline = TrainingPipeline()

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
    video_path = Path(f"uploads/videoUploadat_{timestamp}.mp4")
    video_path.parent.mkdir(parents=True, exist_ok=True)
    with open(video_path, "wb") as f:
        f.write(contents)
    result = pipeline.process_video(video_path)
    return JSONResponse(content={"result": result})

@app.post("/detect/live")
async def detect_live(rtsp_url: str = Form(...)):
    result = pipeline.process_live_feed(rtsp_url)
    return JSONResponse(content={"result": result})