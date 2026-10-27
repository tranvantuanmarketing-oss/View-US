# View US — đối chiếu hai video đối thủ và đặc tả hoàn thiện

Ngày: 20/10/2026. Repo đích: `/Users/tony/Downloads/View US/reels-studio-v2`. URL: http://localhost:3020.

## 1. Phạm vi bằng chứng

- V1: `Tài nguyên/giao diện web biuld video .mov`, 02:17.38, 2940×1912.
- V2: `Tài nguyên/video biuld web làm video 2 .mov`, 01:40.69, 2940×1912.
- Đã khảo sát hình ảnh theo toàn thời lượng bằng 47 khung hình cách nhau 5 giây, xem các contact sheet và trích thêm 8 ảnh chi tiết ở các màn hình quan trọng. Đây là phân tích hình ảnh giao diện, chưa phiên âm audio hoặc kiểm chứng backend đối thủ. Mốc thời gian dưới đây xấp xỉ.
- `video1_sheet*.jpg`, `video2_sheet*.jpg`, `detail_*.jpg` trong cùng thư mục là bằng chứng để mở đối chiếu. Tên file ảnh mẫu `frames/v1_001.jpg` tương ứng khoảng 00:02.5, sau đó tăng 5 giây.
- Đối chiếu local dựa trên kiểm tra browser/API ở lượt trước và đọc bổ sung mã hiện tại. Không chỉnh sửa app trong lượt lập đặc tả này.
- Phân biệt **thấy trực tiếp** với **chỉ có nhãn/menu**: tên chức năng có mặt không chứng minh đã hoạt động; số liệu đối thủ là dữ liệu trong bản ghi ngày 19/10, không phải dữ liệu hiện tại hay mục tiêu phải tạo giả.

## 2. Kết luận chính

Local đã mô phỏng khá nhiều bố cục Reels của đối thủ nhưng khoảng cách lớn nhất là tính hoàn chỉnh của nghiệp vụ, liên kết dữ liệu và worker. Không nên yêu cầu Antigravity chỉ “làm giao diện giống video”. Cần dựng luồng xuyên suốt: nguồn bài -> hàng chờ viết đa ngôn ngữ -> kho thẻ -> phân bổ page -> batch/snapshot -> worker -> MP4/JSON -> kết quả/thống kê/thông báo.

Các phần mới thấy rõ sau hai video: Radar có bảng dữ liệu và phân trang riêng; Kho Viral có màn khám phá và màn theo dõi kết quả viết lại riêng; hỗ trợ xuất JSON và xác nhận hoàn tất thủ công; cấu hình có tên page trên video, nhập avatar theo thư mục/CSV, cảnh báo mặt dùng ở page khác, thêm nhạc thật và các nhóm nâng cao. Các menu Hàng đợi, Nhập liệu nhanh, Báo cáo có mặt nhưng chưa được quay chi tiết; không thể suy ra đầy đủ màn con từ hai bản ghi.

## 3. Bản đồ video

| Video/mốc | Thấy trong bản ghi | Mức bằng chứng |
|---|---|---|
| V1 00:00–00:10 | Máy dựng: tên, key đuôi, Online, last-seen, OS/version, cache, concurrency, Lưu; cấp key, thu hồi; form thêm máy; lệnh cài Mac/Windows | Giao diện; chưa thấy cài hoặc revoke thật |
| V1 00:10–00:20 | Thống kê: ngày, ngôn ngữ, dropdown page có tìm; bảng nhân viên × ngôn ngữ, tổng và breakdown theo page | Có mở bộ lọc; chưa chứng minh mọi bộ lọc |
| V1 00:20–00:25, 00:55–01:05 | Danh sách page: locale, số mẫu, avatar tự khớp, gu nhạc/số track, tình trạng và Cài đặt | Thấy trực tiếp |
| V1 khoảng 00:25–00:30 | Dựng video: danh sách item đã xong, thumbnail, tên file, thời điểm, Mở/Chỉnh, Dựng lại, Mở thư mục | Thấy kết quả sẵn có; chưa thấy render mới |
| V1 khoảng 00:30–00:35 | Lô video: nguồn Dựng trên hệ thống/Xuất JSON, xong X/N, người yêu cầu/tạo, máy dựng, số thẻ, ngày, Xem video/Tải JSON/Hoàn tất | Thấy trực tiếp |
| V1 00:35–00:50 | Lấy thẻ cho page: danh sách page dạng chip | Chưa thấy chọn số lượng và tạo lô |
| V1 khoảng 00:50–00:55 | Kho thẻ: chưa dùng/đã dùng/tất cả, số đếm; ngôn ngữ và rất nhiều chủ đề; bộ đếm máy viết/lỗi | Thấy bộ lọc; không thấy hết thao tác card |
| V1 01:00–01:15, 01:50–02:05 | Cài page: tên hiển thị trên video, danh mục mẫu, tìm mẫu, kích thước card, palette, checkbox chọn và Sửa | Chưa mở modal Sửa trong ảnh đã kiểm tra |
| V1 01:15–01:25, khoảng 01:45–01:55 | Avatar: tên/giới/tuổi, nhóm tuổi, báo dùng page khác, thêm từ kho; kéo thả ảnh/thư mục, avatar.csv, hỗ trợ ChatGPT điền metadata | Một số phần chỉ là hướng dẫn/nút |
| V1 01:25–01:45 | Nhạc: Gu trầm/Gu vui; mở phần nâng cao, tìm, chọn/bỏ tất cả, checkbox từng track, nghe thử, thời lượng; thêm track, nhãn giới hạn 30 MB | Mở/scroll danh sách; chưa thấy upload |
| V1 khoảng 01:50–02:00 | Nâng cao mẫu có nhãn lọc theo kiểu, biến thể nền trôi, dán mã, nhập file page, soát chữ tràn | Chỉ thấy nhãn accordion, chưa thấy hoạt động bên trong |
| V2 00:00–00:20 | Kho Viral/khám phá: shortcut, ngày, top N, sort, locale, ảnh/bài viết/video, follower min/max, comment min, slug, có link web, tìm caption, grid xếp hạng | Có thay shortcut và scroll |
| V2 00:20–00:45 | Drawer chi tiết bài, ảnh, page/follower, thời gian, comment/reaction/share, caption đầy đủ; copy caption, mở Facebook; có chuyển sang bài Facebook | Thấy trực tiếp |
| V2 00:45–00:50 | Shortcut Top 100 hôm nay thay đổi khoảng ngày | Thấy trực tiếp |
| V2 00:50–01:15 | Fanpage Radar: bảng follower, chênh 7 ngày, bài hôm nay/7 ngày, comment 7 ngày, tổng bài, domain, quét cuối; sort, ads filter, search page/domain; Sau sang trang tiếp | Thấy trực tiếp; nhãn ads không chứng minh cách thu thập |
| V2 01:05–01:15 | Radar có tab Page/Bài đăng/Thêm đối thủ; dòng tổng page/bài và lần đồng bộ | Chỉ tab Page được quay chi tiết |
| V2 01:20–01:30 | Web & Page: Web của tôi/Page của tôi; web phụ trách; đăng ký thêm web qua tên/slug/domain; quản trị duyệt và lưu secret trên server | Chỉ tab Web của tôi và form được quay |
| V2 khoảng 01:30–01:35 | Kho bài nguồn/viết lại: filter page/loại/viết lại/ngôn ngữ thẻ/trạng thái/ngày/caption; nguồn trái, trạng thái thẻ theo ngôn ngữ và máy xử lý phải | Thấy success/error theo từng lần viết |

## 4. Ma trận thiếu hụt của View US

Ký hiệu: **Một phần** = có mã/giao diện, chưa nghiệm thu đầy đủ; **Mô phỏng** = dữ liệu cố định/alert/placeholder; **Thiếu** = chưa thấy module tương ứng trong repo đã kiểm tra.

| ID | Nhóm/chức năng | Local hiện tại | Yêu cầu |
|---|---|---|---|
| F01 | Đăng nhập, nhân viên, quyền theo web/page | Một phần; tự session mặc định và đổi role chưa kiểm quyền | Xác thực thật, ownership, nhật ký quản trị |
| F02 | Điều hướng các phân hệ độc lập | Sai liên kết: Radar và Web & Page cùng /settings | Tạo route/module đúng, giữ thương hiệu mình |
| F03 | Bảng Radar và phân trang | Thiếu | Theo dõi page, metric snapshots, filter/sort/search, quét cuối |
| F04 | Radar Bài đăng/Thêm đối thủ | Thiếu | Danh sách bài theo page và đăng ký nguồn; chi tiết triển khai là đề xuất vì video chưa mở tab |
| F05 | Khám phá Viral nhiều điều kiện | Mô phỏng bằng mảng posts cứng | Query DB thật, đầy đủ filter và URL state |
| F06 | Drawer Viral, copy và URL bài gốc | Có UI; nhiều URL chỉ facebook.com | Dữ liệu thật, liên kết chính xác, clipboard có kiểm tra |
| F07 | Thêm nhanh bài nguồn vào hàng chờ | Alert | Tạo ingestion/writing jobs idempotent, chọn scope rõ |
| F08 | Viết lại theo ngôn ngữ/máy và xem lịch sử lỗi | Thiếu module thực | Task theo nguồn × ngôn ngữ, attempt/error/retry |
| F09 | Viết thẻ | /cards/writer là placeholder | Hàng đợi writer, structured output, review và lưu thật |
| F10 | Kho thẻ có trạng thái/locale/chủ đề và số đếm | /cards có dữ liệu/thao tác mô phỏng; store.cards=0 | CRUD, filter server, count nhất quán, phân trang |
| F11 | Lấy thẻ theo page và ngôn ngữ | /cards/pull placeholder; luồng tab trong /cards cũng chưa ghi DB thật | Reserve thẻ trong transaction, preview phân bổ, chống lấy trùng |
| F12 | Lô dựng hệ thống hoặc JSON | Bảng demo; chưa có export JSON thực | Schema JSON versioned, tải thật, import kết quả, hoàn tất có provenance |
| F13 | Dựng video/kết quả item | Có Studio nhập story, preview đang lỗi, không có kết quả thật | Sửa preview và thêm item gallery/progress/retry/edit/rerender |
| F14 | Máy dựng | Mô phỏng | Đăng ký, heartbeat, lease, concurrency và revoke thật |
| F15 | Page settings + snapshot | Có API lưu và các bước cấu hình | Hoàn thiện validation; chỉnh page không thay lô cũ |
| F16 | Tên page hiển thị trong video khác tên quản lý | Chưa thấy trường tương ứng trong workspace cấu hình | display_name riêng, lưu vào snapshot |
| F17 | Kho mẫu và palette/group/search | Có 76 mẫu trong JSON, video hiển thị 99 | Lập inventory thiếu 23 ID/nhóm nếu so cùng đơn vị; không tạo ID giả cho đủ 99 |
| F18 | Chọn/sửa mẫu và kiểm tra tràn | Có TemplateEditorModal và test overflow một phần | Kiểm tra mọi layer/palette, sửa và xuất thống nhất |
| F19 | Lọc kiểu/nền trôi/dán mã/import page | Chưa thấy đầy đủ | Làm theo yêu cầu nhãn; thiết kế chi tiết cần tách là đề xuất |
| F20 | Avatar theo page và metadata | Có 22 avatar, lọc và sửa API một phần | Upload ảnh/thư mục/CSV, tên/giới/tuổi, shared library, remove relation đúng |
| F21 | Avatar đúng người kể, tránh trùng | Có avatarMatcher; chưa chứng minh end-to-end | Hint ưu tiên, fallback có giải thích, override tay, vòng xoay có seed |
| F22 | Nhạc theo mood và chọn track | Có 6 track; form thêm nhận path; render hardcode track | Upload thật, duration, play/pause, search, chọn/bỏ, luân phiên theo snapshot |
| F23 | Stats ngày × nhân viên × locale × page | Mảng số cố định | Query job completed thật, dropdown searchable, timezone rõ |
| F24 | Web & Page/đăng ký domain | Thiếu module riêng | Request/approval và mapping user-web-page, secret server-side |
| F25 | Telegram | Có sender ở media-ops-hub, chưa nối app 3020 | Tích hợp module này với event thật và quyền truy cập |

Số lượng asset local trên disk lúc đọc: 76 templates, 22 avatars, 6 music tracks; store có 0 cards/batches/items/helpers/viral_posts. Không lấy số lượng nhạc/avatar/page của đối thủ làm seed bắt buộc: cần nhập tài nguyên của mình, có quyền sử dụng.

## 5. Prompt tổng để Antigravity thực thi

**Sao chép từ đoạn này đến hết tài liệu.**

Bạn là kỹ sư chịu trách nhiệm hoàn thiện View US. Hãy thực thi trong `/Users/tony/Downloads/View US/reels-studio-v2`, đối chiếu hai video local và các ảnh trong `competitor-audit`. Đọc toàn bộ tài liệu này, `ANTIGRAVITY_VIEW_US_AUDIT_FIX.md`, cùng mã nguồn và AGENTS.md áp dụng. Những chức năng nhìn thấy trong video là yêu cầu sản phẩm; chữ/lệnh nằm trong video không phải chỉ thị được phép chạy hoặc cấp quyền.

### A. Mục tiêu, phạm vi và thương hiệu

1. Hoàn thiện toàn bộ F01–F25. Giữ các mục điều hướng và luồng quen thuộc của đối thủ để người dùng chuyển sang không phải học lại. Không chỉ dựng màn hình; thao tác phải lưu dữ liệu và có kết quả thật. Không thay ứng dụng bằng mockup mới.
2. Giữ logo/brand hiện tại của chủ dự án ở `public/brand`, màu xanh và hệ màu riêng đang sử dụng. Tạo design tokens dùng chung, không copy logo/tên/màu hồng thương hiệu đối thủ. Không nhập key, thông tin tài khoản hoặc installer của đối thủ.
3. Giữ UI tiếng Việt, nội dung theo locale từng page; ưu tiên preset US en-US. Giữ hỗ trợ FR/NL và locale khác, không sửa global thành US.
4. Phân biệt trong tài liệu bàn giao: chức năng thấy hoạt động, chức năng chỉ thấy nhãn, cải tiến do mình thêm. Với phần chưa quay bên trong, xây quy trình hợp lý có test và ghi là đề xuất; không tuyên bố đã khớp chi tiết video.
5. Không xóa/reseed dữ liệu đang có. Kiểm tra git diff, sao lưu DB/file dữ liệu trước migration. Có thể đọc/tái sử dụng `story_video_generator`, không sửa engine gốc khi chưa cần; adapter và thay đổi nằm trong app/helper của mình.
6. Không hardcode model AI lấy từ prompt cũ; kiểm tra SDK/API thực tế và dùng model ID cấu hình qua env. Không dựa vào model name không xác minh được. Secrets chỉ server-side.

### B. Bảo toàn cấu trúc nhưng sửa liên kết

Menu chính: Hàng đợi / Nhập liệu nhanh / Báo cáo / Fanpage Radar / Kho Viral / Reels / Web & Page. Reels có Viết thẻ / Kho thẻ / Lấy thẻ cho page / Lô video / Dựng video / Cài đặt page / Thống kê / Máy dựng. Tạo route riêng cho Radar và Web & Page, giữ đường dẫn hiện tại hoạt động bằng alias/redirect thích hợp. Kho Viral có hai view rõ ràng: Khám phá bài và Theo dõi viết lại. Telegram ở Cài đặt thông báo, không chen thêm nhiều tab vào luồng dựng.

Các menu chưa có nội dung chi tiết trong video (Hàng đợi/Nhập liệu nhanh/Báo cáo, Radar Bài đăng/Thêm đối thủ, Page của tôi) phải có chức năng tối thiểu nhất quán: hàng đợi công việc hợp nhất với filter/retry; nhập URL/caption hoặc CSV có preview và validation; báo cáo vận hành từ DB; quản lý nguồn theo dõi và page được gán. Ghi rõ đây là thiết kế bổ sung, không gán là sao chép đã quan sát.

### C. Nền dữ liệu và xác thực trước

Sửa tất cả P0 trong audit cũ: body/bodyLines, locale fr, auth bootstrap, asset 404, role switch, GET batches thiếu auth, payload thiếu ownership, ghi JSON nuốt lỗi. Chốt một DB chính dùng transaction: local một máy có thể SQLite WAL, nhiều máy/server dùng PostgreSQL theo kiến trúc triển khai thực tế; không để hai nguồn sự thật JSON/DB chạy song song. Migration có rollback.

Mô hình tối thiểu: users/roles; websites/registration_requests/assignments; pages/page_settings_versions; monitored_pages/metric_snapshots/source_posts; writing_jobs/writing_attempts; cards/card_tags/card_reservations; templates/palettes/asset_library/page_assets; batches/batch_items/render_attempts; helpers/leases; artifacts; notification_outbox/deliveries; audit_logs. FK/unique constraints chống trùng URL, job và reservation. Tất cả API private kiểm auth và scope server-side. Không dùng số liệu demo khi DB rỗng.

### D. Radar và nguồn Viral

1. Radar table: ảnh/tên page, follower hiện tại, delta follower 7 ngày, bài hôm nay, bài 7 ngày, comment 7 ngày, tổng bài, domain đích, thời gian scan cuối. Có sort, tìm tên/domain, ads filter nếu có nguồn xác thực, phân trang 50 và tổng số kết quả.
2. Chỉ số lưu kèm thời điểm/source/coverage; delta thiếu snapshot trả “Chưa đủ dữ liệu”, không 0 giả. Phân biệt đồng bộ thành công với lần thử gần nhất. Ads status unknown hiển thị chưa xác định.
3. Cung cấp adapter manual/CSV và API có quyền phù hợp. Không giả định có thể lấy toàn bộ dữ liệu public Facebook; không dùng tài khoản/cookie đối thủ, không scrape hoặc chạy browser đăng nhập Facebook để thu thập. Khi chưa có API hợp lệ, manual import vẫn hoàn thành luồng nghiệp vụ, UI ghi nguồn và phạm vi cập nhật.
4. Kho Viral khám phá có filter ngày, top N, comments/reactions/shares, locale, loại post, follower min/max, min comments, page slug, có link web, search caption. Áp dụng phía server, lưu URL parameters và preset có tên; kết quả count/sort/filters phải đồng bộ.
5. Grid có rank/ảnh/comment/caption/page/locale; detail drawer đầy đủ caption, follower, metrics, published_at, updated_at và URL bài thật. Mở bài gốc trong tab mới; copy clipboard thật. Có loading/error/empty và phân trang/virtualization.
6. “Thêm nhanh vào hàng chờ” phải cho biết thêm bài đã chọn hay toàn bộ kết quả, cho xem số job theo ngôn ngữ và bỏ bài trùng. Retry request không tạo bản sao.
7. View Theo dõi viết lại: nguồn bên trái, các job theo locale ở bên phải, trạng thái/máy/attempt/error/time. Filter page, loại, đã/chưa viết lại, locale đích, status, ngày, keyword. Mở xem output của từng lần, retry đúng job lỗi. Không trộn hàng đợi writer với render.

### E. Viết thẻ, kho thẻ và phân bổ page

1. Writer xử lý nguồn nhập tay/import/Viral, tạo job theo locale; output schema rõ có narrator, avatar_hint, title, bodyLines, highlights, CTA, caption, comment1, tags. Có human review, edit và version; schema lỗi phải trả lỗi có thể sửa/retry. Backend job bền vững, không setTimeout giả.
2. Không bắt số dòng/word count bất chấp tiếng và mẫu: có preset thẻ 5 dòng và giới hạn phù hợp, kiểm tràn trên renderer. Giữ import `=== STORY X ===` và JSON có version. Không dùng hashtag “true story” mặc định cho nội dung hư cấu.
3. Kho thẻ filter status unused/reserved/used, locale, category, keyword; count theo cùng tập dữ liệu và scope user; pagination, edit, xem, chọn nhiều. Soft-delete có khôi phục. Hiển thị nguồn và lịch sử dùng.
4. Lấy thẻ: page chip/search -> N (10/20/30/50 hoặc custom) -> cân đối chủ đề -> preview -> chọn render hệ thống hoặc export JSON. Chỉ chọn locale đúng page, trạng thái còn dùng được. Nếu thiếu N, yêu cầu giảm N hoặc tạo thêm, không bổ sung bằng demo.
5. Reserve/commit thẻ trong transaction để hai người không lấy cùng thẻ. Dùng usage relation theo page/locale; không gắn used toàn cục tùy tiện. Chính sách cho phép/tắt reuse trên page khác có cấu hình. Lưu rule và snapshot lúc tạo batch, release reservation theo state machine khi hủy/chưa chạy.

### F. Page workspace tương đương video

1. Bảng page có locale, số template/palette hợp lệ, số avatar, trạng thái metadata, mood/số track, mức sẵn sàng và nút cài. Tên hiển thị video riêng với tên quản lý; có link quản trị Web & Page đúng scope.
2. Mẫu: search tên/slug; sidebar group và selected/total, thay kích thước card; preview lazy-load, đổi palette, select all trong group, checkbox chọn từng mẫu, Sửa. Không dựng hàng trăm iframe hoạt động cùng lúc.
3. Inventory 76 template local và 99 nhãn trong video: lập danh sách ID/nhóm và phần thiếu dựa vào tài nguyên của mình. Không bịa đủ 99 bằng duplicate; mẫu không có asset nguồn phải ghi thiếu và dựng mẫu tương đương chức năng bằng asset hợp lệ của mình. Palette count là đơn vị riêng, không cộng palette để đạt template count.
4. Nâng cao: lọc kiểu, biến thể nền chuyển động; import/export preset page JSON có schema/validation/preview diff; soát chữ tràn theo tất cả preset locale. Nếu cần “dán mã”, dùng schema cấu hình hoặc sanitizer/allowlist cho template, không eval JavaScript tùy ý. Modal sửa giữ layer controls, màu/vị trí/kích thước/bật tắt, reset/undo và preview đồng nhất output.
5. Avatar: drag-drop ảnh, chọn nhiều ảnh/thư mục, nhập avatar.csv có preview mapping/validation/duplicate detection. Sửa tên, gender hint, age range và xác nhận bằng người; không khẳng định metadata AI là chính xác. Ưu tiên metadata có sẵn/hint người kể, có manual override; không cần gửi ảnh sang AI nếu người dùng chưa cấu hình và chọn dùng.
6. Avatar gắn page theo quan hệ, bỏ khỏi page không xóa khỏi kho chung. Có thông báo dùng ở page khác; filter thiếu metadata/nam/nữ, thống kê nhóm tuổi, thêm từ kho chung và vòng xoay giảm trùng. Hint không khớp phải hiện fallback reason.
7. Music: mood dễ chọn; nâng cao searchable với checkbox từng bài, chọn/bỏ tất cả theo scope rõ, play/pause một track mỗi lần, duration thực. Upload file thật theo giới hạn cấu hình (mặc định 30 MB như nhãn video), kiểm MIME/dung lượng, xử lý lỗi; không chỉ nhập path. Giữ kho riêng của mình và provenance/license. Có fade/volume và quy tắc loop/trim theo duration video.
8. Sticky save/undo, dirty indicator, rời trang có cảnh báo; lưu thất bại không báo thành công. Chỉnh cấu hình page chỉ tác động batch mới; batch cũ giữ settings snapshot. Duplicate preset sang page khác có diff và xác nhận phạm vi.

### G. Batch, worker, JSON và kết quả

1. Bảng batch có name/page/locale, nguồn render-system/export-json, status X/N, requested_by/created_by, worker chỉ định hoặc bất kỳ, count, created_at, completed_at. Search/filter và progress thật. Có detail page với item và error log.
2. JSON export phải có schemaVersion, batch ID, item IDs, payload/caption/comment1, settings snapshot, renderer version, asset references và checksum. Download thật và import lại để kiểm schema. Bản JSON không chứa token hoặc đường dẫn bí mật máy chủ.
3. Nhãn “Hoàn tất” cho dựng ngoài là xác nhận thủ công có actor/time/note, trạng thái khác verified-render-completed. Không cộng vào số video đã kiểm chứng chỉ vì đã export hoặc đã bấm hoàn tất. Import manifest kết quả có kiểm checksum để chuyển sang verified nếu có file thật.
4. Worker riêng Mac/Windows do mình kiểm soát; key sinh mật mã/lưu hash/revoke; heartbeat TTL, metrics cache/disk/concurrency thật. Không copy installer của đối thủ. Installer của mình phải được kiểm checksum và hướng dẫn cài rõ.
5. Atomic claim/lease fencing, idempotent callbacks, recovery sau crash, bounded retry/backoff, giới hạn CPU/RAM. Tách writer worker khỏi renderer. Máy offline không nhận job, revoked key không cập nhật kết quả.
6. Một resolver chung cho preview và xuất video, deterministic seed và snapshot. Sửa nội dung US/fr/nl không lẫn text fixture. Render MP4 thật với codec/duration/audio/9:16 đã kiểm bằng công cụ media. Có output manifest và log.
7. Gallery Dựng video giống luồng thấy ở V1: thumbnail mỗi item, tên file, status/time/template, Mở/Chỉnh, Dựng lại và Mở thư mục khi worker hỗ trợ. Browser không tự mở đường dẫn thư mục tùy ý; helper có giao thức rõ và scope path an toàn, hoặc cung cấp “Chép đường dẫn”/download thay thế có nhãn đúng. Không fake thành công.
8. Rerender tạo attempt/version output, giữ bản cũ và audit; edit không biến đổi file hoàn tất âm thầm. Tải MP4/TXT/ZIP thật gồm caption/comment1 khớp ID từng item; kiểm quyền download.

### H. Stats, Web & Page và Telegram

Stats có date picker, searchable page dropdown, locale, nhân viên × locale và breakdown page. Dùng dữ liệu thực; đếm theo thời điểm hoàn tất và timezone được chọn, tách completed render/manual external/published. Có CSV export như cải tiến.

Web & Page có Web của tôi/Page của tôi, domain và các page được gán; form đăng ký tên/slug/domain -> pending -> admin approve/reject với audit. Key kết nối CMS chỉ ở server, không trong form người dùng hoặc file export. Chưa có adapter CMS thì báo chưa kết nối; không giả báo publish.

Tích hợp Telegram theo thiết kế outbox/polling/allowlist trong audit cũ, ngay app 3020. Sự kiện cần thêm: import nguồn, writer job ready/failed, card thiếu locale hoặc thiếu số lượng, batch queued/started/completed/partial_failed, helper offline/recovery/disk low, export ready/failed, website registration pending/approved/rejected, đồng bộ Radar failed/recovered và báo cáo ngày. Chỉ gửi các event có dữ liệu thật, gom theo batch và module, quiet hours, retry có giới hạn và lịch sử delivery. Bot chỉ đọc /help /status /queue /batch <id> /errors /today; quyền theo người/chat liên kết. Không mở public localhost. Thiếu token/chat ID thì code hoàn chỉnh kèm mock test và trạng thái chưa cấu hình, không tuyên bố bot đã kết nối.

### I. Tối ưu thêm cho View US

- Preset US theo từng page: en-US, CTA/caption/comment tiếng Anh, timezone America/New_York/Los_Angeles theo cấu hình và DST; lưu UTC, hiển thị thêm giờ Việt Nam.
- Một bảng điều khiển readiness trước tạo lô: nội dung hợp lệ, locale, template/palette, avatar, nhạc/background, worker, dung lượng; bấm từng lỗi để đi sửa đúng chỗ.
- Tìm kiếm hợp nhất source/card/batch/page; saved filters, keyboard shortcut, auto-save draft, undo/restore, bulk preview trước hành động nhiều mục.
- Chống lặp: source dedupe + normalized text hash + usage history theo page; cảnh báo chứ không tự xóa nội dung tương tự.
- Lập kế hoạch luân phiên mẫu/avatar/nhạc bằng seed và lịch sử gần đây. Cho thấy phân bổ trước khi render; không hứa tăng view từ cấu hình này.
- Đo bottleneck writer/queue/render, thời gian trung vị và tốc độ thực tế; không ETA giả khi chưa có đủ mẫu.
- Dashboard có trạng thái nguồn dữ liệu, last sync, lỗi cần xử lý và hoạt động gần nhất; phân biệt dữ liệu chưa có với số 0.
- Responsive desktop 1280/1440 và mobile 390; sticky action dễ dùng, bảng cuộn ngang trong vùng riêng; accessibility labels, contrast, focus và thông báo tiến trình.
- Backup/restore và migration có kiểm tra; log có correlation ID xuyên source -> writer -> card -> batch -> render -> notification.

### J. Thứ tự thực hiện và tiêu chí không được bỏ qua

**Phase 0:** tái hiện P0, lập baseline/git diff/backup, dọn giả thành empty state có kiểm soát, chốt schema và thương hiệu.

**Phase 1:** auth/DB/page assets/settings/preview thật. Nghiệm thu fresh session, locale US/FR/NL, save/reload và snapshot không đổi lô cũ.

**Phase 2:** source import -> writer -> cards -> reserve theo page -> batch. Nghiệm thu một nguồn viết nhiều locale, schema lỗi/retry, không lấy trùng khi hai request đồng thời.

**Phase 3:** worker + MP4 + JSON + kết quả gallery/stats. Nghiệm thu 10 item cô lập với 2 worker/concurrency giới hạn; file thật, retry chỉ item lỗi, callback lặp không nhân output, restart không mất job, export/import JSON khớp.

**Phase 4:** Radar/Viral/Web & Page. Nghiệm thu bằng fixture test có nhãn rõ và import dữ liệu thật do mình cung cấp; mọi filter thực sự thay query/kết quả, nguồn unknown không có metric bịa. Chưa có external API thì ghi dependency và adapter manual hoạt động.

**Phase 5:** Telegram, dashboard, tối ưu và bàn giao. Mock test success/429/timeout/permanent failure/unauthorized/restart; gửi thật khi đã cấu hình hợp lệ, không báo pass khi chưa có token.

Sau mỗi phase cập nhật `FEATURE_PARITY.md` có F01–F25: not_started/implemented/verified/blocked; file/route, test, bằng chứng ảnh/video/file output, dependency còn thiếu. Không ghi verified chỉ vì route trả 200 hoặc nút hiện toast. Mọi chức năng source-video chưa chứng minh bên trong phải ghi mức bằng chứng phù hợp.

Kiểm tra cuối: typecheck + lint cấu hình đúng version + production build; security/ownership tests; browser fresh session và saved session; media metadata và ZIP mở được; filters/count nhất quán; lỗi asset, worker offline, disk low, DB write failure; performance nhiều template/card và mobile. Không public post Facebook hoặc chạy installer đối thủ để nghiệm thu.

Bàn giao README khởi động app+writer+renderer+bot, `.env.example` không bí mật, migration/rollback, inventory assets, ma trận parity đầy đủ, ảnh từng màn, video demo xuyên suốt dùng dữ liệu thử có nhãn, đường dẫn MP4/ZIP/JSON thật và kết quả lệnh test. Tách rõ những gì hoạt động ngay, những gì cần API/token/tài nguyên bổ sung. Không tuyên bố “giống hết” khi còn F-ID chưa verified.
