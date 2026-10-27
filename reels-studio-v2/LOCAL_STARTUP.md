# The Story Studio — Chạy ổn định trên máy Mac

Mở bằng file **The Story Studio.command** trên Desktop hoặc **Mở The Story Studio.command** trong thư mục View US. Nút mở sẽ kiểm tra dịch vụ, khởi động nếu cần và mở Chrome tại http://localhost:3020/render.

## Dịch vụ nền

- macOS LaunchAgent: `com.thestory.studio`, tự chạy khi tài khoản macOS này đăng nhập, tự chạy lại khi tiến trình dừng.
- Server production chỉ nghe `127.0.0.1:3020`.
- Bản đang chạy nằm ở `.next-runtime`, độc lập với `.next` (development) và `.next-production` (build). Build mới không ghi đè file của server đang phục vụ.
- Supervisor kiểm tra `/api/health` mỗi 15 giây sau thời gian khởi động; sau 3 lần lỗi liên tiếp sẽ khởi động lại server qua launchd.
- Lô queued/running/interrupted được khôi phục khi dịch vụ lên lại: giữ video completed, đưa phần rendering/leased về pending rồi dựng tiếp.
- Giữ máy không ngủ tự động khi có lô render bằng caffeinate; kết thúc hàng đợi thì giải phóng. Đóng nắp máy, tắt nguồn, đăng xuất hoặc cưỡng bức sleep vẫn tạm dừng công việc.
- File media mới được phục vụ động, có HTTP Range cho phát/tua video và nhạc trong production.

## Lệnh trong reels-studio-v2

- `npm start` hoặc `npm run local:start`: bật/kiểm tra dịch vụ.
- `npm run local:status`: xem trạng thái.
- `npm run local:stop`: dừng dịch vụ đến khi mở lại hoặc đăng nhập lần sau.
- `npm run local:update`: build, tạo runtime mới rồi khởi động lại với bản mới. Chỉ cập nhật lúc không có lô đang chạy.
- `npm run dev`: dành cho sửa mã, không dùng làm cách mở tool hằng ngày.

Log: `~/Library/Logs/TheStoryStudio/server.log` và `error.log`.
Cấu hình dịch vụ: `~/Library/LaunchAgents/com.thestory.studio.plist`.
Token Telegram vẫn chỉ ở `.env.local`, không chép vào LaunchAgent hay shortcut.

## Kết quả kiểm tra 22/10/2026

- Production build thành công.
- Upload ảnh riêng theo page, upload nhạc chung, phát file mới sau startup: đạt.
- Mô phỏng kill server khi video 1 đã hoàn tất, video 2 đang dựng: dịch vụ tự khởi động lại, dựng xong video 2, đường dẫn và thời điểm hoàn tất video 1 giữ nguyên.
- Hai video mới phát được theo HTTP Range; ZIP tải thành công.
- Kết quả: `data/verification/local-recovery.json`, `recovery-output.zip`.
- Dữ liệu batch QA đã được dọn, giữ file đầu ra làm bằng chứng.
