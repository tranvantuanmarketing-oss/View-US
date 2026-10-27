# 🎬 HƯỚNG DẪN SỬ DỤNG STORY VIDEO STUDIO (AUTO BATCH PRO)

Bộ công cụ tự động hóa kết xuất **Video Thẻ Chữ 9:16 (Reels/TikTok)** kèm **File TXT (Caption & Comment ghim)** hàng loạt, chuẩn 100% theo phong cách đối thủ để kéo traffic về Website Blog.

---

## 🚀 1. Cách Khởi Động Nhanh (1 Click)
1. Mở Terminal và chạy lệnh sau (hoặc click đúp file `run_studio.sh`):
   ```bash
   cd "/Users/tony/Downloads/View US/story_video_generator"
   ./run_studio.sh
   ```
2. Trình duyệt Chrome sẽ tự động mở trang Studio tại địa chỉ: `http://localhost:8088`.

---

## 👤 2. Kho 30 Avatar Pool (Tiết Kiệm 100% Token)
* **Ý tưởng:** Bên đối thủ yêu cầu nhân viên tạo trước khoảng 30 ảnh chân dung vuông (nam, nữ, trẻ, già, nhiều phong thái) lưu sẵn vào thư mục.
* **Cách hoạt động trong Tool:**
  * Toàn bộ avatar được lưu tại thư mục: `story_video_generator/assets/avatars/`.
  * Tool đã nạp sẵn **hơn 20 avatar chân dung quý phái, doanh nhân, quân nhân, người mẹ...** độ phân giải cao.
  * Bạn có thể ném thêm bất kỳ ảnh chân dung vuông `.jpg` hoặc `.png` nào vào thư mục này.
  * Tool có 2 chế độ:
    1. **Tự động bốc ngẫu nhiên (Khuyên dùng):** Mỗi câu chuyện trong batch sẽ tự lấy 1 avatar khác nhau, tạo cảm giác mạng xã hội thật với nhiều người dùng khác nhau.
    2. **Chọn cố định:** Chỉ định 1 avatar riêng cho toàn bộ video.

---

## 🎵 3. Kho Nhạc Nền (Acoustic & Piano Không Bản Quyền)
* Nhạc nền được lưu tại thư mục: `story_video_generator/assets/audio/`.
* Tool đã trích xuất sẵn 3 bản nhạc acoustic/piano chuẩn từ video gốc của đối thủ.
* Thời lượng video: Tùy chọn 15s hoặc 20s (thời lượng vàng để giữ chân người xem 100% và Facebook phân phối mạnh).

---

## 🎨 4. 3 Themes Chuẩn Đối Thủ
1. **🌸 Thẻ Trắng Nền Hồng (`the-trang-hong`):** Nền pastel hồng tím, nút kêu gọi màu tím hồng, các câu kịch tính highlight màu xanh navy đậm.
2. **📜 Thẻ Trắng Font Serif (`the-trang-serif`):** Font chữ cổ điển trang nhã, nút màu đỏ rượu vang, hợp với truyện sâu lắng, bí mật gia tộc.
3. **☀️ Thẻ Trắng Nền Vàng (`the-trang-vang`):** Nền pastel vàng kem ấm áp, nút viền tinh tế, highlight màu xanh dương.

---

## 📝 5. Quy Trình Sản Xuất Hàng Loạt (Batch Workflow)
1. **Dán danh sách câu chuyện** vào ô `Danh Sách Kịch Bản Hàng Loạt`.
   * Tool có sẵn các nút nạp kịch bản mẫu tiếng **Pháp 🇫🇷, Hà Lan 🇳🇱, Đức 🇩🇪** để bạn bấm thử ngay.
2. Kiểm tra giao diện qua màn hình **Xem trước thời gian thực (Live Preview)** ở bên phải.
3. Nhấn nút **"⚡ RENDER TOÀN BỘ VIDEO & FILE TXT"**.
4. Tool sẽ tự động:
   * Vẽ thẻ chữ, avatar, tick xanh, highlight sắc nét từng pixel ở kích thước 1080 x 1920.
   * Ghép nhạc nền trực tiếp.
   * Tải về từng cặp file: `story_X_[ten_nhan_vat].mp4` và `story_X_[ten_nhan_vat].txt`.
5. Đưa các cặp file này vào Extension **FB Scheduler** để tự động lên lịch đăng bài theo khung giờ vàng!
