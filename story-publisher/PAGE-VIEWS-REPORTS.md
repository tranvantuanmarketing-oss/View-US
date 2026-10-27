# Báo cáo views Page

- Tổng quan → “Quét tất cả Page → Telegram” chạy chỉ đọc toàn bộ Page đã kết nối, không đăng video mới.
- Tự chạy 07:00 Asia/Ho_Chi_Minh mỗi ngày, chống lặp bằng ID ngày trong SQLite. Máy phải bật, có mạng và không ngủ đúng giờ; không tự chạy bù khi bỏ lỡ giờ này.
- Danh sách lấy từ Graph /{page_id}/videos, gồm video ngoài tool mà API cho phép truy cập. Phân trang theo cursor trên host cố định, giới hạn 10.000 video/Page; nếu chạm giới hạn hiển thị chưa đầy đủ.
- UI lưu và hiển thị views từng video đã quét. Telegram báo riêng từng Page và chi tiết video thuộc ngày đăng gần nhất theo giờ Việt Nam. Views là tổng tích lũy tại lúc quét, không phải lượng tăng trong ngày. Dữ liệu thiếu không thay bằng 0.
- Báo cáo được chia nhỏ vào outbox hiện có, tự retry Telegram theo cơ chế sẵn có. Quét hoàn tất không đồng nghĩa Telegram đã gửi xong; kiểm tra outbox.
- Các cảnh báo đăng thành công, gần hết kho, mốc 1.000 views và báo cáo tổng hợp tùy chọn vẫn giữ nguyên.
- Module: page-reports.mjs, meta.mjs, server.mjs; UI: public/ux.js và public/style.css. Studio chỉ đổi Header.tsx/globals.css, giữ nguyên gen tay và dữ liệu.
- Kiểm thử: npm test (35 ca); Studio npm run build:local thành công. Test thật ngày 26/10/2026 đọc đủ 5 Page và gửi thành công 6 phần báo cáo Telegram; không tạo bài Facebook.
