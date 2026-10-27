# Kho Mẫu Reel v1.6 - Story Video Studio (Local 8088) 🎬

Công cụ tạo video Facebook Reels / TikTok / Shorts chuẩn 9:16 chạy độc lập trên máy local với **đầy đủ 76 mẫu video** thịnh hành nhất kèm kho kịch bản, avatar và nhạc nền.

---

## 🌟 Tính Năng Nổi Bật
- **Đầy đủ 76 mẫu thiết kế:** Đa dạng phong cách (Thẻ màu + vệt tên, Ánh sáng + khung kính, Giấy cũ / rách, Thẻ trắng, Lá góc + pastel trời, Hoa rơi,...).
- **Chạy trực tiếp trên trình duyệt (Local 8088):** Không cần server ngoài, không cần database, kết xuất video trực tiếp bằng Canvas & MediaRecorder API.
- **Kho tài nguyên có sẵn:**
  - Kho video nền 9:16 phong phú trong `assets/backgrounds/`.
  - Kho avatar nhân vật chất lượng cao trong `assets/avatars/`.
  - Kho nhạc nền drama/cảm xúc trong `assets/audio/`.
- **Hỗ trợ tạo kèm file TXT:** Tự động tạo caption và comment 1 (ghim link kéo traffic về blog) cho từng video.

---

## 📌 Yêu Cầu Máy Tính
- **Node.js**: Phiên bản 18, 20 hoặc mới nhất (Tải tại [nodejs.org](https://nodejs.org) - bản LTS).
- **Google Chrome** hoặc trình duyệt nhân Chromium.

---

## 🚀 Cách Cài Đặt & Khởi Động

### 1. Tải source code từ GitHub
```bash
git clone https://github.com/tranvantuanmarketing-oss/story-video-generator.git
cd story-video-generator
```

### 2. Khởi động nhanh (Khuyên dùng)
- **macOS:** Click đúp vào file `start.command` (hoặc `run_studio.sh`).
- **Windows:** Click đúp vào file `start.bat`.

### 3. Khởi động qua dòng lệnh (Terminal / CMD)
```bash
node server.js
```
Trình duyệt sẽ mở tại địa chỉ: **`http://localhost:8088`**

---

## 📖 Hướng Dẫn Sử Dụng
Xem tài liệu chi tiết tại [HD_SU_DUNG.md](HD_SU_DUNG.md).
