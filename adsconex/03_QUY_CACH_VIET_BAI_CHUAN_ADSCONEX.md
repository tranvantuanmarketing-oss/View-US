# ✍️ QUY CÁCH VIẾT BÀI CHUẨN THUẬT TOÁN TỐI ƯU QUẢNG CÁO ADSCONEX
> **Áp dụng cho:** Toàn bộ đội ngũ Content Creator, Biên tập viên và Trợ lý AI sản xuất nội dung bài viết.  
> **Mục tiêu:** Tối đa hóa số lượng quảng cáo được chèn tự động trên mỗi bài, gia tăng chỉ số Impression, kéo dài thời gian đọc trang (Dwell Time > 30s) và tối đa hóa doanh thu CPM/RPM từ thị trường US/UK.

---

## ⚙️ 1. NGUYÊN LÝ HOẠT ĐỘNG CỦA THUẬT TOÁN CHÈN ADS TỰ ĐỘNG

* **Cơ chế quét nội dung của Adsconex:**
  Hệ thống mã nguồn của Adsconex phân tích văn bản theo thời gian thực (DOM Parser). **Cứ mỗi khi nhận diện đủ khoảng 70 từ (words), hệ thống sẽ tự động tìm kiếm một điểm ngắt đoạn (thẻ `<p>` hoặc ngắt dòng) gần nhất để chèn vào 1 khối quảng cáo (In-article Ad Unit)**.
* **Hậu quả nếu viết đoạn văn dài:**
  Nếu bạn viết các đoạn văn dài gồm 3 – 5 câu dính liền nhau (khoảng 150 – 250 từ), hệ thống sẽ không thể can thiệp ngắt ngang giữa câu, dẫn đến việc bỏ qua các vị trí chèn quảng cáo tiềm năng. Bài viết 1.000 từ khi đó chỉ chèn được 3 – 4 ads thay vì 12 – 14 ads, làm **sụt giảm hơn 60% tổng doanh thu**!

---

## 🎯 2. BỐN NGUYÊN TẮC VÀNG TRONG ĐỊNH DẠNG BÀI VIẾT

### Nguyên tắc 1: Tách mỗi đoạn 1 câu duy nhất (Single-Sentence Paragraphs)
* **Quy chuẩn:** Mỗi câu đơn hoặc câu ghép độc lập phải được kết thúc bằng một dấu chấm `.` và lập tức xuống dòng mới (tạo thành một đoạn văn riêng).
* Không gom nhiều câu vào một khối văn bản.
* *Lợi ích:* 
  * Cực kỳ thân thiện với người dùng lướt điện thoại (Mobile UX): chữ thoáng, không bị ngợp thị giác.
  * Cung cấp vô số điểm ngắt thẻ `<p>` để thuật toán Adsconex tự do chèn quảng cáo mỗi khi đạt mốc 70 từ.

### Nguyên tắc 2: Tối ưu độ dài bài viết để tăng số lượng Ads & giữ chân độc giả
* **Độ dài tiêu chuẩn:** Từ **800 đến 1.500 từ/bài**.
* Với một bài viết dài 1.000 từ được ngắt dòng đều đặn:
  * Hệ thống sẽ chèn được từ **12 đến 14 khối quảng cáo**.
  * Độc giả cần từ **1.5 đến 3 phút** để cuộn hết trang, vượt xa tiêu chuẩn **30 giây tối thiểu** mà đối tác Adsconex yêu cầu.

### Nguyên tắc 3: Bố trí nhiều hình ảnh minh họa (Visual Pacing)
* **Số lượng ảnh:** Mỗi bài viết bắt buộc phải có từ **3 đến 5 hình ảnh minh họa** chất lượng cao trải đều từ đầu đến cuối bài.
* **Tác dụng:**
  * Giúp bài viết trực quan, sinh động như một cuốn tiểu thuyết hình ảnh.
  * Hình ảnh chiếm diện tích màn hình lớn, buộc độc giả phải cuộn liên tục (tăng Scroll Depth).
  * Giữ chân người đọc dừng lại ngắm nhìn nét mặt nhân vật, đẩy thời gian On-page lên cao.

### Nguyên tắc 4: Tuân thủ tuyệt đối chính sách an toàn nội dung (Safety Compliance)
> [!CAUTION]
> **Bộ lọc từ cấm và nội dung bị cấm tuyệt đối:**
> 1. **KHÔNG nội dung 18+:** Không cảnh nóng dung tục, không miêu tả tình dục trần trụi.
> 2. **KHÔNG từ ngữ cấm (N-words, Racial Slurs):** Tuyệt đối không dùng các từ ngữ miệt thị chủng tộc, da màu, tôn giáo hay nguồn gốc xuất thân.
> 3. **KHÔNG thù hằn & bạo lực đẫm máu:** Không cổ xúy bạo lực dã man, tra tấn, tự hại bản thân hoặc vũ khí nguy hiểm.
> 
> *Lý do:* Hệ thống bot của Google Ad Network và Adsconex quét từ khóa 24/7. Nếu phát hiện vi phạm, toàn bộ tên miền sẽ bị đưa vào danh sách đen (Blacklist), tắt hiển thị quảng cáo vĩnh viễn và bị hủy toàn bộ doanh thu chưa thanh toán.

---

## 📐 3. BẢNG SO SÁNH: VIẾT SAI VS VIẾT ĐÚNG CHUẨN ADSCONEX

````carousel
```markdown
❌ CÁCH VIẾT SAI (KHÔNG ĐẠT CHUẨN ADSCONEX):

When Edward opened the vintage mahogany desk that had belonged to his late grandfather, he never expected to find a hidden velvet compartment tucked beneath the third drawer. Inside lay a yellowed envelope bearing his name, sealed with blue wax that had cracked with age. His hands trembled as he broke the seal and pulled out the legal document dated thirty years ago, realizing that everything his wealthy relatives had told him about the family fortune was a calculated lie designed to steal his rightful share.
```
<!-- slide -->
```markdown
✅ CÁCH VIẾT ĐÚNG CHUẨN ADSCONEX (1 CÂU 1 ĐOẠN - CỨ 70 TỪ CHÈN 1 ADS):

When Edward pulled open the vintage mahogany desk in his late grandfather's study, the wooden runners groaned with age.

He had searched this room a dozen times before, but today was different.

Behind the third drawer, his fingers brushed against a cold brass spring.

With a soft click, a secret velvet compartment dropped down into his palm.

<!-- [ADS UNIT 1 TỰ ĐỘNG CHÈN TẠI ĐÂY KHI ĐỦ 70 TỪ] -->

Inside lay a heavy yellowed envelope sealed with faded blue wax.

The handwriting on the front was unmistakably his grandfather’s elegant cursive.

It was addressed directly to Edward, marked with the words: "To be opened only when the wolves come."

Edward's hands trembled as he slid his thumb beneath the ancient wax seal.
```
````

---

## 🏛️ 4. KHUNG CẤU TRÚC KỊCH BẢN BÀI VIẾT DRAMA 5 TẦNG (TIÊU CHUẨN US/UK)

Mọi bài viết trên blog hướng tới độc giả Mỹ và Anh nên tuân theo cấu trúc kịch tính sau:

1. **Tầng 1: The Cold Open (Mở đầu trực diện vào xung đột):**
   * Đưa ngay nhân vật vào một tình huống bất công hoặc sự kiện chấn động: Đám tang, phòng đọc di chúc, lễ cưới thượng lưu, căn gác bị niêm phong.
2. **Tầng 2: The Rising Tension (Sự kiêu ngạo của kẻ phản diện):**
   * Kẻ tham lam (mẹ kế, anh chị em họ ích kỷ, đối tác lừa lọc) buông lời nhạo báng, cho rằng nhân vật chính không xứng đáng nhận được bất cứ thứ gì.
   * Nhân vật chính giữ thái độ bình tĩnh, nhẫn nhịn.
3. **Tầng 3: The Discovery (Vật chứng hoặc bí mật lộ diện):**
   * Tìm thấy bức thư tay, cuộn băng cát-xét, chìa khóa két sắt ngân hàng Thụy Sĩ, hoặc sự xuất hiện bất ngờ của vị luật sư công chứng (*Notary/Attorney*).
4. **Tầng 4: The Stunning Twist (Cú lật ngược thế cờ):**
   * Sự thật được phơi bày trước mặt tất cả những kẻ chứng kiến: Kẻ tham lam bị tước quyền thừa kế hoặc đối mặt với pháp luật; người hiền lành, trung thực được trao toàn bộ tài sản thực sự.
5. **Tầng 5: The Moral Reflection (Thông điệp và bài học):**
   * Lời kết lắng đọng về lòng trung thực, danh dự và quy luật nhân quả, thôi thúc người đọc để lại bình luận và chia sẻ bài viết.
