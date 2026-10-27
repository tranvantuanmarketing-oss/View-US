# Tạo link truyện chia phần — The Story

> LƯU Ý 27/10/2026: hướng dẫn dưới đây là phương án JavaScript cũ, KHÔNG tạo trang nội dung riêng. Bài Amstelveen đã chuyển sang 10 chapter native. Muốn mỗi part là một trang riêng, dùng Series → Posts in series → Create chapter; xem `AMSTELVEEN-NATIVE-CHAPTERS-RESULT.md`. Không dùng mẫu [STORY_PARTS] cho yêu cầu này.

## Cách nhanh nhất cho bài mới

1. Vào https://thestory.danhngon.pro/admin/posts → **New post**. Chọn **Normal**.
2. Nhập Title. Đặt Slug ngắn, không dấu, dùng dấu gạch ngang. Slug quyết định link; bài đã chia sẻ thì không đổi Slug.
3. Trong ô nội dung chọn **Tools → Source code**. Mở file `MAU-DAN-VAO-SOURCE-CODE.txt`, sao chép mẫu và thay nội dung từng phần trước khi dán.
4. Giữ dòng `<p>[STORY_PARTS]</p>` ở đầu. Mỗi phần có tiêu đề H2, đánh số liên tục từ 1 và phải có nội dung. Tiếng Pháp dùng `<h2>Partie 1 : Tên phần</h2>`, Hà Lan dùng `Deel`, Ba Lan dùng `Część`, Đức dùng `Teil`, tiếng Anh dùng `Part`. Không để phần cuối chỉ có tiêu đề trống.
5. Bấm **Save** của cửa sổ Source code. Chọn trạng thái **Published** khi sẵn sàng; tùy chọn Show on home/Top news theo nhu cầu. Bấm **Save** của bài viết.
6. Bấm **View post**, thử phần 1 → 2 → phần cuối. Sao chép URL gốc `/blog/slug` để gắn Facebook. Không cần copy URL có `?part=2` trừ khi muốn dẫn thẳng phần 2.

Không cần sửa Settings hay tạo từng bài riêng cho từng phần. Nút Previous/Next và số phần tự xuất hiện với bài có marker đúng cấu trúc.

## Không muốn dùng HTML

Trong trình soạn thảo, gõ `[STORY_PARTS]` thành một đoạn riêng ở đầu bài. Dán nội dung, rồi chọn từng tiêu đề `Partie 1 : ...`, `Partie 2 : ...` và đổi định dạng thành **Heading 2**. Nội dung bên dưới để Paragraph. Các tiêu đề phải nằm trực tiếp trong nội dung, không lồng trong bảng hoặc block khác. Lưu và kiểm tra như trên.

## Sửa bài đã có link

Vào Posts, tìm bài rồi bấm biểu tượng bút chì. Không đổi Title/Slug/Series khi chỉ cần chia phần. Trong Source code thêm marker và chuẩn hóa tiêu đề H2; không viết đè hay rút gọn nội dung. Save rồi thử chính URL cũ. Nếu giao diện vẫn cũ, vào **Purge cache → Clear cache → xác nhận** rồi mở lại link bằng cửa sổ riêng tư.

## Lưu ý quản trị

- CMS hiện bật mặc định tạo Series; một bài có thể tự sinh Series. Khi lưu nháp, kiểm tra Series liên quan cũng không public nếu chưa muốn công khai.
- Cơ chế hiện tại chia hiển thị bằng JavaScript; server vẫn trả toàn bộ nội dung, không phải các trang backend độc lập. Khi tắt JavaScript, toàn bộ truyện vẫn đọc được.
- Không sửa Head script, ads.txt, hay mã quảng cáo để đăng truyện.
- Mẫu chỉ là khung; thay toàn bộ câu hướng dẫn bằng truyện trước khi Publish.

## Bài đã kiểm tra

https://thestory.danhngon.pro/blog/le-jour-de-ma-retraite-il-a-exige-la-moitie-de-tout-il-avait-oublie-un-contrat

Giữ nguyên URL. Hiện có 5 phần nội dung. Cuối bài nguồn có nhắc tiêu đề Partie 6 nhưng chưa có nội dung, nên không tạo nút phần 6. Không tự viết thêm hay xóa đoạn nguồn đó.

## Quay màn hình

Video hướng dẫn đã tạo: `HUONG-DAN-CHIA-PART.mp4` (1920×1080, khoảng 49 giây, chú thích tiếng Việt, không có lời thoại). Video ghi các khung hình thao tác thực tế của riêng tab trình duyệt để tránh lộ desktop, không phải quay toàn màn hình macOS. Phần admin dùng mẫu chưa lưu; không bấm Save bài để tránh xuất bản truyện thử. Phần kết quả ghi lại việc bấm nút trên bài tiếng Pháp đang hoạt động. Có file phụ đề rời `HUONG-DAN-CHIA-PART.srt` đi kèm.

Nếu tự quay, nhấn **Command + Shift + 5 → Record Selected Portion**, khoanh riêng vùng trình duyệt admin, tránh token/mật khẩu; Start, thao tác các bước trên và Stop trên thanh menu. Không quay phần Settings có dữ liệu nhạy cảm.
