# View US — Kiểm tra local và lệnh triển khai cho Antigravity

Ngày kiểm tra: 20/10/2026, múi giờ Asia/Ho_Chi_Minh.
Ứng dụng thực tế tại http://localhost:3020/render là `/Users/tony/Downloads/View US/reels-studio-v2`, không phải `media-ops-hub`.

## Kết luận và phạm vi đã kiểm tra

Web mở được nhưng chưa đủ bằng chứng để coi là hệ thống sản xuất video hoàn chỉnh. Đã đọc mã nguồn, mở giao diện, thử tải lại và chọn mẫu US; kiểm tra HTTP chỉ đọc 9 trang, 5 API và một asset. Chưa tạo lô/đăng bài thật, chưa chạy render MP4 end-to-end, chưa cấu hình hoặc gửi Telegram. Báo cáo này và prompt triển khai là đầu ra; chưa sửa mã ứng dụng.

| Phát hiện | Bằng chứng | Ưu tiên |
|---|---|---|
| Preview sai nội dung | Chọn US: danh sách là Emily Vance, nội dung tiếng Anh; iframe vẫn hiển thị chuyện tiếng Việt và một CTA tiếng Pháp. `src/app/render/page.tsx` gửi `body`; `src/lib/templateRenderer.ts` đọc `bodyLines`; locale truyền vào là `fr` | P0 |
| Lần mở mới có thể kẹt “Đang tải…” | Đã gặp trên trình duyệt mới; reload sau khi có session mới hiện mẫu. Header tạo session và render page lấy API chạy độc lập. Đây là nguyên nhân khả dĩ cần tái hiện bằng test, không phải khẳng định từ network trace | P0 |
| Máy dựng là giao diện mô phỏng | `src/app/helpers/page.tsx`: Online, last-seen, cache ghi cố định; lưu concurrency bằng setTimeout, key dùng Math.random, thu hồi chỉ confirm | P0 |
| Chưa thấy đường thực thi render trong app 3020 | `api/batches` chỉ GET/POST; repository tạo batch `processing`, item `pending`; chưa có route claim/heartbeat/complete/fail trong cây API đã kiểm tra. Không loại trừ renderer bên ngoài; cần chứng minh kết nối | P0 |
| Asset gửi render không tồn tại | Payload cố định `/assets/backgrounds/nature_01.mp4`; GET trả 404. Nhạc cố định `track_01`, không lấy theo cài đặt page | P0 |
| Dữ liệu và thao tác tạo cảm giác đã hoạt động | Batches rỗng được thay bằng ba lô demo; nút tải ZIP chỉ alert; stats dùng số liệu cố định; một số thao tác Cards/Viral chỉ alert | P0 |
| Xác thực chưa đủ cho vận hành nhiều người | auth/session tự đăng nhập staff mặc định; auth/switch không yêu cầu xác thực/quyền admin trước khi ký session người được chọn; SESSION_SECRET có fallback trong mã | P0 |
| API batches chưa chặn người chưa đăng nhập | GET /api/batches không cookie trả 200 và data=[]; mã truyền undefined vào list khi không có user, dẫn đến trả toàn bộ lô nếu có dữ liệu | P0 |
| Tạo lô thiếu kiểm tra quan hệ dữ liệu | POST chưa xác minh page thuộc user, template/palette/avatar hợp lệ, giới hạn lô; fallback `page_fr_01` không phù hợp US | P0 |
| Lưu JSON thiếu độ bền và đồng bộ | repository cache trong tiến trình, ghi file trực tiếp; lỗi ghi chỉ console.error. Có nguy cơ mất cập nhật khi nhiều tiến trình, trả thành công dù lưu lỗi | P1 |
| Random và preview có thể lệch | Submit random chọn template theo idx modulo; preview không dùng cùng quy tắc random. Cần resolver chung và seed lưu lại | P1 |
| Điều hướng trùng và gây nhầm | Hai tầng menu; Fanpage Radar và Web & Page cùng tới /settings; ngôn ngữ US chỉ là nút nạp mẫu, page đích vẫn FR khi thử | P1 |
| Telegram ở project khác | `media-ops-hub/src/lib/telegram.ts` có sender và thông báo; chưa thấy tích hợp tương ứng trong reels-studio-v2. Không thể coi app 3020 đã có Telegram | P1 |

HTTP: /render, /batches, /cards, /cards/writer, /cards/pull, /settings, /stats, /helpers, /viral đều 200. Không có cookie: /api/pages, /api/templates, /api/avatars, /api/music trả 401 (đúng yêu cầu đăng nhập); /api/batches trả 200 (không nhất quán). HTTP 200 không chứng minh nghiệp vụ hoạt động.

Kiểm tra tĩnh: chạy `./node_modules/.bin/tsc --noEmit --incremental false` trong reels-studio-v2, exit code 0. Chưa chạy production build. Typecheck qua không phát hiện được lỗi dữ liệu body/bodyLines trong trường hợp này.

## Prompt giao Antigravity — sao chép toàn bộ phần dưới

Bạn hãy sửa và hoàn thiện hệ thống View US đang chạy http://localhost:3020 trong `/Users/tony/Downloads/View US/reels-studio-v2`. Đọc AGENTS.md nếu có và kiểm tra phiên bản dependencies thực tế. Không sửa nhầm media-ops-hub. Kiểm tra lại các phát hiện trên trước khi triển khai. Giữ dữ liệu người dùng, sao lưu dữ liệu trước migration, không ghi đè thay đổi có sẵn. Làm theo thứ tự dưới đây và thực thi, không chỉ trả kế hoạch.

### 1. Sửa tính đúng đắn của Studio

- Thống nhất schema StoryPayload giữa parser, preview, batch và worker. Sửa body/bodyLines, truyền highlights; lấy locale từ page/nội dung đã chọn, bỏ hardcode fr.
- Kiểm tra tất cả mẫu thực tế trong templates.json. Dùng renderer có điểm chèn nội dung rõ ràng; không thay nested HTML bằng regex mong manh. Escape dữ liệu trước khi chèn HTML, chỉ cho highlight do hệ thống tạo; không đưa HTML/script người dùng vào iframe. Giữ sandbox phù hợp.
- Dùng một hàm resolveRenderConfig chung cho preview và render: template, palette, avatar, font, background, music, locale, CTA; lưu snapshot cấu hình và phiên bản renderer trong từng job. Random có seed, dùng đúng cùng kết quả ở preview và xuất file.
- Đợi session bootstrap xong rồi nạp dữ liệu cần auth; hiển thị lỗi 401/403/500, retry có giới hạn, không spinner vô hạn. Không tự đăng nhập staff trong chế độ vận hành.
- Loại asset hardcode không tồn tại, kiểm tra file trước enqueue; không im lặng đổi sang asset khác. Chọn nhạc/background theo page và cho override từng bài.
- Đổi “Đăng lên Fanpage” thành “Page đích” khi tác vụ chỉ render. Tách rõ tạo video, tải file, đăng Facebook, ghim Comment 1.
- Đầu vào không hợp lệ phải có lỗi chỉ rõ story/dòng. Có giới hạn kích thước, số story/lô, trường bắt buộc, URL hợp lệ, cảnh báo trùng nội dung và lệch ngôn ngữ page.

### 2. Làm hàng đợi và worker thật

- Xác minh có renderer/worker hiện hữu trong workspace hay không, đặc biệt story_video_generator; chỉ tái sử dụng sau khi chứng minh giao thức tương thích. Không dùng lệnh cài từ content.yotech.net làm bằng chứng hệ thống local hoạt động.
- Lưu DB có transaction; ưu tiên SQLite WAL cho một máy local. Nếu nhiều máy ghi trực tiếp hoặc triển khai nhiều instance, chọn PostgreSQL. Dữ liệu đặt ngoài src, có migration từ store.json, backup/restore và thông báo lỗi lưu thật.
- State machine item: queued -> leased -> rendering -> completed/failed/cancelled; batch có queued/running/partial_failed/completed/failed/cancelled. Không gắn processing ngay khi chưa có worker.
- Worker đăng ký thật, key ngẫu nhiên mật mã và chỉ lưu hash, revoke thật; heartbeat có TTL. Claim job nguyên tử bằng lease, có token/version chống worker cũ hoàn tất job sau khi lease đã hết; phục hồi sau crash, timeout và retry giới hạn. Callback idempotent.
- Worker hỗ trợ concurrency phù hợp CPU/RAM, giới hạn tài nguyên, log theo batch/item, progress và mã lỗi dễ hiểu. UI lấy dữ liệu thật; offline hiển thị offline.
- Tạo MP4 thật, kiểm tra codec/duration/kích thước bằng ffprobe; output 9:16 với profile có cấu hình. Preview phải đồng nhất snapshot xuất file; cảnh báo chữ tràn và vùng an toàn thay vì cắt chữ âm thầm.
- ZIP thật gồm video, caption, comment1, manifest theo item ID. Download có xác thực và kiểm tra quyền, tránh path traversal. Hoàn tất batch chỉ khi output tồn tại và kiểm tra được.
- Chống enqueue trùng bằng idempotency key; chỉ retry item lỗi, không dựng lại item đã thành công. Hủy job có trạng thái xác nhận rõ.

### 3. Xác thực và dữ liệu thật

- Thêm đăng nhập thật; khóa demo role switch sau cờ development mặc định tắt. Nếu có impersonation admin thì yêu cầu admin đang đăng nhập, audit và thời hạn rõ.
- Thiếu SESSION_SECRET phải fail rõ ở chế độ vận hành; validate schema session và exp bắt buộc. Kiểm tra role/ownership từ DB. Bảo vệ mọi API dữ liệu và worker endpoint; kiểm tra Origin/CSRF cho thao tác ghi dùng cookie.
- GET batches chưa đăng nhập phải 401. Staff không thể đọc/tạo/sửa/tải lô của người khác hoặc dùng page ngoài quyền. Admin mới được gán owner khác.
- Xóa fallback số liệu demo trong vận hành; trạng thái không dữ liệu phải hiển thị rỗng. Thao tác chưa triển khai hiển thị disabled và giải thích. Không alert “thành công” khi chưa lưu hoặc chưa có file.
- Stats truy vấn từ DB thật; phân biệt video đã dựng, đã xuất, đã đăng và có số liệu view. Không tự sinh view/doanh thu hay coi completed render là published Facebook.

### 4. Tổ chức thao tác cho View US

- Một điều hướng chính: Tổng quan / Nội dung / Dựng video / Hàng đợi / Pages / Máy dựng / Báo cáo / Thông báo & Cài đặt. Giữ redirect các URL cũ.
- Luồng chính: chọn page -> nhập/viết nội dung -> kiểm tra -> preview -> tạo lô -> theo dõi -> tải hoặc chuyển đăng. Thanh tác vụ bám màn hình, ít nút chính và có thể tìm kiếm/lọc hàng loạt.
- Preset US lưu theo page: locale en-US, CTA/caption/comment1 tiếng Anh, avatar/template/music/background đã duyệt. Không ép toàn hệ thống sang US vì vẫn có FR/NL.
- Lưu UTC trong DB; lịch đăng US chọn múi giờ IANA riêng từng page như America/New_York hoặc America/Los_Angeles; tính DST đúng. Giao diện có giờ US và Việt Nam, không dùng offset cố định.
- Có bản nháp tự lưu, tìm kiếm theo page/story/batch, bộ lọc lỗi/của tôi/hôm nay, chọn nhiều để thao tác, preview sticky, cảnh báo nội dung chưa lưu, lỗi có nút sửa cụ thể. Kiểm tra desktop 1280/1440px và mobile 390px.
- Dashboard chỉ hiển thị chỉ số có nguồn thật: chờ dựng, đang dựng, lỗi, hoàn thành, worker online, dung lượng còn lại. Số liệu Facebook chỉ thêm khi có nguồn API/import được xác minh.

### 5. Tích hợp Telegram ngay trong app 3020

Mục tiêu là bot vận hành có thông báo theo module và các lệnh đọc trạng thái. Không cần LLM cho giai đoạn đầu. Tạo `/settings/notifications` có trạng thái cấu hình, chọn sự kiện, mức độ, giờ yên lặng, chat/topic mapping và lịch sử gửi. Bí mật cấu hình server-side, không NEXT_PUBLIC, không ghi token vào repo/log/client. Nếu thiếu token/chat ID, để trạng thái “Chưa cấu hình”, cung cấp .env.example không có bí mật, không giả báo gửi thành công.

Biến cấu hình: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_ALLOWED_USER_IDS, TELEGRAM_ALLOWED_CHAT_IDS, APP_TIMEZONE=Asia/Ho_Chi_Minh, APP_BASE_URL và tùy chọn TELEGRAM_TOPIC_* cho group forum.

Chạy một tiến trình bot riêng bằng long polling getUpdates cho local, có lưu offset và chống xử lý trùng update_id; không mở local ra Internet chỉ để nhận lệnh bot. Có timeout và graceful shutdown, bảo đảm một consumer cho token. Nếu dùng webhook sau này, chỉ triển khai sau khi có HTTPS public URL và xác minh secret header. Không bật polling và webhook đồng thời.

| Module | Sự kiện | Quy tắc mặc định |
|---|---|---|
| Nội dung | nhập lô xong, thiếu trường, sai locale, bị trùng | Gom theo lô; lỗi cần xử lý báo ngay |
| Render | queued, started, completed, partial_failed, failed | Một tin tiến độ/lô có thể cập nhật; không nhắn từng phần trăm |
| Máy dựng | offline quá TTL, online trở lại, ổ đĩa thấp, renderer crash | Debounce và chỉ báo chuyển trạng thái |
| Xuất file | ZIP sẵn sàng, xuất lỗi | Chỉ báo sẵn sàng khi file được xác minh |
| Đăng bài | published/failed, Comment 1 thành công/thất bại | Chỉ bật sau khi có tích hợp đăng thật và callback kiểm chứng |
| Báo cáo | tổng kết theo ngày/page, số lỗi cần xử lý | Múi giờ có cấu hình; ghi rõ nguồn dữ liệu |
| Hệ thống | backup lỗi, DB lỗi, hàng đợi kẹt | Báo ngay và gom lỗi trùng |

Lệnh bot giai đoạn 1: /help, /status, /queue, /batch <id>, /errors, /today. Chỉ đọc dữ liệu đúng quyền người dùng đã liên kết. Kiểm tra cả user_id và chat_id; chat nằm trong allowlist không mặc nhiên cấp quyền mọi thành viên. Người không được cấp quyền không nhận chi tiết công việc. Chưa bật retry/cancel/publish qua Telegram trong giai đoạn này.

Triển khai transactional outbox trong DB: commit nghiệp vụ và sự kiện cùng transaction, dispatcher xử lý riêng. Lưu event_id/dedupe_key, số lần thử, next_attempt_at, error code và message_id. Retry exponential backoff + jitter, tôn trọng retry_after khi 429, phân biệt lỗi 4xx không retry với lỗi tạm thời, có dead-letter và retry thủ công cho admin. Delivery theo at-least-once: không hứa exactly-once vì có thể mất response sau khi Telegram đã nhận; giảm trùng bằng lưu message_id và cập nhật tin khi thích hợp. Telegram hỏng không được làm thất bại render.

Tin nhắn mặc định chỉ chứa module, mức độ, page, batch ID, số thành công/lỗi, giờ và mã lỗi đã lọc; không gửi toàn văn nội dung, token hoặc log thô. Escape HTML và chia tin dài phù hợp giới hạn API. Group có thể định tuyến message_thread_id theo topic; quiet hours không chặn cảnh báo nghiêm trọng.

APP_BASE_URL localhost không mở được app trên điện thoại. Với chế độ local, tin nhắn dùng batch ID và các lệnh bot; chỉ thêm nút mở web khi có URL truy cập thực sự đã cấu hình và kiểm tra. Không tự mở tunnel hoặc public server.

Thông báo app tự dừng/máy ngủ không thể do chính app đã dừng phát ra. Nếu cần cảnh báo mất toàn bộ máy, cần monitor ngoài máy và heartbeat; triển khai tùy chọn, không tự mua dịch vụ. Không quảng cáo chạy 24/7 khi máy có thể sleep.

Tài liệu API chính thức: https://core.telegram.org/bots/api ; tạo bot qua https://core.telegram.org/bots/features#botfather . Chỉ dùng token/chat do chủ hệ thống cấu hình; chưa có thì hoàn thiện code và kiểm tra bằng mock transport, ghi rõ chưa nghiệm thu gửi thật.

### 6. Nghiệm thu và bàn giao bắt buộc

1. Typecheck và production build thành công; báo lệnh chạy và kết quả thật, không ghi pass nếu chưa chạy.
2. Browser mới chưa cookie không bị kẹt preview. US/FR/NL dùng đúng nội dung, CTA và avatar. Kiểm tra một lượt toàn bộ template và tự động phát hiện text fixture còn sót.
3. Tạo lô thử cô lập ít nhất ba video -> worker claim -> MP4 thật -> ZIP mở được, caption/comment khớp từng item. Không đăng công khai để test.
4. Test hai worker claim đồng thời, callback lặp, worker chết giữa chừng, asset thiếu, hết disk, retry item lỗi, restart app và lưu cấu hình. Không mất job, không hoàn tất sai, không nhân đôi batch do double-click.
5. Test không auth 401; staff A không đọc/ghi/download dữ liệu staff B; gọi role switch trái phép thất bại; payload HTML không thực thi script/ngoại gọi tùy ý.
6. Telegram: kiểm tra mock success/timeout/429/permanent failure, restart dispatcher và polling offset, user/chat trái quyền, escape HTML, dedupe. Chỉ gửi thử thật sau khi có token/chat hợp lệ; ghi rõ trạng thái chưa kết nối nếu thiếu.
7. Kiểm tra dữ liệu rỗng không hiện thống kê/lô/worker giả. Tải ZIP tạo file thật. Giờ US và DST đúng. Giao diện 390px không mất nút chính hoặc tràn ngang toàn trang.
8. Bàn giao danh sách file sửa, migration/rollback, README khởi động app+worker+bot, .env.example, ảnh UI, đường dẫn MP4/ZIP thử và phần còn phụ thuộc cấu hình. Ưu tiên hoàn tất P0 trước việc trang trí hoặc tính năng tăng trưởng.
