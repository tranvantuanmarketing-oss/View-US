#!/bin/bash
# SCRIPT KHỞI ĐỘNG STORY VIDEO STUDIO
cd "$(dirname "$0")"

PORT=8088
echo "=========================================================="
echo "🎬 ĐANG KHỞI ĐỘNG STORY VIDEO STUDIO TRÊN CỔNG $PORT..."
echo "=========================================================="

# Kill old process on port 8088 if exists
lsof -ti :$PORT | xargs kill -9 2>/dev/null

# Mở trình duyệt Chrome tự động
open "http://localhost:$PORT"

# Chạy server node với hỗ trợ Range stream video mượt mà
node server.js
