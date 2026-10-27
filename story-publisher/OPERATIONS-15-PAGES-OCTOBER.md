# Kế hoạch sẵn sàng vận hành 15 Page — 26–31/10/2026

Múi giờ vận hành: Asia/Ho_Chi_Minh. Đây là kế hoạch và tiêu chí nghiệm thu, không phải xác nhận các hạng mục đã triển khai. Không tự tạo Page hoặc tự cấp quyền cho 6 Page chưa được chỉ định.

## Mục tiêu

15 Page được xác thực, chọn đúng ngôn ngữ/quốc gia, nối Studio và có khung giờ; đạt 75 video/ngày khi cả 15 Page được người dùng cho phép chạy 5 video/ngày. Dự trữ tối thiểu 15, mục tiêu 25 video chưa đăng/Page (3–5 ngày). Video đã đăng không tính tồn kho.

## Kiểm kê ngày 26/10

| Page | Video chưa đăng | Cần thêm để đạt 15 | Cần thêm để đạt 25 |
|---|---:|---:|---:|
| Behind Estate Gates | 2 | 13 | 23 |
| Cienie Spadku | 14 | 1 | 11 |
| Dernières Volontés | 11 | 4 | 14 |
| Gorzkie Dziedzictwo | 19 | 0 | 6 |
| Masques Tombés | 7 | 8 | 18 |
| Mroczne Dziedzictwo | 18 | 0 | 7 |
| Sekrety Rodziny | 19 | 0 | 6 |
| Ukryty Testament | 18 | 0 | 7 |
| Za Zamkniętymi Drzwiami | 18 | 0 | 7 |

Tại lần kiểm kê: 9 Page, 126 bài chờ, không có job failed/review/missed. Cần thêm 26 video để mọi Page hiện có đạt tối thiểu 15; thêm 99 để mỗi Page đạt 25. Sáu Page mới cần tối thiểu 90, mục tiêu 150 video. Đây là mức thiếu tại thời điểm kiểm kê; cộng bù số video tiêu thụ trong thời gian chuẩn bị.

## Tiến độ dự kiến

- 26/10: chốt 6 Page bổ sung và quốc gia/ngôn ngữ; ưu tiên tồn kho Behind Estate Gates, Masques Tombés; thiết kế bảng sức khỏe.
- 27/10: hoàn thiện bảng sức khỏe và log thời gian từng công đoạn; kiểm tra token/cảnh báo, tồn kho theo số ngày; kiểm thử bằng dữ liệu giả lập trước khi áp dụng.
- 28/10: kết nối thêm 3 Page khi có quyền và dữ liệu; kiểm tra nhận lô đúng Page, metadata, khung giờ và chống trùng. Thử đăng thật chỉ với video được người dùng duyệt.
- 29/10: thêm 3 Page còn lại nếu nhóm trước đạt tiêu chí; dự trữ ít nhất 15 video/Page; hoàn thiện sao lưu và bài thử phục hồi trong môi trường tách biệt.
- 30–31/10: giữ ổn định 15 Page, kiểm tra hai ngày vận hành; không phát hành bản thay đổi rủi ro sát giờ đăng. Không đạt thì ghi rõ nguyên nhân và chưa nghiệm thu.

## Hạng mục kỹ thuật cần triển khai và kiểm chứng

1. Bảng sức khỏe mỗi Page: token/kiểm tra gần nhất, tồn chưa đăng, số ngày dự trữ theo lịch thực, bài chờ, bài thành công, lỗi/đang đối soát, bài kế tiếp, lần quét views gần nhất.
2. Quan sát độ trễ: lưu giờ dự kiến, bắt đầu xử lý, Meta xác nhận, bình luận và Telegram; tách chờ hàng đợi/upload/xử lý Meta. Hiển thị P50/P95 và trường hợp chậm nhất; không cam kết Meta xử lý ngay.
3. Xử lý lỗi: retry có giới hạn và backoff; upload/finish không rõ kết quả phải đối soát trước, không tự đăng lại mù. Page lỗi không làm kẹt Page khác.
4. Token: kiểm tra không in mã, phân biệt expires_at=0 với quyền không thể thu hồi; cảnh báo thiếu quyền/hết hạn/bị thu hồi và không gửi cảnh báo lặp liên tục.
5. Tồn kho: dưới 15 cảnh báo cần bổ sung, dưới 5 khẩn, 0 hết; giữ cảnh báo <=3 hiện có cho đến khi thay thế có chống trùng. Mức tồn không được cộng video đã đăng/lưu trữ.
6. Lịch: xem trước toàn bộ 15 Page theo VN và địa phương; kiểm tra qua ngày/DST, không ghi đè bài đã đăng; lệch 5 phút giữa các Page trong nhóm tương ứng, phát hiện trùng thời điểm VN.
7. An toàn dữ liệu: sao lưu SQLite nhất quán + cấu hình mã hóa và khóa mã hóa bằng cơ chế bảo vệ riêng; kiểm tra phục hồi trên bản sao, tuyệt đối không chạy worker phục hồi với token thật.
8. Theo dõi tiến trình và máy chủ: dịch vụ tự khởi động, cảnh báo heartbeat cũ trên UI; kiểm tra mạng/ổ đĩa. Máy tắt hoặc mất mạng không thể tự gửi Telegram; cảnh báo mất máy độc lập cần dịch vụ ngoài.
9. Quét views: giữ quét toàn Page hàng giờ chỉ báo mốc 1k mới; báo cáo 5 video + bình luận lúc 07:00; theo dõi thời lượng/quota và lỗi từng Page.

## Tiêu chí nghiệm thu

- Đủ 15 Page được xác thực quyền đăng và bình luận; đúng định danh Studio/ngôn ngữ; có lịch được duyệt.
- Tối thiểu 15 video hợp lệ chưa đăng/Page, đủ caption/comment theo cấu hình; không chuyển chéo hoặc nhập lại lô cũ.
- Không đăng trùng/nhầm Page; lỗi trả về hiển thị rõ; không âm thầm bỏ bài.
- Mục tiêu vận hành: >=98% bài đến hạn được Meta xác nhận trong 15 phút, đo trên 48 giờ và báo cả tử số/mẫu số. Không xem tỷ lệ này là SLA Meta.
- Tất cả bài còn lại có nguyên nhân và hướng xử lý; không có lỗi chưa phân loại quá 30 phút trong giờ giám sát.
- Telegram thành công sau xác nhận Meta, bình luận được đối soát; quét 1k im lặng khi không có mốc mới.
- Bản sao lưu và phục hồi đã kiểm tra; mất mạng/khởi động lại không gây đăng trùng.

## Người dùng cần cung cấp

- Danh sách 6 Page mới: tên chính xác, quốc gia/ngôn ngữ, quyền quản lý; hoàn thành xác minh Meta nếu xuất hiện.
- Nội dung/video và quyền sử dụng nhạc/hình ảnh; chỉ định video được phép đăng thử thật.
- Duy trì máy bật, có mạng, không ngủ nếu chưa chuyển dịch vụ sang máy chủ 24/7.

Kế hoạch không tạo lịch tự nhắc hay tác vụ tự chạy của Codex; các phần kỹ thuật cần được thực hiện và nghiệm thu trong các phiên triển khai tiếp theo.
