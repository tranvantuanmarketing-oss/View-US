---
name: claude-blogbio-chapters
description: Chuẩn hóa truyện thành Series và Chapter riêng cho Blogbio, xuất nội dung dễ copy vào Create chapter và Analyze chapters. Dùng khi người dùng yêu cầu brief, định dạng hoặc xuất truyện nhiều trang cho Blogbio; không tự đăng bài hay thay đổi website.
---

# The Story — xuất truyện cho Blogbio Series / Chapter

## Mục đích và phạm vi

Viết hoặc đóng gói truyện theo yêu cầu của người dùng để nhập bằng luồng:
Series → tạo/chọn Series → Posts in series → Create chapter → Description → Analyze chapters → kiểm tra → Save.

Mỗi chương sau khi được CMS lưu phải là một bài/trang có URL riêng. Văn bản do Claude xuất không tự tạo URL hay tự xuất bản. Không dùng JavaScript chia phần, `[STORY_PARTS]`, `?part=`, mã HTML điều hướng hoặc nút Next tự viết.

Đây là quy tắc xuất bản cho web, không thay thế phong cách viết, story bible hoặc quy chuẩn nội dung người dùng đang dùng. Nếu quy chuẩn cũ xuất tiêu đề `## Deel N: ...`/`## Partie N: ...`, giữ bản thảo gốc nhưng chuyển **bản nhập CMS** sang `CHAPTER N - Tiêu đề`. Không sửa skill hoặc cấu hình khác. Brief được lưu làm tài liệu tái sử dụng, không phải huấn luyện lại mô hình hay bảo đảm nhớ giữa mọi cuộc chat.

## Đầu vào và tính liên tục

- Dùng thông tin đã có: Page, quốc gia/ngôn ngữ, cốt truyện hoặc bible, tổng số phần, caption/comment đã đăng nếu có.
- Chỉ hỏi phần còn thiếu ảnh hưởng đến bài. Không suy ngôn ngữ từ tên Page khi chưa rõ; không cố định danh sách Page trong skill này.
- Người dùng chỉ yêu cầu đổi định dạng: giữ nguyên nội dung, tên, thứ tự, tình tiết và kết thúc; không viết lại hay bổ sung phần mới.
- Người dùng yêu cầu truyện mới: giữ nhất quán tên, tuổi, quan hệ, thời gian, tiền tệ, địa điểm và bằng chứng. Không trình bày truyện hư cấu như vụ việc có thật đã được xác minh.
- Tổng số phần theo yêu cầu; chưa có thì hỏi. Không tự ép mọi truyện thành 10 phần.
- Khi thiếu chỗ trong một lượt, xuất trọn các chương đã viết và báo rõ tiến độ ngoài nội dung nhập. Không xuất chương chỉ có tiêu đề hoặc cắt câu giữa chừng. Chỉ gộp các phần đã hoàn chỉnh khi xuất bản cuối.

## Đầu ra: hai khối riêng để copy

### A. Thông tin Series — không dán vào nội dung chương

Trình bày ngoài khối nhập truyện, mỗi trường dễ copy riêng:

- **Title:** tiêu đề toàn bộ truyện, bằng ngôn ngữ mục tiêu.
- **Slug đề xuất:** chữ thường, không dấu, nối bằng gạch ngang. Là đề xuất, không phải URL đã tồn tại.
- **Description:** giới thiệu ngắn 2–4 câu, không kể toàn bộ các phần, không tiết lộ kết thúc nếu không được yêu cầu.
- **Số chương hoàn chỉnh / tổng dự kiến:** thông tin vận hành, không dán vào Description.
- Ảnh bìa hoặc prompt ảnh chỉ thêm khi được yêu cầu; để ngoài khối nhập chương. Không bịa link ảnh.

Nếu tạo file, dùng `<slug>-series.txt`. Nhãn trường có thể bằng tiếng Việt; giá trị Title và Description dùng ngôn ngữ của truyện.

### B. Nội dung nhập Chapter — một khối duy nhất

Xuất một khối văn bản thuần có nút Copy hoặc file UTF-8 `<slug>-chapters.txt`. Nội dung bắt đầu ngay bằng dòng tiêu đề chương đầu tiên; không có metadata Series, lời chào, báo cáo kiểm tra hoặc lời nhắc dán vào web.

Cấu trúc bắt buộc:

```text
CHAPTER 1 - Tiêu đề chương một

Nội dung đầy đủ của chương một.

Đoạn tiếp theo của chương một.

CHAPTER 2 - Tiêu đề chương hai

Nội dung đầy đủ của chương hai.

CHAPTER 3 - Tiêu đề chương ba

Nội dung đầy đủ của chương ba.
```

Ví dụ trên chỉ mô tả cấu trúc. Khi viết thật, thay toàn bộ câu mẫu bằng truyện đầy đủ; không giao dấu ba chấm hoặc chỗ trống làm nội dung hoàn chỉnh.

Quy tắc tương thích:

1. Mỗi tiêu đề nằm trên một dòng riêng, đúng dạng `CHAPTER N - Tiêu đề`; dùng số Ả Rập liên tiếp 1..N và dấu gạch ngang ASCII `-`.
2. Luôn giữ từ khóa `CHAPTER` bằng tiếng Anh để Analyze chapters nhận diện; **tiêu đề và thân truyện dùng ngôn ngữ mục tiêu**. Ví dụ: `CHAPTER 1 - La lettre du notaire`, `CHAPTER 1 - De verborgen brief`, `CHAPTER 1 - List od notariusza`.
3. Không thêm `#`, `##`, dấu **, hàng rào mã, JSON, YAML hay HTML vào file `.txt`. Nếu trình bày trong chat, hàng rào mã chỉ là vỏ để Copy, không thuộc dữ liệu nhập.
4. Một dòng trống sau tiêu đề, một dòng trống giữa các đoạn. Không tách một câu thành quá nhiều dòng.
5. Không lặp lại tiêu đề chương trong thân bài; không chèn thêm dòng bắt đầu bằng `CHAPTER số -` trừ ranh giới chương thật.
6. Không lẫn caption Facebook, Comment 1, prompt ảnh, bảng thống kê, checklist, lời giải thích hoặc URL giả trong khối này.
7. Các chương được gộp theo thứ tự, không chép lại bằng trí nhớ khi đã có file nguồn. Nếu có công cụ xử lý file, nối từ nguồn và kiểm tra không mất đoạn.
8. Nếu tiếp tục một truyện đã nhập: chỉ xuất những chương mới chưa có trên CMS, giữ số chương tiếp nối. Không bảo người dùng nhập lại toàn bộ làm trùng chương cũ. Bản tổng lưu trữ phải ghi rõ là bản tổng, không phải lô nhập thêm.

## Bố cục nội dung mỗi chương

Nếu người dùng chưa có quy chuẩn viết riêng, dùng cấu trúc mềm sau:

- Mở bằng hành động, lời thoại hoặc hệ quả nối từ chương trước; tránh tóm tắt lại dài dòng.
- Phát triển một diễn biến có ý nghĩa: xung đột, lựa chọn, bằng chứng hoặc phát hiện mới.
- Có giá trị đọc thực sự trong mỗi chương; không chia vụn chỉ để tăng số lần bấm.
- Chương chưa cuối: kết tại một bước ngoặt hoặc câu hỏi tự nhiên, không dùng cùng một mánh cliffhanger liên tục.
- Chương cuối: giải quyết mâu thuẫn chính và kết thúc thật; không hứa phần tiếp khi truyện đã hết.
- Độ dài theo brief nội dung hiện có. Nếu chưa quy định, có thể đề xuất 800–1.200 từ/chương; đây không phải giới hạn CMS hay điều kiện để có quảng cáo.

## Hướng dẫn giao cho người dùng sau khối nhập

Viết ngắn bằng tiếng Việt, nằm ngoài văn bản truyện:

1. Tạo Series: điền Title, Slug, Description của khối A; chọn ảnh rồi Save.
2. Chọn Series đó → biểu tượng danh sách → Create chapter.
3. Copy **chỉ khối B** vào Description. Bật Keep chapter name → Analyze chapters.
4. Kiểm tra đủ số chương, mở Edit để soát nội dung và tên. Có thể đổi tiêu đề hiển thị sang Deel / Partie / Część trong CMS sau khi tách; không cần đổi từ khóa trong file nguồn.
5. Chọn ảnh và Published theo nhu cầu, xem lại trước khi Save. Kiểm tra thứ tự; chỉ Save order nếu có đổi thứ tự.
6. Mở chương 1, thử Next Chapter và xác nhận URL/nội dung đổi theo chương. Sao chép **URL thật từ CMS** để gắn vào bài Facebook. Không tự tạo đường dẫn bằng suy đoán.

Không tuyên bố đã xuất bản, đã có quảng cáo hoặc bảo đảm doanh thu/pageview nếu chỉ mới xuất văn bản. Không tự mở admin để đăng khi người dùng chỉ yêu cầu viết hoặc định dạng.

## Kiểm tra trước khi giao

- Đủ số phần được yêu cầu cho lô này; số chương liên tiếp, không trùng, không rỗng.
- Mỗi chương có đúng một marker; không chứa tiêu đề giả làm phần mới.
- Khối Series tách khỏi khối Chapter; không có metadata/prompt/checklist lọt vào truyện.
- Nội dung nhất quán với bible, caption và các phần đã có; nếu chỉ chuyển định dạng, nội dung không bị sửa.
- Ngôn ngữ thân truyện đúng thị trường, từ khóa nhập vẫn là CHAPTER.
- Không gắn link chưa kiểm chứng, không nhận đã đăng khi chưa đăng.

Báo kết quả ngắn ngoài nội dung copy: “Đã xuất X chương hoàn chỉnh; lô chương A–B; dùng Analyze chapters để kiểm tra trước khi lưu.” Nếu còn thiếu phần hoặc phát hiện lỗi, ghi rõ, không gọi là bản hoàn tất.
