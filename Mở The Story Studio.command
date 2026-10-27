#!/bin/zsh
cd "$(dirname "$0")/reels-studio-v2" || exit 1
/usr/local/bin/node scripts/manage-local-service.cjs start || { echo 'Không khởi động được. Giữ cửa sổ này để xem lỗi.'; read; exit 1; }
open -a 'Google Chrome' 'http://localhost:3020/render'
