import cv2
import collections
import os
from pathlib import Path
from datetime import datetime
from Nirikshan.components.model_trainer import ModelTrainer
from Nirikshan.logger import logging

class TrainingPipeline:
    CONFIDENCE_THRESHOLD = 0.85
    ACCIDENT_CLASS_IDS = {1, 2, 3, 5, 6, 7, 8}
    ACCIDENT_CLIPS_DIR = Path("accident_clips")
    ACCIDENT_IMAGES_DIR = Path("accident_images")
    ACCIDENT_CLIPS_DIR.mkdir(parents=True, exist_ok=True)
    ACCIDENT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    PRE_ACCIDENT_BUFFER_SIZE = 50
    MAX_CLIP_FRAMES = 300
    FPS = 30
    LOST_THRESHOLD = 15
    COOLDOWN_FRAMES = 50

    def __init__(self):
        self.model_trainer = ModelTrainer()
        self.frame_buffer = collections.deque(maxlen=self.PRE_ACCIDENT_BUFFER_SIZE)
        self.accident_active = False
        self.accident_clip_frames = []
        self.lost_counter = 0
        self.cooldown_frames = 0
        self.clip_index = 0
        self.accident_detected_in_video = False

    def save_video_clip(self, frames, filename):
        if not frames:
            return
        height, width, _ = frames[0].shape
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(filename, fourcc, self.FPS, (width, height))
        for f in frames:
            writer.write(f)
        writer.release()
        logging.info(f"Clip saved: {filename}")

    def save_annotated_image(self, frame, boxes, filename):
        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.imwrite(filename, frame)

    def process_frame(self, frame, save_image=True):
        self.frame_buffer.append(frame.copy())
        boxes, class_ids, confidences = self.model_trainer.detect_objects(frame)
        accident_indices = [
            i for i, (cls, conf) in enumerate(zip(class_ids, confidences))
            if cls in self.ACCIDENT_CLASS_IDS and conf >= self.CONFIDENCE_THRESHOLD
        ]
        accident_detected = len(accident_indices) > 0
        logging.info(f"Accident detected: {accident_detected}")

        if accident_detected and save_image:
            accident_boxes = [boxes[i] for i in accident_indices]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            accident_image_path = self.ACCIDENT_IMAGES_DIR / f"accident_image_{timestamp}.jpg"
            self.save_annotated_image(frame, accident_boxes, accident_image_path)

        if self.cooldown_frames > 0:
            self.cooldown_frames -= 1

        if accident_detected and self.cooldown_frames <= 0:
            if not self.accident_active:
                self.accident_active = True
                self.lost_counter = 0
                self.accident_clip_frames = list(self.frame_buffer)
                logging.info("Accident event started.")
            else:
                self.lost_counter = 0
            self.accident_clip_frames.append(frame.copy())
            if len(self.accident_clip_frames) >= self.MAX_CLIP_FRAMES:
                clip_filename = self.ACCIDENT_CLIPS_DIR / f"accident_clip_{self.clip_index:04d}.mp4"
                self.save_video_clip(self.accident_clip_frames, clip_filename)
                self.clip_index += 1
                self.accident_active = False
                self.accident_clip_frames = []
                self.cooldown_frames = self.COOLDOWN_FRAMES
        else:
            if self.accident_active:
                self.lost_counter += 1
                self.accident_clip_frames.append(frame.copy())
                if self.lost_counter >= self.LOST_THRESHOLD:
                    clip_filename = self.ACCIDENT_CLIPS_DIR / f"accident_clip_{self.clip_index:04d}.mp4"
                    self.save_video_clip(self.accident_clip_frames, clip_filename)
                    self.clip_index += 1
                    self.accident_active = False
                    self.accident_clip_frames = []
                    self.cooldown_frames = self.COOLDOWN_FRAMES

        return "Accident detected" if accident_detected else "No accident detected"

    def reset_state(self):
        """Reset all state variables for a new detection session"""
        self.frame_buffer.clear()
        self.accident_active = False
        self.accident_clip_frames = []
        self.lost_counter = 0
        self.cooldown_frames = 0
        self.accident_detected_in_video = False

    def process_video(self, video_path):
        self.reset_state()
        
        cap = cv2.VideoCapture(str(video_path))
        frame_index = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            result = self.process_frame(frame, save_image=False)
            if result == "Accident detected":
                self.accident_detected_in_video = True
            frame_index += 1
        cap.release()
        
        if self.accident_active and self.accident_clip_frames:
            clip_filename = self.ACCIDENT_CLIPS_DIR / f"accident_clip_{self.clip_index:04d}.mp4"
            self.save_video_clip(self.accident_clip_frames, clip_filename)
            self.clip_index += 1
        
        return "Accident detected" if self.accident_detected_in_video else "No accident detected"

    def process_live_feed(self, url):
        self.reset_state()
        
        cap = cv2.VideoCapture(url)
        if not cap.isOpened():
            return "Error: Could not open RTSP stream"
        
        frame_index = 0
        max_frames = 1000 
        
        while cap.isOpened() and frame_index < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            result = self.process_frame(frame, save_image=False)
            if result == "Accident detected":
                self.accident_detected_in_video = True
            frame_index += 1
        cap.release()
        
        if self.accident_active and self.accident_clip_frames:
            clip_filename = self.ACCIDENT_CLIPS_DIR / f"accident_clip_{self.clip_index:04d}.mp4"
            self.save_video_clip(self.accident_clip_frames, clip_filename)
            self.clip_index += 1
        
        return "Accident detected" if self.accident_detected_in_video else "No accident detected"