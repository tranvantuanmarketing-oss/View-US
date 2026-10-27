# View US — bàn giao bản sửa Studio, 21/10/2026

## 2026-10-25: Page music shuffled independently of template mode

- Diagnosed the user's 20-item Cienie Spadku batch (`batch_1792904295281`): stored mode was `single`, which selected the same fixed music track for all 20 items despite 18 valid tracks in the page settings.
- `pageMusicPlan` uses a seeded shuffled deck, exhausts the pool before repeating, deduplicates file paths and avoids immediate repeats across deck boundaries. Preview and submit use the same plan; server recomputes it from the saved page pool and submitted seed. Stored item track IDs/paths stay stable on retry.
- Every selected-page mode now uses page music, including locked template mode. Free batches retain manual fixed-track control. Muted output clears track metadata/path; removed repository fallback to track_01. Added current-preview song label and shuffle button.
- Unit checks: 100 seeds with 18-track pools, empty/single/duplicate pools and deterministic preview/payload mapping. Live test covers 20 items/18 songs in page/single/custom modes, three actual 8-second videos with different audio, mute, free-batch manual track, retry and ZIP. Source tracks have quiet intros (first 1–2 seconds), so meaningful audio checks use 8-second outputs.
- Verification scripts: `scripts/verify-page-music.cjs`, `scripts/verify-page-music-live.mjs`. Artifacts/backup stored under `data/verification/page-music/`. Existing user batches are preserved; use a new batch to apply the new music assignments.
- Verified the user's new `batch_1792905519923` and `batch_1792905615194`: each 20-item batch contains 18 distinct songs, first 18 all distinct, zero consecutive repetitions. Decoded audio from the first three completed videos of the latter: three distinct PCM hashes. No changes made to their page playlist or original completed batch.

## 2026-10-25: Polish locale support (PL)

- Shared locale options in `src/lib/locales.ts` now drive Studio, Add Fanpage, cards and viral selectors, including Polski / Ba Lan. Locale aliases (PL, pl-PL, pl_PL, Polski, Polish, Ba Lan) normalize to pl on page create/update and template lookup.
- Free-batch and bulk-card imports detect Polish content conservatively, including decomposed Unicode; selected pages remain authoritative. Optional Locale/Language/Język fields survive TXT/JSON round trips, with Polish field aliases Autor/Treść/Opis/Komentarz 1. UTF-8 and UTF-16 remain supported.
- Preview and render use the same effective locale; empty name/time fields use localized defaults. Inline CTA spans inside template body text are preserved during replacement. Polish avatar names and PL statistics/filter added; ZIP companion TXT retains locale.
- Validation: `node scripts/verify-polish.cjs`, existing parser/page-config checks, typecheck and production build passed. 76 template localizations checked for placeholders/Polish CTA. `node scripts/verify-polish-live.mjs` passed live page create/update, card import, page priority, free-batch detection, real 2-second 1080x1920 render/full decode, ZIP/TXT Unicode preservation, PL statistics and cleanup.
- Evidence: `data/verification/polish/result.json`, `polish-1080p.zip`, `frame.png`, `fanpage-polish.png`. The QA page/card/batches were removed after testing; artifacts and a before-test SQLite backup remain. Managed local service updated to the rebuilt production runtime.

Ứng dụng: http://localhost:3020/render. Dùng một chủ, không cần đăng nhập. Server chỉ bind 127.0.0.1.

## Đã thực hiện trực tiếp

- Parser chung TXT/JSON: UTF-8 BOM, CRLF, nội dung/caption/comment nhiều dòng, lỗi thiếu body; import nhiều file, nối thêm, kéo thả và xuất TXT. Bản nháp nội dung khôi phục sau reload.
- Studio chọn N story, nhiều biến thể tùy chọn, thời lượng, 720/1080/1440, 24/30 FPS, volume/mute, video nền, nhạc. Mẫu/palette/avatar riêng từng bài; resolver chung cho cấu hình preview/payload.
- Chọn page kế thừa template pool/palette/avatar/overrides; lưu video defaults cho page. Không tự tạo page/domain mẫu mới; page cũ được giữ, lô tự do nội bộ không hiện như fanpage thật.
- Preview responsive đúng design 720×1280, modal vừa màn hình, highlight và CTA không lặp, play/pause/seek media trong iframe, nghe thử nhạc.
- Renderer bất đồng bộ: chụp lớp thẻ bằng Chrome ở độ phân giải xuất, composite cùng video nền bằng FFmpeg; đúng avatar, nội dung, highlights, palette, overrides, FPS, mute/volume và duration. Kiểm decode output trước hoàn tất. Thẻ tĩnh không còn bị cắt khi xuất.
- Hàng đợi local tuần tự để hạn chế tải máy. Cập nhật % từ FFmpeg, lưu DB, hủy, retry chỉ item lỗi/chưa xong; resume lô gián đoạn. Không còn chặn event loop bằng execSync.
- ZIP dùng web stream, từ chối thiếu MP4; có lựa chọn tải phần thành công. Kết quả gồm MP4/TXT/manifest.
- Thêm/xóa avatar, nhạc, video nền trong Kho tài nguyên tại Studio. Không xóa tài nguyên còn tham chiếu bởi page/batch. Xóa ảnh/nhạc khỏi kho giữ file gốc; nền chuyển vào data/asset-trash.
- Xóa lịch sử lô từ bảng batches (giữ file). Chặn xóa page có batch để không cascade mất lịch sử; chặn xóa lô đang hoạt động. Nút hoàn tất giả trong batch detail thay bằng dựng/thử lại thật.
- Stats dùng đúng cột SQLite, lấy locale snapshot cho lô tự do và lọc ngày theo giờ Việt Nam ở API. Củng cố lease token/owner/artifact cho helper callbacks.
- Bỏ engine lặp trong daemon cũ; script watcher gọi cùng worker local với Studio. Không cần chạy daemon để bấm dựng trong Studio.
- Telegram: sự kiện bắt đầu/hoàn tất lô được ghi outbox thật; sửa backoff, retry_after, timeout, sending lease, max-attempts và bỏ bot username giả. Chưa tự gửi trong kiểm thử.

## Đã kiểm tra

- `node scripts/verify-parser.cjs`: PASS BOM/CRLF/multiline/highlights/TXT roundtrip/JSON/thiếu body.
- `node scripts/verify-studio.mjs`: PASS validation, ZIP chưa sẵn sàng 409, render bất đồng bộ, progress, MP4 và ZIP.
- `QA_AUDIO=1 node scripts/verify-studio.mjs`: PASS video H.264 1080×1920, 30 FPS, đúng 3 giây, AAC stereo; muted test 720×1280, 24 FPS, đúng 2 giây và không audio.
- `node scripts/verify-controls.mjs`: PASS cancel/retry, callback xử lý nội bộ không tăng completed count lần nữa, thêm/xóa page QA; `--assets-only`: PASS multipart upload/list/delete avatar QA.
- Typecheck và production build (NEXT_BUILD_DIR=.next-production) PASS.
- Browser: nạp story US, preview đủ 9:16/highlights/CTA; reload khôi phục bản nháp.
- `data/verification/studio-e2e-audio.zip`, `studio-e2e.zip`: ZIP đã mở kiểm tra đủ manifest/MP4/TXT; JSON mô tả từng item bên cạnh. Ảnh preview: `data/verification/studio-preview.png`.
- Backup DB trước sửa nằm ở `data/backups/`. Các bản ghi QA do lượt sửa tạo đã dọn; giữ MP4/ZIP/qa-records.json làm bằng chứng. Không xóa page/domain/batch cũ của người dùng.

## Cách chạy

```sh
npm run dev
```

Bản production độc lập với thư mục dev:

```sh
NEXT_BUILD_DIR=.next-production npm run build
NEXT_BUILD_DIR=.next-production npm start
```

Dừng dev trước khi start production cùng cổng. Giữ server/máy đang chạy khi render. Sau khi server bị dừng giữa chừng, mở lô và bấm Tiếp tục/Thử lại; không cần dựng lại item đã xong. Tài nguyên media/Chrome/FFmpeg thiếu sẽ có lỗi thay vì tự lấy file khác.

## Giới hạn chưa được nghiệm thu toàn bộ

- Renderer hiện composite **một ảnh lớp thẻ** lên nền video. Animation CSS riêng bên trong template được chụp thành một thời điểm, chưa xuất chuyển động đầy đủ như renderer từng frame. Mẫu dùng clip nội bộ có thể khác phần chuyển động so với live preview; không ghi toàn bộ 76 template đã verified.
- Writer AI, Radar tự thu thập số liệu Facebook, tự đăng Page, kết nối GenLogin/ixBrowser chưa được triển khai/nghiệm thu trong lượt sửa Studio này. Các tab writer/pull đã chuyển tới form Cards tương ứng; writer AI tự chạy vẫn chưa có consumer.
- Telegram chưa có kiểm thử gửi thật khi thiếu token/chat; chưa có polling bot lệnh /status /queue. Outbox hiện có thể dispatch từ UI, không có tiến trình nền định kỳ 24/7.
- Chỉ nghiệm thu renderer trực tiếp trên Mac hiện tại; worker đa máy và Windows chưa chạy kiểm chứng.
- Preset page dùng video defaults trong overrides._video; Studio cho lưu, chưa có màn editor riêng cho toàn bộ video defaults trong workspace settings.
- Import thư mục avatar/CSV, metadata AI, thùng rác/khôi phục mọi loại đối tượng và tạo video animation theo frame còn ngoài phần đã xác minh.

Không dùng báo cáo 25/25 smoke-test cũ để kết luận hệ thống hoàn thiện 100%. Dữ liệu Facebook cần kết nối hợp lệ riêng, không thể suy ra chỉ từ tên page/domain.

## 2026-10-21: Single-user workflow and page assets
- Header is one horizontally scrollable row; uppercase bold navigation with active blue border; secondary NavTabs removed. Helpers and card-pull pages redirect to Studio/writer.
- Avatar uploads in page settings use multipart /api/assets with page_id, stored under assets/avatars/pages/<pageId>. Avatar owner_page_id is enforced in scoped listing, settings save, and batch creation. Existing selected shared avatars are cloned per page as metadata records to avoid cross-page edits; original media/history are preserved. DB backup before change: data/backups/before-page-assets-*.db.
- Music multipart uploads go to the shared library with selected mood and FFmpeg-probed duration; UI supports multiple images/music files, upload errors, delete buttons. Selected assets or historical batch references prevent deletion with an explanation.
- Writer TXT/JSON upload and card import use shared parseStories, preserving multiline video content, caption and comment aliases (CMT/Comment/pinned comment etc.).
- ZIP output uses matching MP4 and TXT basenames next to each other, including page/batch/sequence; item downloads offer both MP4 and TXT using the same basename. Export TXT has BOM and UTF-8 content/caption/comment. Manifest refers to exported names.
- Text contrast increased on light surfaces; template iframe styling remains independent.
- Validation: scripts/verify-page-workflow.mjs passes page-owned multipart upload, cross-page isolation/rejection, shared music mood/duration, multiline TXT import, ZIP MP4/TXT pairs; parser tests and TypeScript pass. ZIP evidence data/verification/paired-video-text.zip.

## 2026-10-22: Studio file import and page inheritance repair
- Missing restored batches (HTTP 404) clear only the obsolete studio.activeBatch key, stop polling, retain scripts, and show a separate informational notice. Completed batches also stop polling and release the active key; progress failures no longer overwrite file-import messages.
- Page selector is now first in Studio above the script source, with a descriptive label, loading state, remembered valid page, and page-settings link.
- Selecting a page switches to page mode and resets all video settings from that page (or fresh defaults), preventing duration/volume/background/track bleed from the preceding page. Music uses selected_track_ids or mood pool, rotates per video; preview audio and submitted payload use the same selection. Palette pools now rotate as well.
- TXT files decode UTF-8 BOM and UTF-16 LE/BE BOM. Single-story JSON objects and bracketed field headings supported. Repeated bare Comment 1 within a comment field is preserved as content.
- Validation: scripts/verify-studio-page-config.cjs and existing parser tests pass. Browser file chooser imported a 20-story UTF-16 fixture; all caption/comments retained. Browser selected a separate QA page and rendered one actual 2-second 720x1280/24FPS video with the page's template/palette/track and 30% volume. Output metadata verified in data/verification/studio-page-render-result.json; QA batch/page records removed afterward, original browser draft restored. Production build passed.

## 2026-10-22: Managed local production service
- Installed user LaunchAgent com.thestory.studio with RunAtLoad/KeepAlive, supervisor health checks and loopback-only production server. Desktop The Story Studio.command and workspace Mở The Story Studio.command start/check service before opening Chrome. npm start now uses the manager; next dev remains development-only.
- Active runtime .next-runtime is copied from a completed .next-production build, isolating live chunks from future builds.
- Instrumentation recovers unfinished local batches only in STORY_LOCAL_SERVICE=1 mode, retaining completed items. Caffeinate prevents automatic idle sleep during queued/rendering work only.
- Dynamic /assets/[...path] and /renders/[...path] routes serve files added after production startup, with byte ranges and root/extension checks. This fixes production public-file enumeration otherwise returning 404 for fresh uploads/renders.
- Actual SIGKILL test during item 2: launchd restarted server and queue completed, item 1 output/finished_at unchanged. Production upload/playback and ZIP tests passed. See LOCAL_STARTUP.md and data/verification/local-recovery.json.
