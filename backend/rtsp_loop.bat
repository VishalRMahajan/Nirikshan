@echo off
cd /d C:\mediamtx
start "" mediamtx.exe
timeout /t 3 >nul  REM Waits 3 seconds to ensure the RTSP server starts
start "" ffmpeg -re -stream_loop 2 -i video.mp4 -c:v libx264 -preset ultrafast -tune zerolatency -b:v 2M -c:a aac -f rtsp rtsp://localhost:8554/mystream
pause
