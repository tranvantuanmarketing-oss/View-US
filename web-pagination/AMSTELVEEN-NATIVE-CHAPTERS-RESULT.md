# Amstelveen — 10 chapter độc lập trên Blogbio

Ngày chuyển: 27/10/2026 (giờ Việt Nam).

Link bắt đầu để gắn Facebook, giữ nguyên URL đã dùng:
https://thestory.danhngon.pro/blog/amstelveen-schenking-en-geheim

Đã chuyển sang Series 26 gồm 10 post/chapter thật. Chương 1 dùng post 87, giữ slug cũ; nội dung chỉ còn phần 1. Chương 2–10 là các post mới, có URL riêng, điều hướng Previous/Next và danh sách chapter do Blogbio sinh ra. Không đổi theme hoặc mã quảng cáo toàn website; không chỉnh các truyện khác.

Kiểm tra:
- 10 URL trả HTTP 200.
- Nội dung cả 10 chương khớp bản sao lưu sau chuẩn hóa khoảng trắng; không mất chữ.
- Mỗi trang chỉ chứa nội dung chương tương ứng; không còn 10 section ẩn/hiện trong bài Amstelveen.
- Đã bấm Next từ chương 1 sang URL riêng của chương 2.
- Chương đầu không có chương trước; chương cuối không có chương tiếp theo.
- Series đã public; các chapter không đưa riêng lên trang chủ/Top news.
- Phần 11 trong tài liệu nguồn chỉ có tiêu đề, không có nội dung: không tạo chương rỗng, không tự viết phần tiếp.

Tệp đối soát: amstelveen-native-chapter-links.json, amstelveen-native-verification.json.
Bản nội dung trước khi chuyển: amstelveen-original-10-parts-backup.json. Tài liệu Markdown gốc vẫn giữ nguyên.

## Quy trình đúng cho bài tiếp theo

Series → tạo hoặc chọn Series → Posts in series → Create chapter. Có thể dùng Analyze chapters với dấu CHAPTER X — Title rồi kiểm tra kỹ các chương trước Save. Description của Series chỉ là giới thiệu; nội dung từng chương nằm trong post riêng. Không dùng [STORY_PARTS] nếu mục tiêu là mỗi phần có trang độc lập.

Link hướng dẫn: https://adsconex.vn/blog/huong-dan-su-dung-tinh-nang-series-story-tren-blogbio-1

Lưu ý: video và hướng dẫn [STORY_PARTS] trước đây mô tả phương án JavaScript cũ, không phải quy trình native chapter mới. Tách URL không đảm bảo một lần chuyển chương luôn được tính lượt xem quảng cáo hay làm tăng RPM; còn phụ thuộc đo lường, consent, trình chặn và quảng cáo được phân phối.
