# Bài 6 — thử và triển khai nút chia phần

- Link thật: https://thestory.danhngon.pro/blog/amstelveen-schenking-en-geheim
- Ví dụ phần 2: https://thestory.danhngon.pro/blog/amstelveen-schenking-en-geheim?part=2#story-reader
- Admin bài: https://thestory.danhngon.pro/admin/posts/87/edit
- Series tự sinh: https://thestory.danhngon.pro/admin/series/26/edit (không công khai, không hiện trang chủ).
- Nguồn giữ nguyên: `1 Closed Doors (Pháp)/view story/bài 6.md`, ngôn ngữ nl.
- Có 10 phần có nội dung. Tiêu đề Deel 11 ở cuối nguồn không có nội dung nên không tạo phần trống, không viết tiếp.

## Cách hoạt động

Editor lưu một bài gồm 10 h2 và 9 dấu `<!-- pagebreak -->`. Inkitt không tự phân trang các dấu này trong thử nghiệm thực tế. Script `bai6-pagination.js` được gắn qua Settings → Body script và giới hạn đúng pathname bài này; các bài khác không bị chia lại.

Script tạo thanh Trước / số phần / Tiếp và 10 nút chọn phần ở trên và dưới nội dung. Link dùng `?part=N`, mỗi lần đọc chỉ hiện một phần bằng JavaScript. Đây là phân trang phía trình duyệt: server vẫn trả toàn bộ nội dung, không phải route `/part/N/` hay tối ưu tải từng phần ở backend. Khi tắt JavaScript, toàn văn vẫn đọc được. Không bảo đảm tăng thời gian đọc hoặc doanh thu quảng cáo.

Đã kiểm tra HTTP 200, chuyển 1 → 2 → 10, đúng một section hiện, phần cuối không có nút Next và không tạo Deel 11 rỗng. Không chỉnh bài cũ, quảng cáo, Analytics hoặc file nguồn.

## Khi sửa hoặc mở rộng

- Không xóa hay ghi đè Head script / ads.txt. Body script trước triển khai trống.
- Muốn áp dụng bài khác cần thêm đúng pathname và kiểm tra tiêu đề `Deel N:` cùng cấu trúc DOM trước; hiện không áp dụng toàn site.
- Nếu theme đổi, kiểm tra lại selector `.inkitt-reader__content.module-article-content__body`.
- Rollback: bỏ riêng script này khỏi Body script; nội dung bài vẫn còn nguyên và hiển thị toàn văn.
- Cần nội dung Deel 11 trở đi từ người dùng trước khi coi đây là truyện hoàn chỉnh.
