# BẢN ĐẶC TẢ KỸ THUẬT & HƯỚNG DẪN TRIỂN KHAI: LỘ TRÌNH 1 (MVP)
## HỆ THỐNG VẬN HÀNH MEDIA OPS HUB & TELEGRAM BOT 24/7

---

### I. TỔNG QUAN HỆ THỐNG & MỤC TIÊU
- **Tên dự án:** `media-ops-hub` (Media Operations Command Center - Phase 1 MVP)
- **Mục tiêu:**
  1. Quản lý tập trung 4 Fanpage Facebook (2 Page Pháp 🇫🇷: *Masques Tombés*, *Dernières Volontés*; 2 Page Hà Lan 🇳🇱: *Verborgen Waarheden*, *Achter de Façade*).
  2. Quản lý kho kịch bản và video Reels với quy trình trạng thái: `DRAFT` ➔ `READY` ➔ `SCHEDULED` ➔ `PUBLISHED` ➔ `FAILED`.
  3. Quản lý kho link 185 bài viết trên website `thestorypress.online` để gắp link tự động gắn vào bình luận (Comment 1) kéo traffic.
  4. Tích hợp **Telegram Bot 24/7**: Thông báo ngay khi video xuất bản thành công/thất bại, báo cáo tổng kết tiến độ hàng ngày lúc 23:00, nhận lệnh tra cứu nhanh (`/status`, `/today`).
  5. Cung cấp REST API nội bộ để các tool tự động đăng bài (Python/Puppeteer/AdsPower) gọi lấy bài và cập nhật kết quả.

---

### II. TECH STACK ĐỀ XUẤT
- **Framework:** `Next.js 15` (App Router) + `TypeScript`
- **Styling & UI:** `Tailwind CSS` + `Lucide React` + `@shadcn/ui` components
- **Database & ORM:** `Prisma ORM` với SQLite (`file:./dev.db` cho dev nhanh cục bộ) hoặc PostgreSQL (`Supabase`)
- **Scheduler:** `node-cron` (xử lý tác vụ quét hàng đợi và gửi thông báo theo giờ)
- **Telegram Bot API:** Native Fetch HTTP request tới Telegram Bot API (không phụ thuộc package rườm rà)

---

### III. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```
media-ops-hub/
├── .env                              # Biến môi trường (Telegram Bot Token, Chat ID, DB URL)
├── prisma/
│   └── schema.prisma                 # Định nghĩa toàn bộ Database Schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── posts/route.ts        # API CRUD bài đăng
│   │   │   ├── queue/
│   │   │   │   ├── pending/route.ts  # Endpoint cho Tool Auto-post lấy video đến giờ đăng
│   │   │   │   └── callback/route.ts # Endpoint nhận kết quả đăng bài từ Tool
│   │   │   ├── telegram/
│   │   │   │   └── test/route.ts     # Endpoint test bắn thông báo Telegram
│   │   │   └── fanpages/route.ts     # API danh sách 4 Fanpage
│   │   ├── layout.tsx                # Layout chung có Sidebar điều hướng
│   │   ├── page.tsx                  # Dashboard tổng quan (Home)
│   │   ├── posts/page.tsx            # Trang Quản lý Bài đăng & Lên lịch
│   │   ├── fanpages/page.tsx         # Trang Quản lý 4 Fanpage
│   │   └── links/page.tsx            # Trang Quản lý 185 link bài viết blog
│   ├── components/
│   │   ├── Sidebar.tsx               # Thanh menu điều hướng
│   │   ├── StatCard.tsx              # Thẻ hiển thị chỉ số thống kê
│   │   └── PostFormModal.tsx         # Modal thêm bài đăng mới & hẹn giờ
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma Client singleton
│   │   └── telegram.ts               # Bộ hàm tiện ích gửi thông báo Telegram
│   └── cron/
│       └── scheduler.ts              # Worker chạy ngầm kiểm tra lịch đăng & báo cáo
└── package.json
```

---

### IV. CƠ SỞ DỮ LIỆU (PRISMA SCHEMA)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Quản lý Fanpage
model Fanpage {
  id          String   @id @default(uuid())
  name        String   // Tên page: Masques Tombés, Verborgen Waarheden...
  code        String   @unique // Mã định danh: fr_masques, nl_verborgen...
  country     String   // "FR" hoặc "NL"
  timezone    String   @default("Europe/Paris")
  fbPageId    String?  // ID page thật trên Facebook
  viaName     String?  // Tên Via đang cầm page
  status      String   @default("ACTIVE") // ACTIVE, DIE, RESTRICTED
  posts       Post[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 2. Quản lý Bài đăng Reels
model Post {
  id            String    @id @default(uuid())
  fanpageId     String
  fanpage       Fanpage   @relation(fields: [fanpageId], references: [id], onDelete: Cascade)
  title         String    // Tiêu đề truyện / tập video
  videoPath     String    // Đường dẫn file video trên máy hoặc URL
  caption       String    // Nội dung caption bài viết
  commentLink   String?   // Link thestorypress.online để thả comment 1
  scheduledAt   DateTime  // Thời gian hẹn đăng
  publishedAt   DateTime? // Thời gian thực tế đăng xong
  fbPostUrl     String?   // Link video Facebook sau khi đăng
  status        String    @default("READY") // DRAFT, READY, SCHEDULED, PUBLISHED, FAILED
  errorMessage  String?   // Ghi lại lỗi nếu fail
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 3. Kho Link Bài Viết Blog (thestorypress.online)
model BlogArticle {
  id          String   @id @default(uuid())
  title       String
  url         String   @unique
  lang        String   // "fr", "nl", "en"
  category    String?  // Romance, Mystery, Drama...
  clickCount  Int      @default(0)
  createdAt   DateTime @default(now())
}

// 4. Nhật Ký Lịch Sử & Lỗi (Audit Logs)
model SystemLog {
  id          String   @id @default(uuid())
  level       String   // "INFO", "WARN", "ERROR"
  module      String   // "TELEGRAM", "AUTOPOST", "CRON"
  message     String
  createdAt   DateTime @default(now())
}
```

---

### V. TÍCH HỢP TELEGRAM BOT (SRC/LIB/TELEGRAM.TS)

```typescript
// src/lib/telegram.ts
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    return data.ok;
  } catch (error) {
    console.error('[Telegram] Lỗi gửi tin:', error);
    return false;
  }
}

// Hàm gửi thông báo xuất bản video thành công
export async function notifyPostPublished(post: {
  pageName: string;
  country: string;
  title: string;
  commentLink?: string | null;
  fbPostUrl?: string | null;
}) {
  const flag = post.country === 'FR' ? '🇫🇷' : post.country === 'NL' ? '🇳🇱' : '🇺🇸';
  const message = `
✅ <b>[XUẤT BẢN THÀNH CÔNG]</b> ${flag}
📌 <b>Page:</b> ${post.pageName}
🎬 <b>Video:</b> ${post.title}
⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString('vi-VN')}
🔗 <b>Link kéo traffic:</b> ${post.commentLink || 'Không có'}
🌐 <b>Link Facebook:</b> ${post.fbPostUrl || 'Chưa cập nhật'}
  `.trim();

  return sendTelegramMessage(message);
}

// Hàm gửi cảnh báo lỗi đăng bài
export async function notifyPostFailed(post: {
  pageName: string;
  title: string;
  errorMessage: string;
}) {
  const message = `
🚨 <b>[CẢNH BÁO ĐĂNG BÀI THẤT BẠI]</b>
📌 <b>Page:</b> ${post.pageName}
🎬 <b>Video:</b> ${post.title}
❌ <b>Nguyên nhân:</b> <code>${post.errorMessage}</code>
🛠 <i>Vui lòng kiểm tra lại tài khoản hoặc công cụ tự đăng!</i>
  `.trim();

  return sendTelegramMessage(message);
}
```

---

### VI. API ENDPOINTS CHO TOOL TỰ ĐĂNG BÀI (AUTO-POST BRIDGE)

#### 1. `GET /api/queue/pending`
* **Mục đích:** Tool tự đăng gọi vào mỗi phút để lấy các bài có `status == 'SCHEDULED'` và `scheduledAt <= now()`.
* **Phản hồi mẫu:**
```json
{
  "hasPost": true,
  "post": {
    "id": "post-uuid-123",
    "pageCode": "fr_masques_tombes",
    "videoPath": "/Users/tony/Downloads/View US/videos/masques_ep1.mp4",
    "caption": "Le secret enfin dévoilé... #drama #suspense",
    "commentLink": "https://www.thestorypress.online/fr/masques-tombes-ep1"
  }
}
```

#### 2. `POST /api/queue/callback`
* **Mục đích:** Tool đăng xong (thành công hoặc thất bại) gửi callback về hệ thống.
* **Body gửi lên:**
```json
{
  "postId": "post-uuid-123",
  "status": "PUBLISHED", // hoặc "FAILED"
  "fbPostUrl": "https://www.facebook.com/reel/123456789",
  "errorMessage": null
}
```
* **Xử lý ngầm:** Hệ thống tự động cập nhật database sang `PUBLISHED` và gọi hàm `notifyPostPublished()` để bot Telegram báo ngay về máy bạn!

---

### VII. DỮ LIỆU KHỞI TẠO (SEED DATA CHO 4 FANPAGE)
Chạy script seed dữ liệu ban đầu cho 4 Page:
1. `Masques Tombés` - Code: `fr_masques` - Country: `FR` - Timezone: `Europe/Paris`
2. `Dernières Volontés` - Code: `fr_dernieres` - Country: `FR` - Timezone: `Europe/Paris`
3. `Verborgen Waarheden` - Code: `nl_verborgen` - Country: `NL` - Timezone: `Europe/Amsterdam`
4. `Achter de Façade` - Code: `nl_achter` - Country: `NL` - Timezone: `Europe/Amsterdam`
