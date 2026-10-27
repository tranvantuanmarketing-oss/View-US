#!/bin/zsh
# ==============================================================================
# Kho Mẫu Reel v1.6 - Khởi Động Trên macOS
# ==============================================================================
cd "$(dirname "$0")" || exit 1

PORT=8088
echo "=========================================================="
echo "🎬 ĐANG KHỞI ĐỘNG KHO MẪU REEL STUDIO (PORT $PORT)..."
echo "=========================================================="

# Kiểm tra Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Chưa tìm thấy Node.js trên máy của bạn!"
  echo "👉 Vui lòng tải và cài đặt Node.js từ https://nodejs.org (khuyên dùng bản LTS)."
  echo "Nhấn Enter để thoát..."
  read
  exit 1
fi

# Mở trình duyệt sau 1 giây
(sleep 1 && open "http://localhost:$PORT") &

# Chạy server
node server.js
