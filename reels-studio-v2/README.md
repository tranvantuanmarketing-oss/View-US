# Reels Studio V2 — Hệ Thống Sản Xuất Video Reels 9:16 Tự Động

> **Phiên bản:** 2.0.0  
> **Ngôn ngữ giao diện:** Tiếng Việt  
> **Mã nguồn & DB:** English  
> **Thư mục dự án:** `/Users/tony/Downloads/View US/reels-studio-v2`

---

## 1. Giới thiệu tổng quan

**Reels Studio V2** là hệ thống sản xuất video ngắn (Reels/Shorts 9:16) chuyên nghiệp cho các Page Facebook theo từng ngôn ngữ (`fr`, `nl`, `de`, `en`, `es`, `pl`, `it`, `vi`, `da`, `no`, `sv`, `fi`), vận hành theo mô hình hàng đợi phân tán gồm:
1. **Web App Quản Trị & Điều Phối (Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase)**:
   - Quản lý Page Facebook, phân quyền nhân viên (`admin` & `staff`).
   - Kho mẫu thẻ truyện (76 bố cục, 374 bảng màu nhúng từ công cụ cũ `kho-mau-v1.6.html`).
   - Kho Avatar nhận diện người kể chuyện với quy tắc tự động khớp theo giới tính & độ tuổi.
   - Kho âm thanh phân loại theo gu cảm xúc (Trầm, Nhẹ nhàng, Tươi sáng).
   - Quản lý hàng đợi lô dựng video (Batches) và thống kê hiệu suất.
2. **Render Helper Daemon (Node.js CLI daemon trong `/helper`)**:
   - Chạy trên máy tính PC/Mac của nhân viên, nhận tác vụ qua giao thức claim/report.
   - Dựng video MP4 chuẩn Full HD 1080×1920 (30fps) bằng Playwright Chromium headless + FFmpeg bundled, xuất trực tiếp về thư mục `~/Reels/<tên_lô>/`.

---

## 2. Tiến độ triển khai theo từng Phase

- [x] **Phase 1 — Nền tảng & Cài đặt Page (Foundation & Settings)**:
  - ✅ Xác thực và bảo mật phiên HMAC (`SESSION_SECRET`), phân quyền Admin vs Nhân viên.
  - ✅ Khởi tạo Database Schema chuẩn Supabase PostgreSQL (`supabase/schema.sql`) với RLS nghiêm ngặt.
  - ✅ Trích xuất toàn bộ 76 mẫu thẻ (374 bảng màu) từ `kho-mau-v1.6.html` với đầy đủ layers, màu sắc, hoa văn.
  - ✅ Trình xem trước Live Iframe tỉ lệ 720×1280 thu nhỏ pixel-perfect theo engine gốc.
  - ✅ Màn hình Cài đặt Page (Screen 6) gồm 3 bước chuyên sâu:
    1. **Mẫu thiết kế:** Phân họ bố cục, chọn mẫu, lướt bảng màu (‹ / ›), sửa toạ độ/màu lớp trực quan, chế độ "Soát chữ tràn".
    2. **Kho Avatar:** 22 mặt mẫu có sẵn, phân bổ nhân khẩu theo tháp tuổi (20–34, 35–49, 50–64, 65+), cảnh báo trùng page khác, nút nhờ AI điền tên bản địa.
    3. **Gu nhạc:** Chọn gu (Trầm, Nhẹ nhàng, Tươi sáng), nghe thử audio trực tiếp (HTML5 audio), thêm bài nhạc mới (tối đa 30MB).
  - ✅ Thanh tác vụ dính đáy (Sticky action bar) bảo lưu ngữ nghĩa Snapshot (bản chụp độc lập cho từng lô dựng mới, video cũ không bị ảnh hưởng).
  - ✅ Đã nghiệm thu thành công qua Browser Test subagent và vượt qua `npm run build` không lỗi.
- [ ] **Phase 2 — Kho thẻ & AI Card Writer (Cards)**:
  - Hàng đợi viết thẻ Claude API (`@anthropic-ai/sdk`, model `claude-opus-5-5`, structured output).
  - Nhập khẩu file định dạng `=== STORY ===`.
  - Màn hình Kho thẻ & Lấy thẻ cho Page.
- [ ] **Phase 3 — Render Helper Daemon (Video Generation)**:
  - Máy dựng CLI daemon, giao thức heartbeat & claim task.
  - Dựng MP4 1080×1920 kèm âm thanh fade và file phụ đề `.txt`.
- [ ] **Phase 4 — Thống kê & Kho Viral (Analytics & Viral Posts)**:
  - Ma trận thống kê nhân viên × ngôn ngữ × page × ngày.
  - Kho bài viết Viral (nhập tay/CSV/Meta Graph API có bản quyền).

---

## 3. Cấu trúc thư mục dự án

```
reels-studio-v2/
├── .env.example              # Mẫu biến môi trường (không chứa secret)
├── .env.local                # Biến môi trường chạy dev nội bộ
├── .gitignore                # Bảo vệ an toàn tuyệt đối các file .env và thư mục build
├── README.md                 # Hướng dẫn chi tiết bằng tiếng Việt
├── package.json              # Khai báo thư viện (Next.js 14, Tailwind, Lucide, Supabase, Anthropic)
├── tsconfig.json             # Cấu hình TypeScript
├── tailwind.config.ts        # Bảng màu Studio Dark Theme (#101216, #181b22, #f0b429)
├── next.config.mjs
├── supabase/
│   └── schema.sql            # Schema cơ sở dữ liệu PostgreSQL cho Supabase có RLS
├── public/
│   └── assets/
│       ├── avatars/          # 22 ảnh đại diện nhân vật trích xuất từ story_video_generator
│       ├── audio/            # Các bản nhạc mẫu (.mp4 audio)
│       └── backgrounds/      # Video nền phục vụ render
└── src/
    ├── app/
    │   ├── globals.css       # Token giao diện, thanh cuộn, hiệu ứng kính mờ
    │   ├── layout.tsx        # Shell ứng dụng chứa Header và NavTabs 8 màn hình
    │   ├── page.tsx          # Điều hướng mặc định về /settings
    │   ├── settings/
    │   │   ├── page.tsx      # Bảng danh sách Page kèm chỉ số sức khoẻ & nút Cài đặt
    │   │   └── [id]/page.tsx # Không gian làm việc 3 bước: Mẫu, Avatar, Gu nhạc
    │   ├── cards/            # Màn hình Viết thẻ, Kho thẻ, Lấy thẻ (Phase 2)
    │   ├── batches/          # Màn hình Lô video (Phase 3)
    │   ├── render/           # Màn hình Dựng video (Phase 3)
    │   ├── helpers/          # Màn hình Quản lý máy dựng (Phase 3)
    │   ├── stats/            # Màn hình Thống kê (Phase 4)
    │   └── api/              # Hệ thống API REST bảo mật kiểm tra session server-side
    │       ├── auth/         # /api/auth/session, /api/auth/switch
    │       ├── pages/        # /api/pages, /api/pages/[id], /api/pages/[id]/settings
    │       ├── templates/    # /api/templates
    │       ├── avatars/      # /api/avatars, /api/avatars/[id], /api/avatars/auto-fill
    │       └── music/        # /api/music
    ├── components/
    │   ├── Header.tsx        # Thanh tiêu đề, thông tin nhân viên, web domain, bộ chuyển vai trò
    │   ├── NavTabs.tsx       # Thanh điều hướng 8 màn hình Reels Studio
    │   ├── TemplateCard.tsx  # Thẻ xem trước mẫu 720×1280 real-engine kèm nút đổi bảng màu
    │   ├── TemplateEditorModal.tsx # Bộ chỉnh sửa lớp, toạ độ X/Y, màu sắc và soát chữ tràn
    │   ├── AvatarCard.tsx    # Thẻ nhân vật, giới tính Nữ/Nam, độ tuổi, cảnh báo đa page
    │   ├── MusicPlayer.tsx   # Trình phát nghe thử nhạc HTML5 có tag phân loại gu
    │   └── StickyActionBar.tsx # Thanh lưu cài đặt dính đáy nhận diện thay đổi tức thì
    ├── lib/
    │   ├── auth.ts           # Mã hoá & xác minh session HMAC-SHA256
    │   ├── types.ts          # Định nghĩa kiểu dữ liệu TypeScript
    │   ├── repository.ts     # Kho lưu trữ dữ liệu (tự động fallback lưu store.json khi chạy local)
    │   ├── templateRenderer.ts # Bộ biên dịch HTML/CSS template với fitBody và ngôn ngữ bản địa
    │   └── avatarMatcher.ts  # Thuật toán tự động khớp mặt nhân vật theo gợi ý của thẻ
    └── data/
        ├── templates.json    # 76 mẫu thiết kế gốc trích xuất từ kho-mau-v1.6.html
        ├── assets.json       # Ánh xạ asset nhúng sẵn (@@AV@@, @@CLIP@@, @@ANH@@)
        ├── languages.json    # Cấu hình 12 ngôn ngữ (FR, NL, DE, EN, ES, PL, IT, VI...)
        ├── groups.json       # Tên tiếng Việt các họ mẫu
        ├── initialAvatars.json # Dữ liệu khởi tạo 22 avatar
        └── initialTracks.json  # Dữ liệu khởi tạo các bài nhạc mẫu
```

---

## 4. Hướng dẫn chạy cục bộ (Local Development)

### 4.1. Yêu cầu môi trường
- Node.js >= 18.x (khuyến nghị Node 20+ hoặc 24.x).
- Trình quản lý gói `npm`.

### 4.2. Cài đặt các gói phụ thuộc
```bash
cd "/Users/tony/Downloads/View US/reels-studio-v2"
npm install
```

### 4.3. Cấu hình biến môi trường
File `.env.local` đã được tạo sẵn cho môi trường chạy thử nghiệm nội bộ:
```env
SESSION_SECRET="local-dev-secret-reels-studio-v2-hmac-key-982347"
NEXT_PUBLIC_APP_URL="http://localhost:3020"
CLAUDE_MODEL="claude-opus-5-5"
RENDER_HELPER_SECRET_SALT="local-dev-salt-render-helper-key-hash"
```
*(Khi kết nối Supabase thật, thêm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, và `SUPABASE_SERVICE_ROLE_KEY` vào file này).*

### 4.4. Chạy ứng dụng Next.js
```bash
npm run dev
```
Truy cập trình duyệt: **`http://localhost:3020`** (hệ thống tự động chuyển tiếp tới `/settings`).

### 4.5. Kiểm tra Build sản phẩm
```bash
npm run build
```

---

## 5. Cơ chế Bảo mật & Phân quyền (Security & Roles)

1. **Phiên đăng nhập có chữ ký bảo mật (HMAC-SHA256)**:
   - Thông tin phiên được lưu trong HttpOnly Cookie (`reels_studio_session`), có hạn sử dụng (7 ngày).
   - Server kiểm tra chữ ký số bằng hàm `verifySessionToken` tại tất cả các Private API Routes.
2. **Phân quyền người dùng**:
   - **Admin (Quản trị viên)**: Thấy và quản trị toàn bộ các Page, nhân viên, kho mẫu, kho nhạc và máy dựng. Header hiển thị: `Admin Hệ Thống · Admin · Toàn quyền quản trị`.
   - **Nhân viên (Staff)**: Chỉ thấy và tạo lô dựng cho các Page được gán quyền sở hữu (`owner_staff_id`). Header hiển thị: `Phan Hà · Nhân viên · bestnovel.danhngon.pro`.
   - **Bộ chuyển đổi vai trò (User Switcher)**: Tích hợp ngay trên góc phải Header, bấm vào để đổi ngay lập tức giữa tài khoản Admin và các Nhân viên mà không cần đăng nhập lại để phục vụ test nghiệm thu.
3. **Chính sách Supabase RLS (Row Level Security)**:
   - Toàn bộ các bảng trong `supabase/schema.sql` đều bật `ROW LEVEL SECURITY`.
   - Tuyệt đối không tạo policy công khai cho vai trò `anon` trên các bảng riêng tư. Máy chủ Next.js tương tác qua `service_role` key sau khi đã xác thực chữ ký phiên HMAC.

---

## 6. Hướng dẫn sử dụng Màn hình Cài đặt Page (Phase 1)

1. **Xem danh sách Page (`/settings`)**:
   - Xem tổng quan các trang Facebook đang quản trị (Vérités d'Hier, Gebroken Stilte...).
   - Quan sát nhãn trạng thái: **"Ổn"** (nếu chọn từ 1 mẫu và từ 10 avatar trở lên) hoặc cảnh báo màu cam nếu chưa cấu hình đủ.
   - Bấm **"+ Thêm Page"** để tạo trang mới (nhập tên và chọn ngôn ngữ bản địa).
   - Bấm **"Cài đặt"** để vào không gian thiết lập chi tiết.

2. **Bước 1: Mẫu thiết kế (`1 Mẫu`)**:
   - **Thanh menu trái:** Lọc theo họ bố cục (Thẻ màu + vệt tên, Ảnh sáng + khung kính, Giấy cũ / giấy rách, Thẻ trắng...). Chọn cỡ xem trước (Nhỏ / Vừa / To).
   - **Khung xem trước Live:** Hiển thị bài viết mẫu thực tế theo đúng ngôn ngữ của Page. Tự động áp dụng script co chữ `fitBody()` chống tràn viền.
   - **Đổi bảng màu:** Bấm nút `‹` hoặc `›` trên thẻ để lướt qua các biến thể màu của mẫu đó.
   - **Chọn mẫu:** Tick vào ô "Chọn mẫu này" hoặc tick "Chọn cả họ mẫu" ở đầu mỗi nhóm.
   - **Sửa mẫu trực quan:** Bấm **"Sửa"** để mở modal:
     - Chỉnh toạ độ X, Y, cỡ chữ, tỉ lệ scale của từng lớp (avatar, tên, thời gian, khối chữ, CTA).
     - Đổi màu sắc từng lớp hoặc màu toàn bộ thẻ.
     - Nút **"Bật soát chữ tràn"** để kiểm tra phản ứng của thẻ với một đoạn văn bản dài có nhiều từ phức tạp.

3. **Bước 2: Kho Avatar (`2 Avatar`)**:
   - Thư viện hiển thị 22 gương mặt với hình ảnh, tên gọi, nút gạt **Nữ / Nam** và ô nhập khoảng tuổi (`age_min` - `age_max`).
   - Huy hiệu cảnh báo **"Cũng dùng ở X page khác"** để tránh trùng lặp nhân vật giữa các Page cùng hệ thống.
   - Thanh thống kê phân bổ nhân khẩu học theo 4 nhóm tuổi: **20–34**, **35–49**, **50–64**, và **65+**.
   - Nút **"Nhờ AI điền tên, giới, tuổi"**: Tự động sinh tên người kể chuyện bản địa theo đúng ngôn ngữ của Page (ví dụ: tên Pháp cho page FR, tên Hà Lan cho page NL, tên Đức cho page DE) và phân phối độ tuổi cân bằng.

4. **Bước 3: Gu nhạc (`3 Gu nhạc`)**:
   - Chọn phong cách âm thanh: **Gu trầm** (drama, bi kịch), **Nhẹ nhàng** (tình cảm, sâu lắng), **Tươi sáng / Gu vui** (kết có hậu).
   - Danh sách bài hát chung: Bấm nút ▶ để nghe thử âm thanh trực tiếp trong trình duyệt.
   - Bấm **"+ Thêm track"** để thêm bài hát mới vào kho dùng chung.

5. **Lưu cài đặt & Snapshot Semantics**:
   - Khi có bất kỳ thay đổi nào chưa lưu, thanh dính đáy hiển thị huy hiệu màu cam **"Có thay đổi chưa lưu"**.
   - Bấm **"Hoàn tác"** để quay về trạng thái đã lưu gần nhất.
   - Bấm **"Lưu cài đặt"** để lưu vĩnh viễn cấu hình vào cơ sở dữ liệu. Cài đặt này chỉ áp dụng cho các lô dựng video mới sinh ra sau đó, các video đã lập trước đây giữ nguyên vẹn bản chụp (snapshot).

---

## 7. Kết quả Nghiệm thu Phase 1 (Acceptance Check)

Theo đúng yêu cầu của Prompt:
> *"✅ I can configure one page with 3 templates (all palettes), 20 avatars with gender/age, a music mood, and previews render exactly like my current tool."*

- Đã cấu hình Page `Vérités d'Hier` (Pháp) với 3 mẫu thiết kế đầy đủ các bảng màu.
- Đã kích hoạt 20 avatar gương mặt có đầy đủ phân loại giới tính Nữ/Nam và độ tuổi phân bổ.
- Đã chọn Gu âm nhạc "Nhẹ nhàng" và lưu cấu hình thành công vào hệ thống.
- Khung xem trước render 100% chính xác bằng chính HTML/CSS và engine gốc của tool cũ.

---

## 8. Việc cần làm tiếp theo (Next Steps)

1. Gửi lại kết quả này cho Claude / User kiểm tra và xác nhận nghiệm thu Phase 1.
2. Sau khi được duyệt, tiến hành sang **Phase 2 — Kho thẻ & AI Card Writer (Cards)**:
   - Tích hợp `@anthropic-ai/sdk` với Claude structured output.
   - Xây dựng parser nhập khẩu định dạng truyện `=== STORY ===`.
   - Xây dựng màn hình Kho thẻ và chức năng bốc thẻ tự động theo tỷ lệ chủ đề để sinh Lô video mới.
