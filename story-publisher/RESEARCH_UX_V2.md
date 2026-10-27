# Nghiên cứu và nâng cấp Publisher — 23/10/2026

## Kết luận dựa trên tài liệu chính thức

1. Tài liệu Meta Postman `Get Access Tokens of Pages You Manage` mô tả `/me/accounts?fields=name,access_token,tasks` bằng User Access Token. Vì vậy bổ sung màn đọc danh sách, chọn Page và chỉ lưu token của Page được chọn. Phân trang bằng cursor trên host Graph cố định, không theo URL tùy ý từ response.
   https://www.postman.com/meta/facebook/request/bqfxwbp/get-access-tokens-of-pages-you-manage
2. Meta Reels Publishing là nhiều giai đoạn: khởi tạo → upload → finish → đọc trạng thái. Upload/finish success không đủ để khẳng định bài xuất bản. Giữ trạng thái checking đến publishing_phase.publish_status=published.
   https://github.com/fbsamples/Facebook-Reels-Publishing-API-Postman-Collection
   https://www.postman.com/meta/facebook/request/juhnm3q/4-publish-reel
3. Danh tính token, scopes được cấp, Page tasks và kết quả đăng thật là các loại bằng chứng khác nhau. Bản mới hiển thị từng loại; không biến kiểm tra /me thành cam kết quyền đăng. Scopes/tasks là snapshot lúc kết nối, không phải kiểm tra quyền liên tục. Không có scopes thì hiển thị “chưa có dữ liệu”.
4. Genlogin hỗ trợ Extensions và Start URL. Tiện ích hiện tại là launcher local, không phải trình điều khiển profile hoặc giải pháp lấy token từ cookie.
   https://docs.genlogin.com/group-profiles/extensions
   https://docs.genlogin.com/group-profiles/create-profile/overview

Trang developers.facebook.com/getting-started và error-handling trả 429 trong lần tra cứu này. Không suy diễn rằng đã đọc được nội dung đó; dùng collection chính chủ Meta/fbsamples và Postman Meta để xác minh luồng.

## Quyết định thiết kế (đánh giá của người triển khai)

- Sidebar cố định: Tổng quan / Kho / Lịch / Page / Kết nối. Mỗi màn phục vụ một bước công việc.
- Bảng tổng quan chỉ dùng số liệu thật từ SQLite, lịch 7 ngày và cảnh báo; chưa có Page thì hướng dẫn kết nối, không dựng dữ liệu minh họa như dữ liệu thật.
- Kho video có ảnh xem trước từ chính MP4, tìm theo tên/caption/file, lọc thiếu caption/chưa có lịch, 9 mục/trang. Chọn tất cả áp dụng trên kết quả lọc, số đã chọn luôn rõ ràng.
- Page giữ cấu hình riêng. Kết nối lại Page từ danh sách không ghi đè quốc gia/múi giờ/slots đã có.
- Lịch hỗ trợ danh sách/nhóm ngày, lọc Page/trạng thái/ngày và đổi giờ trước khi bắt đầu. Ngày lọc theo múi giờ máy; từng bài hiển thị giờ Page cùng nhãn múi giờ.
- Mất kết nối local đổi trạng thái sang đỏ; không tiếp tục hiển thị máy đang hoạt động như một xác nhận mới.
- Cài đặt bot riêng và giải thích kỹ thuật nằm trong phần mở rộng; các nút chính phục vụ tác vụ cụ thể.

## Bảo vệ dữ liệu và điều kiện thực tế

Sao lưu SQLite online trước migration. Thêm connection_json/connection_error theo cách additive. Giữ 20 video và cấu hình Telegram. User token dùng đọc danh sách, Page tokens chỉ nằm trong bộ nhớ phiên tối đa 10 phút trước khi lựa chọn; sau khi chọn, lưu mã hóa AES-GCM. Không trả token về UI. Chưa có OAuth Login vì cần Meta App/redirect cấu hình thật; giao diện không tạo nút Login giả.

Chưa có token Page của người dùng nên chưa nghiệm thu đăng thật. Không có thuật toán “giờ vàng” từ Insights; slots vẫn là lựa chọn thử nghiệm của người dùng. Lịch phụ thuộc máy bật, không ngủ, có mạng.

## Kiểm chứng

- 9/9 kiểm thử Node: parse TXT, mã hóa, DST hai chiều, tránh trùng slot, status published, Meta adapter, trạng thái kết nối, accounts pagination, tích hợp HTTP hoàn chỉnh.
- Kiểm thử HTTP tích hợp thêm discover/connect, che token khỏi response, giữ cấu hình Page cũ, từ chối Page ngoài phiên, đổi giờ hợp lệ/từ chối quá khứ, rồi đăng và bình luận/Telegram bằng mock.
- Kiểm tra trực tiếp UI: tìm Farmhand cho đúng 1/20 video; chọn kết quả lọc đúng 1; đổi quốc gia Pháp tự điền Europe/Paris; các màn Tổng quan, Kho, Kết nối hiển thị đúng dữ liệu thật.
