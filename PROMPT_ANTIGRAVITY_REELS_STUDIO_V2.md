# PROMPT CHO ANTIGRAVITY — NÂNG CẤP TOOL LÀM VIDEO THÀNH "REELS STUDIO V2"

> Copy toàn bộ phần dưới đường kẻ, dán vào Antigravity. Làm lần lượt từng PHASE; mỗi phase xong phải đạt "Tiêu chí hoàn thành" rồi mới làm tiếp. Làm xong gửi lại Claude để kiểm tra.

---

You are upgrading my existing local video tool into **Reels Studio V2**: a web app + a local "render helper" that turns written story cards into 9:16 Reels videos, per Facebook Page, in batches, with a queue and live progress. It is modelled on a production system I use ("Hàng đợi Drama → Reels"); the feature list below is the spec.

## 0. Hard rules
1. New project folder: `/Users/tony/Downloads/View US/reels-studio-v2`. **Do not modify** `/Users/tony/Downloads/View US/story_video_generator` — read it and REUSE from it:
   - the template library and renderer: `kho-mau-v1.6.html` (99 card templates, palettes, layers `avatar/name/time/body/cta`), `studio_engine_v13.js` (canvas drawing, typography auto-fit, 720×1280 design grid scaled to 1080p/2K, music with fade, MediaRecorder MP4), `assets/avatars`, `assets/backgrounds`, `assets/audio`.
   - the story text format `=== STORY X ===` (Tác giả, Thời gian, Tên Page, Tiêu đề, Nội dung thẻ, Highlights, Nút CTA, Caption, Comment 1) — keep importing it.
2. No secrets in code. `.env.example` only; `.env*` git-ignored. Server-only keys never get a `NEXT_PUBLIC_` prefix.
3. Security (lessons from my previous project): signed expiring sessions (HMAC), every private API route checks the session server-side, Supabase RLS ON with NO anon policies on private tables (server uses the service-role key), never return success when the DB/API failed, no local-disk storage on Vercel, never fire-and-forget work after a serverless response.
4. **No Facebook scraping, no logging into Facebook with cookies/passwords, no headless browsing of facebook.com.** Viral posts come only from (a) manual paste/import by staff, or (b) the official Graph API when the Meta app has "Page Public Content Access". Design the "Kho Viral" importer so the data source is pluggable.
5. UI language Vietnamese; code/DB English.

## 1. Stack
- **Web**: Next.js (App Router, TypeScript, Tailwind) + **Supabase** (Postgres, Storage, Realtime).
- **Render Helper**: a Node.js (TypeScript) CLI daemon in `/helper`, runs on the staff member's Mac/Windows PC, renders with **Playwright Chromium (headless) running the existing canvas engine** + **ffmpeg** (bundled via `ffmpeg-static`, must work on macOS arm64/x64 and Windows), writes MP4 into a local folder `~/Reels/<lô>/`.
- **Card writer** (AI): Claude API via `@anthropic-ai/sdk` (env `ANTHROPIC_API_KEY`, `CLAUDE_MODEL=claude-opus-5-5`, structured output with `messages.parse` + `zodOutputFormat`; no `temperature`/`budget_tokens`; handle `stop_reason` `refusal`/`max_tokens`).

## 2. Roles
- **Admin**: everything, manage pages, staff, templates, music library, helpers of all staff.
- **Nhân viên (staff)**: sees only pages assigned to them; creates batches; registers their own render machines.
Header shows user name + role + their web (e.g. "Nhân viên · bestnovel.danhngon.pro").

## 3. Data model (create `supabase/schema.sql`)
- `staff` (id, name, email, role, web_domain), `pages` (id, name, locale `fr|nl|de|en|es|pl|it|…`, owner_staff_id, settings_json, created_at).
- `templates` (id, slug e.g. `the-vet-xanh-ngoc`, name, group e.g. "Thẻ màu + vệt tên", layers_json, palettes_json[]) — seeded from `kho-mau-v1.6.html`.
- `page_templates` (page_id, template_id, palette_ids[]) — selected templates per page.
- `avatars` (id, image_path, name, gender `nu|nam`, age_min, age_max, used_by_page_ids[]), `page_avatars` (page_id, avatar_id).
- `music_tracks` (id, file_path, title, mood `tuoi-sang|nhe-nhang|tram`, duration_sec), `page_music` (page_id, track_id) — empty = use whole library of the chosen mood.
- `viral_posts` (id, source, page_name, page_followers, locale, post_type `anh|bai-viet|video`, caption, image_url, comments, reactions, shares, posted_at, fb_url, has_web_link, imported_by, created_at).
- `cards` (id, locale, category, status `pending_write|ready|used|error`, source_viral_id, author_name, gender, age_hint, time_label, title, body (5 lines), highlights[], cta, caption, first_comment, avatar_hint, error, created_at) — "Kho thẻ".
- `batches` ("Lô video": id, name, page_id, staff_id, count, mode `system|json`, status `queued|rendering|done|failed|cancelled|requested`, done_count, settings_snapshot_json, helper_id, created_at, finished_at).
- `batch_items` (id, batch_id, seq, card_id, template_id, palette_id, avatar_id, track_id, status `queued|rendering|done|failed`, output_path, error).
- `helpers` ("Máy dựng": id, staff_id, name, key_hash, os, version, concurrency default 4, last_seen_at, cache_mb, revoked).
- `render_stats` view: videos done per staff × locale × page × day.

## 4. Screens (tab bar "Reels")
1. **Viết thẻ** — pick viral posts (or paste a story / import `=== STORY ===` files) → queue them for the AI card writer. Writer output per card: 5-line card body (14–20 words/line, line 5 ends on a cliffhanger "…"), 2–3 highlights, CTA in page language ("Continuer la lecture dans les commentaires", "Lees verder in de reacties"…), caption, first comment, narrator name/gender/age hint, category. Show counters "đang chờ máy viết X · lỗi Y" and a retry for errors.
2. **Kho thẻ** — library of all cards: filter chips by status (Chưa dùng / Đã dùng / Tất cả with counts), by language (with counts) and by category (with counts, e.g. "Ngoại tình · ly hôn", "Thừa kế · di chúc", "Bạo hành · kiểm soát"…). Card preview, edit, delete, bulk actions.
3. **Lấy thẻ cho page** — choose a page (chips with language) → choose N (preset 10/20/30/50 or custom) → system picks N **unused cards of that page's language**, honouring category mix → preview → "Tạo lô". Cards become `used`. Batch name auto: `{LANG}_{Tiếng …}_{Page}_{Staff}_{N}_{YYYYMMDD}`.
4. **Lô video** — table: name (+ page · language), source ("Dựng trên hệ thống" / "Xuất JSON"), status badge + "xong x/N", requested by, worker ("Máy Phan Ha" / "Máy bất kỳ" / "Admin"), card count, created at, actions: "Xem video" (opens the local folder list / downloads), "Tải JSON" (export batch as JSON for manual rendering), "Hoàn tất" button for JSON batches, auto-complete for system batches. Live progress via Supabase Realtime.
5. **Dựng video** — pick a batch → assign to "Máy bất kỳ" or a specific helper → start; shows per-item progress, failures with retry, ETA.
6. **Cài đặt page** — table of pages: language, number of templates, avatars ("33 mặt, tự khớp người kể"), music ("Gu trầm (243 bài)" / "259 track"), status "Ổn" or warnings, button "Cài đặt". Page settings screen with 3 steps and a sticky bottom bar "Không có thay đổi · Chỉ áp dụng cho lô dựng mới, video đã lập giữ nguyên" + "Hoàn tác" + "Lưu cài đặt" (settings are snapshotted into each batch at creation):
   - **1 Mẫu**: left sidebar = template groups with counts (search box, size filter "Vừa", "x/99 mẫu"), grid of live previews rendered with the real engine and sample text; each template shows its palettes with ‹ › ("xanh-bien · 1/3"), checkbox "Chọn mẫu này", "Sửa" opens an editor (colours, positions, drag & drop layers); "Chọn tất cả"; note "Đã chọn N mẫu (M bảng màu, video xoay vòng qua tất cả)". Advanced: filter by style, background variants, import template file, overflow check ("soát chữ tràn").
   - **2 Avatar**: drag & drop images or a whole folder (+ optional `avatar.csv`: file,name,gender,age_min,age_max); each face card has name, Nữ/Nam toggle, age range select, remove ×, warning "Cũng dùng ở: page khác"; filters Tất cả / Nữ / Nam / Chưa có giới-tuổi; age-bucket counts (20–34, 35–49, 50–64, 65+ per gender). Button "Nhờ AI điền tên, giới, tuổi cho cả thư mục" (Claude vision, names native to the page language). **Auto-match rule** at render: use the card's `avatar_hint` (gender + age) → pick a page avatar of the same gender whose age range contains the hint, least recently used; if none, nearest age; never two consecutive videos with the same face.
   - **3 Gu nhạc**: mood presets "Gu trầm", "Gu vui", "Tươi sáng/Nhẹ nhàng"; advanced list of the shared library (title, mood tag, duration, ▶ preview, checkbox, search, Chọn tất cả / Bỏ chọn); "Thêm một track vào kho chung (tối đa 30 MB)" adds to the library and to this page.
7. **Thống kê** — date range, language filter, page filter (searchable) → "Video dựng xong" matrix staff × language with totals, and a per-page table (page, language, staff, videos).
8. **Máy dựng** — "Máy dựng của tôi": machines with name, key suffix (…T75Q), Online/Offline (last seen), OS · helper version, cache MB, concurrency select (1–8) + "Lưu", "Cấp key mới", "Thu hồi". "Thêm máy": enter machine name → "Thêm máy" shows the key ONCE; copy-to-clipboard install commands:
   - macOS: `curl -fsSL {APP_URL}/api/v1/render/install/macos | bash`
   - Windows: `powershell -NoProfile -ExecutionPolicy Bypass -Command "irm {APP_URL}/api/v1/render/install/windows | iex"`
   The installer downloads the helper, asks for the key, stores it in the OS keychain/credential store (not plain text), and registers a login service (launchd / Task Scheduler).

## 5. Render helper protocol
- Auth: `Authorization: Bearer <machine key>` (server stores only a hash). Heartbeat every 30 s (`POST /api/v1/render/heartbeat` with version, os, cache, concurrency in use).
- Claim work: `POST /api/v1/render/claim?max=<concurrency>` → returns batch items with everything needed (card text, template+palette, avatar URL, track URL, output settings 1080×1920 30fps, duration). Lock items server-side so two machines never render the same item.
- Render each item with the existing engine in headless Chromium → MP4 (H.264 + AAC, music fade in/out) + companion `.txt` (Caption / Comment 1) → save to `~/Reels/{batch name}/{seq}_{slug}.mp4`.
- Report: `POST /api/v1/render/items/{id}/done` (duration, size, checksum) or `/failed` (error). Retry an item up to 2 times on the same machine, then release it.
- Concurrency changes from the web apply within ~30 s. Helper self-updates when the server advertises a newer version.
- Optional upload of finished MP4 to Supabase Storage (toggle per batch) so "Xem video" works from any device.

## 6. Kho Viral (input source, compliance-first)
- Grid of viral posts with image, "N comment", caption excerpt, page name · followers · language; detail drawer with full caption, "Mở bài trên Facebook", "Chép caption"; filters: date range, top N, sort (comments/reactions/shares), page language, post type (Ảnh/Bài viết/Video), follower range, min comments, page slug, "có link web", caption search; saved shortcuts ("Top 100 comment tuần này — page dưới 20k follower"); "+ Thêm nhanh vào hàng chờ" sends selected posts to Viết thẻ.
- Data comes from: manual add (paste URL + caption + stats), CSV import, or an adapter using the official Graph API (only if my Meta app has Page Public Content Access). Do NOT scrape.

## 7. Phases & acceptance
- **Phase 1 — Foundation & settings**: auth/roles, pages, template library seeded from `kho-mau-v1.6.html` with live previews, page settings (Mẫu / Avatar / Gu nhạc) with snapshot semantics.
  ✅ I can configure one page with 3 templates (all palettes), 20 avatars with gender/age, a music mood, and previews render exactly like my current tool.
- **Phase 2 — Cards**: Kho thẻ, import `=== STORY ===` files, Viết thẻ with the Claude writer queue, Lấy thẻ cho page → creates a batch.
  ✅ Import 15 stories → 15 cards ready → create a batch of 10 for a FR page; cards marked used.
- **Phase 3 — Render helper**: Máy dựng screen, installer, helper daemon, claim/report protocol, Lô video + Dựng video live progress, avatar auto-match, music rotation.
  ✅ A 10-item batch renders on my Mac with concurrency 4 into `~/Reels/<lô>/`, 1080×1920 MP4 with sound, correct avatar gender/age, status "xong 10/10".
- **Phase 4 — Stats & Kho Viral**: Thống kê, Kho Viral with manual/CSV import and filters.
- Every phase: `npm run build` + lint pass; README (Vietnamese) on running web + helper locally and deploying; summary of what works and what I must do by hand.
