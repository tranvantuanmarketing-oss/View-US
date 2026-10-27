# Hẹn lịch Meta — pilot 26/10/2026

Phạm vi: Dernières Volontés (1335519456320008), Behind Estate Gates (492636187266260). Các Page khác giữ nguyên luồng local. API POST /api/meta-schedule với X-Story-Client: publisher, pageId và jobIds; chỉ nhận lịch scheduled chưa có video ID, còn ít nhất 20 phút. Không tự đổi giờ.

Giao diện: Page & khung giờ → thẻ của hai Page → Chuyển N lịch chờ sang Meta. Nút yêu cầu tải trước, không có nghĩa Meta đã xác nhận lịch. Bên dưới hiển thị từng video và thời gian VN, xác nhận Meta hoặc cần kiểm tra.

Luồng: chiếm job một lần → start → lưu video ID → upload → finish video_state=SCHEDULED + scheduled_publish_time Unix UTC → GET id,status,scheduled_publish_time → đối chiếu giờ → lưu remote_confirmed_at. Meta thực tế trả scheduled_publish_time dạng ISO có +0000, cũng hỗ trợ dạng Unix.

Jobs delivery_mode=meta không gọi finish PUBLISHED. Job sau xác nhận giữ trạng thái checking; trước giờ hẹn không tăng số lần thử. Đến giờ chỉ đọc trạng thái Meta; chỉ khi Meta xác nhận published mới báo đăng thành công và gửi Comment 1 như trước. Lỗi chuyển lịch vào review, không tự tải lại hoặc tự đổi thành đăng ngay.

Lưu ý:
- Sau khi Meta nhận lịch, máy tắt/mất mạng không ngăn Meta đăng. Nhưng Comment 1, Telegram và quét view vẫn cần máy chạy, nên không đảm bảo bình luận lập tức nếu máy tắt.
- Tạm dừng Page trên local KHÔNG hủy lịch đã gửi Meta. Muốn hủy/đổi lịch đã chuyển, thao tác trong Meta Business Suite và đối soát lại. Endpoint đổi/hủy local không cho thao tác job đã có video ID/checking.
- Chưa tự động chuyển các lô mới sang Meta; người dùng chọn nút chuyển khi cần. Chưa chuyển toàn hệ thống.
- Pilot chỉ chứng minh Meta đã nhận lịch. Chờ đến giờ xuất bản mới xác nhận trọn luồng đăng + Comment 1 + Telegram và đánh giá hiệu quả.
- Bài sát giờ dưới 20 phút giữ local và không tự dời giờ.
