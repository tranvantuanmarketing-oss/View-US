# Kiểm tra lại báo cáo 25/25 — 20/10/2026

## Kết luận

Chưa đạt nghiệm thu 100%. Có tiến triển thật: 9 trang trả HTTP 200, module Radar/Web & Page riêng, SQLite ở WAL, typecheck exit 0, preview đã nhận nội dung tiếng Anh. Nhưng còn lỗi chặn vận hành: render chưa có lớp thẻ, xác thực bị bỏ qua, thống kê lỗi runtime; writer và Telegram chưa hoàn chỉnh.

Đây là kiểm tra mã nguồn + trình duyệt + HTTP chỉ đọc + media metadata/ảnh trích. Không sửa mã app, không đăng Facebook, không gửi Telegram, không chạy worker trên dữ liệu đang dùng. Chưa chạy lại production build hoặc tạo lô end-to-end; không coi thông báo build trước đó là bằng chứng nghiệp vụ.

## Bằng chứng kiểm tra

- /render, /cards, /batches, /radar, /web-pages, /settings, /helpers, /stats, /viral: HTTP 200.
- GET /api/stats: **500**, `no such column: b.owner_staff_id`.
- GET /api/web-pages không cookie: **200, isAdmin=true**, trả 3 website.
- GET /api/cards, /api/radar, /api/writing-jobs, /api/telegram, /api/batches không cookie: **200**. Telegram `configured=false`.
- Video public `/renders/verify_test/test_render.mp4` không cookie: 200.
- `tsc --noEmit --incremental false`: exit 0.
- Chạy `node scripts/test_f01_f25.mjs` trong thư mục tạm với **bản backup SQLite độc lập**, src/node_modules/assets tham chiếu chỉ đọc, output render riêng: exit 0, **25 PASS**. Log: `test_suite_isolated.txt`. Không chạy trực tiếp trên DB chính vì F16 sửa display_name của page_us_01 và F14 ghi đè test_render.mp4.
- DB thật tại thời điểm đọc: batches=0, batch_items=0, writing_jobs=0, telegram_outbox=0. Điều này chưa chứng minh từng có render qua queue/daemon; file kiểm tra FFmpeg tồn tại là bằng chứng riêng.
- test_render.mp4: 513743 bytes, 2 giây, H.264 720×1280, AAC.
- sample_9_16.mp4: 1067146 bytes, 5 giây, H.264 720×1280, AAC.
- Ảnh ở giây 1: `test_render.jpg`, `sample_9_16.jpg` đều chỉ có nền video. Code daemon xác nhận không dựng text/template/avatar ở bất kỳ frame nào của luồng hiện tại.

## Phát hiện theo mức ưu tiên

### R01 — P0: MP4 chưa phải video thẻ theo mẫu đã chọn

`scripts/render_daemon.mjs:58–79`: chỉ chọn background, nhạc cố định music_1.mp4, scale/crop và encode 10 giây. Không gọi templateRenderer/canvas, không dùng template_id/palette_id/avatar_id, không vẽ nội dung/story/highlights/CTA lên video. Nội dung chỉ được ghi vào file TXT. `test_render.mp4` 2 giây được chính test F14 tạo trực tiếp bằng FFmpeg, không phải bằng luồng claim/render/complete của daemon.

**Sửa:** dùng renderer chung với preview, đóng băng config/snapshot, capture/composite layer và encode MP4. Kiểm thử đổi hai mẫu và hai nội dung phải tạo hình ảnh khác đúng theo preview. Kiểm tra output nhiều thời điểm và asset load, không chỉ kích thước file.

### R02 — P0: Không đăng nhập vẫn được xem như admin

`src/lib/auth.ts:121–138`: requireAuth() gặp request không session thì lấy admin đầu tiên trong DB. Đã tái hiện GET /api/web-pages không cookie trả isAdmin=true. Các API sử dụng helper này mất hàng rào đăng nhập. `api/auth/session` vẫn tự tạo session staff và `api/auth/switch` vẫn ký session theo staffId mà không kiểm quyền người gọi.

**Sửa:** bỏ fallback, không session -> 401, không quyền -> 403; đăng nhập thật, scope user/page/website ở API; role switch demo mặc định tắt. Không triển khai truy cập qua LAN/public khi lỗi này chưa được sửa.

### R03 — P1: Thống kê lỗi 500, không có số liệu thật hoạt động

`src/app/api/stats/route.ts:13–30` dùng owner_staff_id,total_items,completed_items,completed_at; schema batches thực tế dùng staff_id,count,done_count,finished_at. Chưa lọc quyền/ngày theo request. Typecheck/build không kiểm được SQL string nên vẫn có thể pass.

**Sửa:** đồng bộ cột schema, lọc phạm vi staff/page và ngày theo timezone, tính từ item verified completed. Test HTTP với DB rỗng, một batch hoàn thành và query date/locale/staff; không chỉ tìm chuỗi hardcode trong file.

### R04 — P1: Claim worker chưa cô lập theo chủ sở hữu/máy đích

`api/helpers/claim/route.ts`: chọn tất cả pending/expired leased items, không lọc batches.staff_id theo helper.staff_id hoặc target_helper_id. Chưa tính active leases để giới hạn tổng concurrency khi có nhiều request; daemon xử lý tuần tự bằng for-await và execSync nên concurrency trong UI không tương ứng thực thi.

**Sửa:** chỉ claim job đúng quyền/máy đích, kiểm số job đang giữ, lease owner và fencing token. Worker thực hiện pool theo concurrency, heartbeat riêng/renew lease và phục hồi crash.

### R05 — P0: Complete có thể báo xong khi chưa có file hoặc không có lease hợp lệ

`api/helpers/complete/route.ts`: chỉ so token nếu người gọi cung cấp token và item đã có token. Không bắt buộc token, không ràng helper giữ lease, không kiểm hết hạn; outputPath/outputVideoUrl có thể trống nhưng vẫn mark completed. Callback failure lặp có thể tăng failed_count nhiều lần. Completed item trả success trước kiểm lease.

**Sửa:** bắt buộc owner+token+lease còn hiệu lực, state transition nguyên tử; callback lặp idempotent cả success/failure. Xác minh artifact tồn tại/đúng media/checksum trước thành công; path phải trong output root được phép. Daemon phải kiểm HTTP status/body callback trước log đã báo hoàn tất.

### R06 — P1: Writer mới có hàng chờ, chưa thấy tiến trình viết

`api/viral` có enqueue; `api/writing-jobs` chỉ GET/PATCH retry. Tìm trong src/scripts chưa thấy consumer lấy pending job, gọi AI, validate output rồi lưu cards. Không thấy getUpdates/bot command consumer. DB writing_jobs rỗng ở lúc kiểm tra không thay thế được test end-to-end.

**Sửa:** writer daemon bền vững, claim/retry/structured output/review, gắn source-locale-card và history; thiếu API key phải báo chưa cấu hình. Test mock provider trước, test thật riêng khi cấu hình hợp lệ.

### R07 — P1: Telegram chưa đạt F25

API thực tế configured=false. enqueueTelegramNotification hiện chỉ được gọi từ endpoint test; chưa có callsite ở tạo/hoàn tất batch, worker offline hay writer ready/failed. Dispatcher không có process lịch riêng; SELECT không lọc next_attempt_at, không exponential backoff/retry_after, không timeout/claim tránh hai dispatcher gửi trùng. CASE kiểm attempts cũ có thể để pending khi đã tăng lên max_attempts, rồi SELECT bỏ qua mãi. Không thấy bot polling/allowlist/lệnh /status /queue /errors.

**Sửa:** outbox trong transaction nghiệp vụ, dispatcher có claim/schedule/backoff/429/dead-letter, bot polling riêng và quyền theo user/chat. Không hardcode botUsername khi chưa gọi getMe. Phân biệt code đã xong, đã cấu hình và đã gửi thử thật.

### R08 — P1: 25/25 PASS chưa kiểm tra đúng 25 nhóm chức năng

Ví dụ: F01 chỉ SELECT users/pages, không gọi API trái quyền; F08 chỉ đọc số job; F09 chạy regex tự viết ngay trong test, không gọi parser sản phẩm; F12 hash object mẫu, không tải JSON/ZIP từ API; F14 encode nền+nhạc và kiểm size, không dùng daemon hoặc template; F18/F21 tìm chuỗi trong code; F23 không gọi /api/stats nên không phát hiện 500; F25 chỉ insert/read/delete DB, không thử dispatch/429/allowlist. F15 không có batch vẫn PASS bằng lời mô tả.

**Sửa:** tách smoke/inventory khỏi integration/E2E. Không gán F-ID verified chỉ vì smoke pass. API/browser tests phải kiểm dữ liệu đầu vào/đầu ra, lỗi và quyền. Dùng DB test riêng tự tạo fixture; không sửa cấu hình page production để test.

### R09 — P1: Xuất video/download chưa đảm bảo file riêng tư và đầy đủ

Daemon viết vào public/renders nên MP4 được phục vụ trực tiếp bỏ qua ownership check ở API ZIP. Complete nhận đường dẫn tùy ý; download ZIP thêm file nếu exists mà không xác minh output root. Nếu file thiếu, ZIP vẫn có thể trả 200 chỉ gồm manifest/TXT. Đường dẫn tuyệt đối của máy được đưa vào manifest.

**Sửa:** artifact ngoài public, download auth đúng owner, canonicalize và allowlist root, xác minh tất cả output trước phát hành ZIP; manifest dùng artifact ID/relative path. Với helper máy khác cần upload/transfer artifact thật, không gửi path máy helper rồi mong server thấy file.

### R10 — P1: Studio chưa dùng cùng cấu hình cho preview/render

Studio vẫn hardcode music_track_id=track_01 và background 2.mp4. Preview random và payload submit chưa có resolver chung. Browser đã thấy body tiếng Anh đúng (tiến triển thật), nhưng còn CTA trong body `Read Continuation In Caption` và CTA riêng `Continue reading in the comments`, cần chốt một vị trí CTA và bỏ trùng.

**Sửa:** shared resolver có seed, snapshot có asset/version/locale, đúng track/avatar/palette và display_name; test pixel/screenshot tương ứng với output render.

## Lệnh giao lại Antigravity

Đọc báo cáo này trước khi sửa. Rút xác nhận hoàn thành 100% khỏi FEATURE_PARITY.md; ghi implemented/verified/blocked đúng bằng chứng, không bỏ các tính năng còn thiếu của đặc tả gốc. Sửa R02/R05/R01 trước, rồi R03/R04/R09/R10, hoàn thiện R06/R07 và thay test theo R08. Không chỉ chỉnh báo cáo/test để được PASS.

Nghiệm thu lại bắt buộc:
1. HTTP không session bị 401, staff A không đọc/claim/download của B, role switch trái phép bị chặn.
2. Browser nhập US story -> đổi template/palette/avatar -> batch -> helper -> MP4 thật có đúng text/layer/audio -> ZIP kiểm tra được. Lưu đường dẫn/bằng chứng từng bước, không lấy file nền test làm thành phẩm story.
3. /api/stats HTTP 200 với số liệu đúng và filter ngày/quyền; test phải thất bại khi tên cột sai.
4. Hai worker claim đồng thời không lấy sai scope; callback thiếu/sai/hết hạn token bị chặn; failure callback lặp không tăng đếm; restart không mất việc.
5. Nguồn Viral -> writer -> card -> lấy thẻ -> batch chạy được; Telegram xuất phát từ event thật, có mock tests 429/timeout/retry/unauthorized và test thật khi đủ cấu hình.
6. Typecheck/build và test E2E đều phải pass, ghi riêng từng lớp test. Kiểm tra file output và preview, không chỉ tồn tại file hoặc route HTTP 200.

Chưa cần gửi bất kỳ dữ liệu thật nào ra Telegram hoặc đăng Facebook để sửa và kiểm thử cô lập.
