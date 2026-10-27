# Lệnh sửa View US — dùng một người, Studio đầy đủ

Yêu cầu cập nhật của chủ hệ thống ngày 20/10/2026. Tài liệu này thay thế các yêu cầu cũ mâu thuẫn về phân quyền, dữ liệu page/domain mẫu và chế độ chọn mẫu mặc định. Kết hợp các lỗi đã kiểm chứng trong `recheck/BAO_CAO_NGHIEM_THU_LAI.md`.

## Prompt giao Antigravity — thực hiện toàn bộ

Hoàn thiện app tại `/Users/tony/Downloads/View US/reels-studio-v2`, chạy cổng 3020. Đây là công cụ local **chỉ một người dùng**. Ưu tiên nhập kịch bản -> cấu hình -> xem trước đầy đủ -> dựng đúng MP4 -> theo dõi -> tải file. Giữ logo The Story và giao diện nền trắng/viền xanh/chữ xanh hiện tại. Không chỉ sửa giao diện hoặc thêm toast thành công.

### 1. Bỏ quản lý vai trò, thiết lập local một chủ

- Không làm màn đăng nhập/phân vai/nhân viên, không yêu cầu đăng nhập khi chủ mở local. Bỏ nút Đổi vai trò, dropdown tài khoản demo, tên Phan Hà/admin giả và luồng duyệt của người khác. Hiển thị đơn giản “Không gian làm việc của tôi”.
- Dùng một workspace/local owner rõ ràng, gắn dữ liệu và jobs vào owner đó. Không giữ lối fallback “không có cookie thì lấy admin đầu tiên” như giải pháp xác thực. Các route phải nhất quán với chế độ một người.
- Mặc định chạy bind 127.0.0.1:3020; không tự public/tunnel. Giữ kiểm tra đầu vào, đường dẫn file, mã máy dựng và lease để tránh job/file hỏng; những phần này vẫn cần cho hoạt động đúng dù không phân quyền người dùng.
- Không tiếp tục dành công sức xây staff A/B hoặc workflow approval. Đăng ký website của chủ có thể lưu trực tiếp; không pending chờ admin khác.

### 2. Page và domain ban đầu để trống

- Không seed fanpage, domain, người quản lý hoặc URL CMS của đối thủ/mẫu vào dữ liệu vận hành. Form thêm page/website mở trống, có placeholder hướng dẫn; không tự điền tên thật giả định.
- Không xóa dữ liệu hiện có để đưa về rỗng. Sao lưu và lập danh sách bản ghi seed/demo từ trước, cung cấp nút “Dọn dữ liệu mẫu” có preview số bản ghi/phụ thuộc để chủ tự chọn. DB mới thì bắt đầu không có page/domain.
- Page và website/domain là hai khái niệm riêng: có thể tạo page chỉ với tên + locale, **domain không bắt buộc để render**. Website thêm sau, liên kết với page khi cần. Không tự ép mọi page dùng chung domain.
- Cho dựng “Lô tự do” khi chưa có page, dùng cấu hình thủ công và locale chọn rõ; không fallback page_fr_01/page_us_01 hoặc tên page fixture. Có nút “Thêm page” tại selector và liên kết sang cài page.
- Mẫu kịch bản US/FR/NL chỉ nạp khi bấm “Nạp mẫu”; mẫu ghi rõ là demo và không tạo page/domain trong DB. Không tự nạp chuyện Emily hoặc bất kỳ story nào khi mở Studio mới.

### 3. Sửa nhập file TXT thật, giữ tương thích tool cũ

- Hiện nút **“Tải file .txt”** ở Studio đang là xuất file; không phải nút upload. Đổi nhãn thành **“Xuất caption & comment .txt”** và thêm riêng **“Nhập file TXT/JSON”** với input file hoạt động thật.
- Hỗ trợ click chọn file, kéo thả, nhiều file .txt/.json; đọc nội dung vào cùng parser với textarea. Hiển thị filename, số story đọc được, số hợp lệ/lỗi, danh sách lỗi theo file/story/dòng. Cho chọn “Thay nội dung hiện tại” hoặc “Nối thêm”, không ghi đè bản nháp âm thầm.
- Tham chiếu logic upload tại `story_video_generator/studio_engine_v13.js` khoảng dòng 841–930. Dùng thư viện/tài nguyên cũ theo adapter, không làm hỏng tool cũ.
- Tương thích `=== STORY X ===`, nhãn tiếng Việt/Anh đang dùng: Tác giả/Author, Thời gian/Time, Tên Page/Page, Tiêu đề/Title, Nội dung thẻ/Content/Body, Highlights, Nút CTA/CTA, Caption, Comment 1/First Comment. Giữ nội dung nhiều dòng, dấu tiếng Việt/Pháp và emoji.
- Xử lý UTF-8 có/không BOM, CRLF/LF; báo rõ file lỗi encoding thay vì ký tự rác. Có giới hạn kích thước được hiển thị. Chọn lại cùng file sau khi sửa vẫn phải trigger đọc lại.
- JSON kiểm schema/version và hiển thị lỗi trường; không eval, không đoán bừa JSON bất kỳ thành story. Parser chung cho upload/paste/import, không viết regex khác chỉ để test.
- Sau nhập có preview danh sách story và sửa/xóa từng story trước khi dựng. File caption-only không đủ body thì báo thiếu nội dung, không dựng bằng fixture.

### 4. Có đủ cài đặt video trước khi dựng

Tổ chức Studio 4 vùng dễ dùng: **Nguồn kịch bản → Cấu hình page/video → Danh sách sẽ dựng + Preview → Tiến trình + Kết quả**. Thanh tạo lô bám màn hình có tóm tắt số video × thời lượng × độ phân giải, không bắt cuộn tìm nút.

Các điều khiển bắt buộc:

| Nhóm | Điều khiển |
|---|---|
| Nguồn | Nhập file/paste, tổng story hợp lệ, chọn tất cả/bỏ chọn, chọn từng story |
| Số lượng | “Số video xuất” và danh sách item sẽ dựng; preset 1/5/10/20/30/50 + nhập số, giới hạn theo tập story được chọn |
| Biến thể | Mặc định 1 video/story. Muốn nhiều biến thể phải bật riêng “Số biến thể mỗi story”; hiển thị story ID -> variant -> template/palette. Không âm thầm nhân story cho đủ N |
| Thời lượng | Số giây/video: preset 8/10/15/20/30 và nhập tùy chỉnh trong giới hạn engine đã kiểm chứng; áp dụng cả lô hoặc override từng item khi bật nâng cao |
| Chất lượng | 720×1280 / 1080×1920 / 1440×2560 nếu máy hỗ trợ; FPS 24/30, codec H.264 + AAC MP4; bitrate/quality nâng cao |
| Mẫu | Kế thừa page, dùng một mẫu cả lô, hoặc tùy chỉnh từng video; palette và seed xoay tua rõ ràng |
| Nội dung | Tác giả, thời gian, tên page hiển thị, body/highlights/CTA; font/cỡ chữ/line-height/vùng an toàn; auto-fit và cảnh báo tràn |
| Avatar | Kế thừa page hoặc chọn thủ công, vị trí/kích thước theo mẫu; metadata/hint và fallback dễ hiểu |
| Nền | Chọn ảnh/video của mình, xem thumbnail/play; crop contain/cover áp dụng cho **nền**, chuyển động theo mẫu |
| Nhạc | Chọn mood/track theo page, nghe thử, volume, tắt nhạc, fade in/out, loop/trim theo duration |
| Xuất | Tên lô, thư mục đầu ra phù hợp worker, quy tắc tên file, MP4 + TXT, ZIP toàn lô, JSON preset/batch |
| Máy dựng | Máy hiện tại, concurrency và trạng thái thật; chi tiết nâng cao có thể thu gọn |

Nếu nhập 30 story và chọn N=10 thì preview xác định đúng 10 story sẽ dựng, xuất đúng 10 video. Nếu N vượt số story và chưa bật biến thể thì báo giới hạn hoặc yêu cầu chọn thêm, không lặp ngẫu nhiên. N=0/duration không hợp lệ phải bị chặn cả UI lẫn API.

Thời lượng/chất lượng phải được lưu DB -> snapshot -> payload worker -> FFmpeg; không chỉ thêm input trong UI nhưng vẫn encode cứng 10 giây. Tham chiếu tool cũ `studio_engine_v13.js` có QUALITY_PRESETS 720/1080/1440, 30fps, volume/fade và progress để giữ khả năng đã có.

### 5. Chọn page thì tự áp dụng đúng cấu hình page

- Chế độ mặc định là **“Theo cài đặt page”**, thay vì mặc định khuyên chọn riêng từng video. Chọn page phải tự áp dụng locale, display name, pool template/palette, avatar, nhạc, nền, duration/quality defaults và overrides đã lưu của page.
- “Theo page” nghĩa là mọi item tuân thủ preset/pool page; nếu page có nhiều template thì xoay trong pool đúng rule. Có tùy chọn **“Khóa cùng một mẫu cho cả lô”** khi muốn tất cả giống một mẫu chính xác.
- Tùy chỉnh riêng từng video là chế độ nâng cao chủ động bật. Có badge “Kế thừa page”/“Đã tùy chỉnh”, diff và nút “Khôi phục theo page”. Đổi page khi có override phải cho chọn giữ hay áp dụng lại, không mất sửa âm thầm.
- Page thiếu cấu hình thì chỉ rõ phần thiếu và có nút sửa; không fallback mẫu/nhạc/page khác trong im lặng. Chế độ tự do cho chọn defaults thủ công.
- Freeze resolved settings cho từng item tại lúc tạo lô: rendererVersion, locale, displayName, templateId, palette, overrides, font, avatar, background, track/volume/fade, duration, resolution, fps, random seed. Page sửa về sau không đổi batch đã tạo.

### 6. Sửa preview bị phóng lớn và cắt như ảnh đã gửi

- Ảnh chủ gửi cho thấy tên/nội dung bị mất nửa phải, phần dưới bị cắt. Mã hiện đặt iframe width/height theo container 270×480 nhưng template có design viewport lớn hơn, nên phải kiểm tra và sửa tỉ lệ tọa độ; không chỉ giảm font ngẫu nhiên để che lỗi.
- Chốt design canvas theo template thực tế (ví dụ 720×1280), render nội dung ở đúng design size, rồi scale toàn bộ canvas/iframe theo container bằng transform với origin top-left. Container giữ aspect-ratio 9/16 và tính kích thước content box thực tế, kể cả border/zoom/resize.
- **Toàn bộ thẻ phải nằm trong preview**, không crop card/text/CTA để lấp khung. Chỉ background được cover/crop theo cấu hình. Preview không có thanh cuộn hoặc bắt chủ zoom browser mới đọc được bố cục.
- Có “Phóng to xem đầy đủ” mở modal vừa cửa sổ, Play/Pause, timeline và scrub trong duration để xem nền/hiệu ứng/nhạc, cùng previous/next item. Full-screen vẫn giữ 9:16, không phóng sai tỉ lệ.
- Auto-fit chỉ thu cỡ chữ trong ngưỡng cấu hình, rồi cảnh báo quá nhiều chữ hoặc gợi ý sửa, không cắt nội dung âm thầm. Không lặp CTA trong body và CTA bar.
- Dùng một renderer/config resolver cho thumbnail, preview và MP4. Kiểm ở desktop 1280/1440, mobile 390, browser zoom 100%/125%; test tên dài/body dài và US/FR/NL trên mọi template hỗ trợ.

### 7. Dựng video thật và thấy quá trình gen

- Sửa `scripts/render_daemon.mjs`: không được chỉ scale/crop background + music. Phải composite đủ thẻ/mẫu/avatar/text/highlight/CTA, đúng lựa chọn page/item và duration/quality. Nội dung ghi TXT không thay thế lớp chữ trong MP4.
- Tách rõ chuẩn bị assets -> xếp hàng -> đang dựng frame/encode -> kiểm tra file -> hoàn tất. Hiển thị tiến trình từng item, tổng x/N, item hiện tại, thời gian đã chạy, lỗi đọc được; % từ worker/FFmpeg thật, không timer giả. Nếu chỉ biết stage thì hiển thị stage thay vì % bịa.
- Cung cấp Hủy item/lô, tạm dừng nhận việc mới, tiếp tục, retry item lỗi; giải thích pause không nhất thiết dừng encode giữa chừng. Hủy phải tác động worker/process và state thật, không chỉ biến mất trên UI.
- Giữ tiến trình khi reload/restart bằng DB. Heartbeat/lease owner/fencing/retry/idempotency cần giữ để bảo vệ job, không phải phân quyền nhiều người. Concurrency trên UI phải điều khiển pool thật, không for-loop tuần tự bất chấp cấu hình.
- Hoàn tất chỉ khi artifact tồn tại, metadata/checksum hợp lệ và callback được server chấp nhận. Thiếu/sai/hết hạn lease không được hoàn tất; callback failure lặp không tăng failed_count nhiều lần. Daemon kiểm response callback thay vì luôn log thành công.
- Gallery kết quả có player xem đầy đủ, duration/resolution thật, template/avatar/track đã dùng, mở/chỉnh/dựng lại/tải MP4/tải TXT/xóa. Rerender giữ version, không ghi đè output cũ âm thầm.
- ZIP phải có đúng MP4 + caption/comment1 + manifest theo item. Không trả “ZIP thành công” với mỗi TXT khi MP4 thiếu. Hỗ trợ chọn chỉ tải item thành công trong lô có lỗi và ghi rõ số file.

### 8. Có thêm thì phải có sửa/xóa

Làm thao tác đầy đủ cho page, website/domain, story/card, nguồn Viral, đối thủ Radar, avatar, nhạc, preset, máy dựng, batch và output file. Không chỉ có nút Thêm.

- Page/website: sửa tên/locale/domain/liên kết, xóa có preview phụ thuộc; thay đổi không phá batch snapshot cũ. Page đang có job hoạt động thì chặn hoặc yêu cầu hủy/chuyển job, không cascade xóa mất video âm thầm.
- Avatar/track: phân biệt “Bỏ khỏi page” với “Xóa khỏi kho”; asset đang dùng trong snapshot có cảnh báo và không làm job mất file. Giữ archived asset đến khi không còn phụ thuộc, có thao tác dọn sau.
- Story/item: xóa khỏi lô nháp thì tổng N cập nhật; batch đang chạy dùng cancel thay vì DELETE hàng DB.
- Helper: revoke/dừng nhận việc trước xóa; không để job leased treo vĩnh viễn.
- Batch/output: phân biệt xóa lịch sử với xóa file trên đĩa, hiển thị số file/dung lượng sẽ mất. Ưu tiên soft-delete/thùng rác/khôi phục; xóa vĩnh viễn có xác nhận rõ. Không chạy xóa dữ liệu thật khi tự test.
- Mọi nút sửa/xóa phải gọi backend và phản ánh lỗi thật; có trạng thái đang xử lý, tránh double-click; giữ UI/DB/filesystem nhất quán.

### 9. Sửa lỗi đã tìm thấy, không bỏ vì dùng một người

- `/api/stats` hiện 500: dùng schema thật staff_id/count/done_count/finished_at thay vì owner_staff_id/total_items/completed_items/completed_at; filter ngày/timezone/locale/page đúng. Không cần matrix nhân viên nhiều người; ưu tiên ngày × page × locale và số hoàn tất/lỗi.
- Writer có enqueue nhưng chưa thấy consumer: nếu tiếp tục giữ tính năng Viết thẻ AI thì phải có worker xử lý thật và báo thiếu API key. Nhập TXT/manual không phụ thuộc AI mới dựng được.
- Telegram currently configured=false: để form/nhãn chưa cấu hình, nối outbox với event thật (batch/lỗi/hoàn tất/máy offline), dispatcher retry/backoff/429/timeout và /status /queue /errors khi triển khai bot. Không fake bot username hoặc đánh dấu đã kết nối vì có bảng outbox. Không gửi dữ liệu thật ra ngoài trong test khi chủ chưa cấu hình.
- Chọn nhạc/background/duration không được hardcode; preview và output phải trùng settings snapshot.
- Đường dẫn artifact được canonicalize trong thư mục cho phép; helper máy khác phải transfer file thật, server không thể tự đọc đường dẫn trên máy khác. Tránh shell interpolation từ đường dẫn người nhập; dùng spawn/execFile với args.

### 10. Nghiệm thu theo thao tác của chính chủ

Chạy test cô lập, không sửa page/domain hay overwrite file của chủ. Bộ `test_f01_f25.mjs` trước đây 25 PASS vẫn lọt lỗi SQL và video không chữ; phải thay bằng kiểm thử nghiệp vụ thực, giữ smoke riêng. Không tuyên bố 100% dựa vào grep hoặc chỉ size MP4.

1. DB mới không có page/domain/story demo. Mở local dùng ngay không login/role switch; tạo/sửa/xóa page không cần domain, dựng tự do khi chưa tạo page.
2. Nhập một TXT thực tế từ tool cũ, file UTF-8 BOM/CRLF, nhiều file và JSON. So đúng nội dung/Caption/Comment1, báo lỗi đủ trường, chọn lại cùng file hoạt động.
3. Nhập 30 story, chọn 5 story/N=5, duration 15 giây/1080p. Thấy đúng 5 item và dựng đúng 5 MP4 có duration gần 15 giây trong sai số frame/codec; file có lớp chữ/avatar/mẫu/CTA và âm thanh đúng cấu hình.
4. Chạy thêm lô 10 giây/720p và lô thời lượng tùy chỉnh, chứng minh worker không encode cứng 10 giây. Nếu bật biến thể, manifest thể hiện story-variant rõ.
5. Tạo hai page do test đặt tên, preset khác nhau. Chọn page A thì preview/output theo A; page B theo B; batch cũ không đổi khi sửa preset. Khóa một mẫu cả lô và override riêng từng video hoạt động đúng.
6. Preview toàn thẻ không cắt như ảnh chủ gửi, có modal xem đủ/play/pause/scrub; MP4 và preview khớp. Kiểm US/FR/NL, chữ dài và CTA không trùng.
7. Progress thật cập nhật, reload vẫn còn; hủy/dừng nhận việc/retry đúng; offline/restart/asset thiếu/callback lặp không báo hoàn thành sai.
8. Tất cả đối tượng có thêm/sửa/xóa hợp lý, test rollback/restore/phụ thuộc không phá job và file. ZIP mở được đủ MP4/TXT, xóa output có xác nhận.
9. `/api/stats` 200 và số đếm đúng theo các lô thử; typecheck + production build + E2E/media checks pass riêng từng lớp.

Bàn giao README local một người; danh sách file sửa; video demo nhập TXT -> chọn page/N/duration -> preview -> render progress -> xem MP4 -> tải ZIP; file MP4/ZIP/manifest thật; test logs và danh sách dependency còn thiếu. Cập nhật FEATURE_PARITY.md trung thực, không đánh dấu verified các phần chưa nghiệm thu.
