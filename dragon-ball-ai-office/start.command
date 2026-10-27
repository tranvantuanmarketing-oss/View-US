#!/bin/bash
cd "$(dirname "$0")"
echo "🐉 Đang khởi động Vũ Trụ Ngọc Rồng - AI Office..."
(sleep 1 && open "http://localhost:8899") &
python3 -m http.server 8899
