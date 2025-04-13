from ultralytics import YOLO
import numpy as np
import logging
import torch
import cv2
import os

class ModelTrainer:
    def __init__(self):
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "model", "best.pt")
        logging.info(f"Loading YOLO model from {model_path}")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logging.info(f"Using device: {self.device}")
        self.model = YOLO(model_path).to(self.device)
        logging.info("Model loaded successfully")

    def detect_objects(self, frame):
        height, width = frame.shape[:2]
        new_height = (height // 32) * 32
        new_width = (width // 32) * 32
        resized_frame = cv2.resize(frame, (new_width, new_height))

        resized_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
        resized_frame = torch.from_numpy(resized_frame).permute(2, 0, 1).unsqueeze(0).float().to(self.device)
        
        resized_frame /= 255.0

        results = self.model(resized_frame)[0]
        boxes = results.boxes.xyxy.cpu().numpy()  
        class_ids = results.boxes.cls.cpu().numpy()  
        confidences = results.boxes.conf.cpu().numpy()
        return boxes, class_ids, confidences