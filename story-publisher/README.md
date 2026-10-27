# The Story Publisher — ứng dụng đăng Reels độc lập

## Cách vận hành đã chốt (25/10/2026)

- Chủ Page tự gen và tải video về từ Studio, rồi nhập MP4+TXT hoặc ZIP vào Publisher. Không tự đồng bộ từ Studio.
- Năm Page thử nghiệm dùng tên quản lý mới, thị trường Ba Lan, nhưng nhập giờ theo Việt Nam (`Asia/Ho_Chi_Minh`) để chủ Page dễ chọn. Quốc gia thị trường và múi giờ nhập lịch là hai thông tin độc lập.
- Lịch chỉ lưu ở Publisher. Worker đợi tới giờ mới bắt đầu upload và gửi `video_state=PUBLISHED`, không gửi `scheduled_publish_time` sang Meta. Đây là API đăng ngay khi tới giờ, không phải tự bấm Chrome. Upload/xử lý có thể khiến bài xuất hiện muộn hơn giờ mục tiêu.
- Comment 1 chỉ gửi sau khi Meta xác nhận bài đã xuất bản; Telegram báo xác nhận lịch và đăng thành công kèm tên Page/bài/link.
- Bản local cần máy bật, có mạng, dịch vụ chạy và không ngủ. Tắt máy/ngủ máy không thể đăng; muốn chạy khi máy tắt phải chuyển worker và video lên server 24/7 (chưa triển khai).
- Gia hạn token người dùng qua Meta ngày 25/10: giao diện báo token mới hết hạn 24/12/2026. Page token vẫn có thể bị thu hồi; không coi token là vĩnh viễn.

Ứng dụng: http://localhost:3030 · Video Studio vẫn ở http://localhost:3020.

## Dùng ngay

1. Mở `Mở The Story Publisher.command` ở thư mục View US.
2. Vào **PAGE & GIỜ ĐĂNG**, nhập Page ID, tên Page, quốc gia, múi giờ IANA và khung giờ. Mỹ/Canada/Úc có nhiều múi giờ; chọn theo khán giả của Page.
3. Dán **Page Access Token** đúng Page. Hệ thống kiểm tra `/me` trả đúng ID rồi lưu mã hóa AES-256-GCM. Việc này xác nhận danh tính token, chưa chứng minh đủ quyền đăng.
4. Nhập ZIP từ Studio, hoặc các cặp `cùng-tên.mp4` + `cùng-tên.txt`. TXT hỗ trợ UTF-8/BOM/UTF-16, Content, Caption, Comment 1 nhiều dòng. File trùng SHA-256 không nhập lại. TXT thiếu caption cần sửa trước khi lên lịch.
5. Chọn video, chọn Page → xếp khung giờ tự động / giờ cụ thể / đăng ngay → **Xem lịch dự kiến** → **Xác nhận**.
6. Theo dõi LỊCH ĐĂNG. Đã tải xong video không đồng nghĩa đã xuất bản; chỉ `publishing_phase.publish_status=published` mới báo thành công.
7. Telegram báo khi xác nhận lịch và khi Meta xác nhận bài đã đăng, kèm Page/giờ/link. Bình luận được gửi sau khi bài xuất bản; lỗi bình luận hiện riêng.

“Giờ vàng” là khung giờ người dùng chọn để thử nghiệm, không phải dự đoán hiệu quả. Chưa có tích hợp Insights để tối ưu tự động. Lịch lưu UTC và snapshot múi giờ; giờ mùa hè được chuyển theo IANA. Lịch đã xác nhận không đổi khi sửa giờ Page.

## Meta, TikTok và Genlogin

BM/Business Center TikTok không cấp quyền đăng Facebook. Bản này đăng Facebook Page Reels qua Meta Graph API (`v26.0`, đổi bằng biến META_GRAPH_VERSION khi cần). Chưa triển khai đăng TikTok.

Cần Meta App phù hợp, Page Access Token và quyền/task của người quản lý Page: pages_manage_posts, pages_read_engagement; pages_show_list khi lấy danh sách Page. Comment 1 cần pages_manage_engagement cùng các phụ thuộc Meta yêu cầu. Dùng ngoài vai trò App có thể cần Advanced Access/App Review/business verification. Không dùng cookie Facebook làm token và không lấy token từ Genlogin.

Có hai cách kết nối: nhập Page Token riêng hoặc dùng User Access Token để đọc danh sách Page, chọn nhiều Page và kết nối. Chưa triển khai Facebook Login OAuth vì cần cấu hình Meta App/redirect thực tế. Token được nhập tại máy, không gửi trong chat. Không tự gia hạn token; lỗi quyền/token sẽ tạm dừng Page để người dùng cập nhật.

Chrome và trình duyệt Genlogin mở cùng URL local. Extension Manifest V3 ở `browser-extension/` và ZIP `The-Story-Publisher-Extension.zip` chỉ mở Publisher một chạm, không xin quyền đọc trang/cookie. Chrome: chrome://extensions → Developer mode → Load unpacked → chọn thư mục. Genlogin: Extensions → thêm thư mục/ZIP theo giao diện phiên bản; có thể dùng Start URL http://localhost:3030/ trong profile.

Chưa xác minh/cài tiện ích vào profile Genlogin của người dùng, chưa có chức năng điều khiển profile qua API Genlogin. Tài liệu công khai tìm được xác nhận API liệt kê profile và Extensions; không suy đoán endpoint mở profile.

## Dịch vụ nền và phục hồi

Node.js >=24, SQLite tích hợp Node; không cần npm install. Giải nén ZIP dùng /usr/bin/python3 trên macOS.

- `node service.mjs start|stop|status|restart`
- `npm start`: chạy foreground (chỉ dùng khi dịch vụ nền đã dừng).
- LaunchAgent: ~/Library/LaunchAgents/com.thestory.publisher.plist, RunAtLoad + KeepAlive.
- Log: ~/Library/Logs/TheStoryPublisher/.
- DB, file video và khóa mã hóa: `data/`. Khi sao lưu cần sao lưu cả DB và secret.key; dừng dịch vụ trước khi copy để bảo đảm WAL đã đóng. Không đưa thư mục này lên Git.
- Máy phải bật, có mạng và không ngủ vào giờ đăng. Chạy nền không khắc phục mất điện/ngủ máy. Lịch quá hạn >30 phút chuyển “Quá giờ”, không tự đăng dồn.
- Lưu video ID trước các bước tiếp theo. Khởi động lại đối soát ID cũ, không tự tạo Reel mới. Thao tác POST bị đứt mạng có thể đã tới Meta; chuyển cần đối soát, không tự gửi lặp lại.
- Nếu dừng sau khi công bố bài nhưng trước khi bình luận: worker tiếp tục bình luận pending. Nếu mất phản hồi gửi bình luận: chuyển review, không tự bình luận trùng.
- Telegram có outbox SQLite, backoff tối đa 5 lần. Giao nhận at-least-once: mất phản hồi Telegram có thể gây lặp thông báo, không gây đăng video lặp.
- Không xóa Page/video đã có lịch sử; dùng tạm dừng/hủy lịch để giữ đối soát.
- Bản đầu giới hạn nhập 300 MB/lần, ZIP giải nén 600 MB, 500 video/kế hoạch. Kiểm tra chữ ký container MP4, không kiểm tra đầy đủ codec; Meta xác thực video khi upload. Giao diện lịch hiển thị tối đa 1.000 mục gần nhất.

## Kiểm thử

`npm test`: parser UTF8/UTF16, token encryption, DST chuyển giờ hai chiều, khung giờ đã giữ, status published, URL upload allowlist, tích hợp HTTP từ import đến scheduler/Meta adapter/comment/Telegram bằng mock. Mock chỉ tồn tại trong test/mock-server.mjs; production luôn gọi API thật. Không có Page token trong test.

Chưa có Page Access Token nên chưa đăng thử lên Facebook thật. Thành công với mock không thay thế kiểm thử quyền/API của Meta App thực tế.

## Nguồn tham khảo đã đọc ngày 23/10/2026

- Meta official Reels collection: https://github.com/fbsamples/Facebook-Reels-Publishing-API-Postman-Collection
- Meta Postman: https://www.postman.com/meta/facebook/request/juhnm3q/4-publish-reel
- Meta SDK Page: https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/adobjects/page.py
- TikTok Direct Post: https://developers.tiktok.com/doc/content-posting-api-get-started
- Genlogin profile API: https://docs.genlogin.com/genlogin-api/profile-api/1.-profile-list
- Genlogin Extensions: https://docs.genlogin.com/group-profiles/extensions
- Genlogin Start URL: https://docs.genlogin.com/group-profiles/create-profile/overview

## Workspace V2 (23/10/2026)

Đã thêm dashboard, kho dạng thẻ có tìm kiếm/lọc/chọn hàng loạt và phân trang, lịch nhóm theo ngày/đổi giờ, luồng chọn nhiều Page từ Meta, trạng thái xác thực/quyền thiếu/lỗi. Xem RESEARCH_UX_V2.md cho nguồn nghiên cứu, giới hạn và kết quả kiểm tra. Test hiện tại 9/9 PASS.
# Đối chiếu giờ đăng

## SaaS UX restructuring · 26/10/2026

Thay đổi trình bày tách trong `public/ux.js`, nạp sau controller `public/app.js`. `public/index.html` nạp lớp UX; `public/style.css` thêm theme Blue/Slate, masthead ngang họa tiết chấm, compact topbar 56px, responsive layout. `public/app.js` chỉ đổi phân trang kho thành 12 video cho grid 3/4 cột. Không sửa `public/time.js`, `meta.mjs`, cơ chế dựng Studio, worker đăng hoặc quy tắc Comment 1. Giữ Studio bản mới **http://localhost:3020/render** theo xác nhận mới nhất, không chuyển 8088.

- KPI chỉ ở Tổng quan. Hàng vận hành 7:3: bảng Page + hạ tầng/cảnh báo/4 bài tiếp theo, tô đỏ Page hết kho chưa đăng hoặc không có lịch chờ. Hàng dưới: biểu đồ và lịch rút gọn 7 ngày; 24h chuyển sang tab Lịch đăng.
- Kho: dropdown đếm video từng Page và chưa gắn Page, action bar mở modal nhập/xếp lịch. Tái sử dụng chính form, không clone state/ID/token. Khi mở nhập file, bộ chọn Page chuyển vào modal và trở về khi đóng. Card compact, giờ VN/địa phương trên một dòng, nút đổi giờ nhanh; giữ chọn/xem/sửa/xóa/đăng ngay có xác nhận.
- Lịch: dense table thumbnail 48x64, Page/quốc gia, giờ, trạng thái và bình luận, thao tác. View Theo ngày dùng timeline 24h có lọc Page riêng và điều hướng tuần; Tổng quan mở đúng Page/ngày sang đây. Giữ các nút hủy/đổi giờ/đối soát và views 1k.
- Page: grid hai cột toàn chiều ngang. Thêm mới mở modal Quét User Token / nhập Page Token; form Meta gốc chuyển tạm vào modal rồi về Kết nối, không sao chép token. Giữ kiểm tra/tạm dừng/chi tiết quyền. Slot Manager dùng chip HH:mm, quy đổi theo ngày, quick select 24h và time input phút lẻ, danh sách nhanh, sticky footer Lưu/Xếp video. Lưu vẫn gọi API cũ, lịch đã xác nhận không bị dời.
- Kết nối: tài khoản Meta, Bot Telegram và Studio 3020. Giờ báo cáo tổng hợp là chức năng bổ sung tách ở `telegram-summary.mjs`, cấu hình mã hóa qua action `save-summary` của `/api/telegram`, mặc định tắt. Tick kiểm tra phút VN, outbox key ngày/giờ chống lặp. Không trì hoãn hay thay đổi thông báo sự kiện cũ. `server.mjs` chỉ thêm cấu hình báo cáo, worker báo cáo riêng và phục vụ ux.js; các endpoint/worker đăng cũ giữ nguyên.
- Kiểm thử: `test/telegram-summary.test.mjs` và phần cấu hình summary trong integration test, cùng toàn bộ test hiện có. Trình duyệt kiểm tra không trùng ID, một form Meta/một form Page, topbar đúng 56px, KPI ẩn ở tab con, modal nhập/xếp lịch, tab thêm Page, chip phút, dense table và timeline. Đối soát với backup: Page/cấu hình/token, asset và giờ/nội dung job không đổi. Không đăng/hủy/dời lịch hay gửi Telegram thử trong lượt refactor.

Backup trước sửa: `/private/tmp/story-publisher-before-saas-ux.tgz` (source), `/private/tmp/publisher-before-saas-ux.db` (SQLite; chứa dữ liệu riêng, không chia sẻ). UI có thể dùng source backup để phục hồi; không khôi phục database cũ đè lên lịch mới.

### Tổng quan & thư viện video

Rà soát tiếp ngày 26/10: bộ lọc Page được giữ khi mở Xem lịch đầy đủ từ Tổng quan; kiểm tra Page trống, ngày/tháng, chuyển tuần qua ranh giới tháng, thẻ đổi giờ và xem video không lưu thay đổi. Bộ kiểm thử 29/29 đạt. Không dời lịch hay đăng thêm trong lượt hoàn thiện giao diện.

- Thẻ video hiển thị trạng thái, ngày/giờ Việt Nam 24h và giờ quốc gia Page; nút Đổi giờ dùng lại luồng reschedule, không tạo job mới. Video đã có job không được chọn xếp lịch lần nữa. Xếp lịch thủ công và nhập file vẫn có trong khối thu gọn; bỏ sidebar chiếm diện tích.
- Tổng quan có bộ lọc Page chung, biểu đồ theo ngày trong tháng / tháng trong năm, và bảng số liệu kiểm tra. Đã đăng tính theo `published_at`, không lấy giờ dự kiến để giả số liệu; lịch chờ/đang đăng là chuỗi riêng. Bài hủy không tính; lỗi không cộng vào số đang chờ của biểu đồ.
- Lịch 7 ngày có chuyển tuần, chọn ngày bắt đầu, chọn tất cả Page/từng Page. Chọn một ngày để xem 24 hàng giờ 00–23 với video, tên Page, phút chính xác, trạng thái, giờ quốc gia và nút xem/đổi giờ. Lịch đã đăng theo giờ xác nhận thực tế, lịch chờ theo scheduled_at. Thống kê và lọc ngày dùng cố định múi giờ Việt Nam.
- Chỉ đổi giao diện/đọc số liệu; không thay đổi job hay lịch đã xác nhận, không gửi bài/Telegram thử. Kiểm thử mô hình timezone, chuyển ngày/tháng, năm nhuận, lọc Page, lịch hủy và số liệu thực tế.

### Chọn phút ngay trong khung giờ

Mỗi ô giờ có danh sách phút 00–59; đổi phút tự chọn ô đó và cập nhật giờ quốc gia Page. Khung phút lẻ đã lưu xuất hiện trực tiếp trong bảng, không bị làm tròn về :00. Nhiều khung cùng một giờ vẫn giữ đủ. Đổi ngày đối chiếu không làm mất các lựa chọn chưa lưu. Bấm Lưu khung giờ mới cập nhật cấu hình cho lịch mới; các lịch đã xác nhận không bị dời. Ô nhập HH:mm thêm vẫn giữ để nhập nhanh nhiều khung.

### Tích hợp Studio → Publisher

Publisher giữ nguyên Studio ở cổng 3020 (không sửa mã nguồn, giao diện hay dữ liệu/cấu hình Studio). Nút Gen video trong Tổng quan mở Studio; nút của từng Page truyền `?page=<Studio ID>` để chọn đúng Page. Cài đặt Page có công tắc Tự nhận lô gen mới và xếp lịch. MP4 + TXT/ZIP nhập tay, gen tay và các Page ngoài 5 Page liên kết vẫn giữ nguyên.

Ánh xạ 5 Facebook Page ID ↔ Studio Page ID cố định trong studio-bridge.mjs, đồng thời kiểm tra tên khớp. Watcher đọc SQLite Studio chỉ đọc mỗi 10 giây; chỉ nhận lô `completed` đủ số video, file trong public/renders, caption hợp lệ và locale PL. Lô mới được sao chép MP4 và nguyên title/content/caption/comment1 trực tiếp từ payload, sau đó xếp vào khung Việt Nam tương lai chưa có bài. Chỉ đủ lô mới chuyển để giữ thứ tự seq; không chuyển lô đang gen, lỗi hoặc hủy.

Mỗi item có dấu chuyển lưu SQLite, kiểm tra thêm hash + Page, xếp lịch trong cùng transaction. Poll/restart không nhập hay đăng trùng. Lỗi token/caption/sai Page hiện ở bảng tích hợp và giữ lô gốc nguyên trạng để sửa rồi thử lại. Lô cũ trước khi bật không được tự nhập; riêng lô Ukryty Testament `batch_1792944054811` đã được người dùng yêu cầu nhận 20 video và đăng thật 1 video đầu tiên. Lô Mroczne đã nhập tay trước đây không tự nhập lại.

Tắt công tắc để chỉ gen tay; bật lại chỉ nhận lô có thời điểm bắt đầu sau lúc bật. Các lịch đã xác nhận không bị hủy khi tắt nhận lô mới. Muốn dừng đăng dùng Tạm dừng Page riêng. Cả Studio và Publisher cần máy bật, có mạng, không ngủ; không phải cloud. API backfill chỉ nhận batch thuộc đúng ánh xạ và đã hoàn tất.

### Cảnh báo 1.000 views

Tự theo dõi các video đã được Meta xác nhận xuất bản qua Publisher, trên tất cả Page đã kết nối, kể cả Page đang tạm dừng đăng. Đọc trường Video `views` (đã kiểm tra thật với token hiện tại); không cần mở rộng `read_insights` chỉ để dùng trường này. Mỗi video kiểm tra khoảng 10 phút/lần, xử lý tối đa 10 video mỗi nhịp 30 giây để giới hạn lưu lượng. Khi views >= 1000, tạo thông báo Telegram gồm Page, tiêu đề, lượt xem và URL Reel, nhắc làm link. Không tự tạo link, viết bài hay thêm bình luận mới.

Mốc và mã outbox theo Page + video lưu trong SQLite để không tạo cảnh báo lặp sau khởi động lại. Lỗi API không tính thành 0; hiển thị trong thẻ bài, thử lại sau 1 giờ. Máy phải bật/có mạng/không ngủ; chỉ số Meta có thể cập nhật trễ, không phải thông báo tức thời. Cảnh báo 1.000 là riêng với thông báo đăng thành công và cảnh báo tồn kho. Test 999/1000/>1000, nhiều Page, restart và lỗi quyền bằng mock; không giả số views trong dữ liệu thật.

### Telegram: cập nhật theo yêu cầu mới

Không gửi khi xếp lịch, đổi giờ hoặc bấm Đăng ngay. Chỉ gửi thông báo đăng thành công sau khi Meta xác nhận `publishing_phase.publish_status=published`, gồm tên Page, tiêu đề, giờ và link Reel; chống lặp theo job ID. Cảnh báo gần hết video vẫn giữ độc lập. Nút thử kết nối bot là thao tác kiểm tra riêng.

## Kho riêng từng Page (25/10/2026)

- Tổng quan: bảng tiến trình, chọn từng Page/tất cả, số chờ/đã đăng/còn lại và bài tiếp theo.
- Page & khung giờ → Cài đặt · Video & giờ đăng: nhập cặp MP4 + TXT cùng tên hoặc ZIP. TXT có `Title:`, `Caption:`, `Comment 1:`; giữ xuống dòng và Unicode. Video cũ không có Page vẫn ở kho Chưa gán, không tự phân phối vào 5 Page.
- Mặc định bật tự xếp lịch khi nhập. Tắt ô này để chỉ nhập kho. Video đủ caption được sắp thứ tự tên tự nhiên (2 trước 10) vào các khung giờ tương lai chưa có bài. Thiếu TXT không nhập; thiếu caption nhập kho nhưng chưa xếp lịch; file trùng hash bị bỏ qua.
- Chọn tối đa 12 khung/ngày trong bảng 24 giờ Việt Nam, có đối chiếu ngày/giờ quốc gia Page theo ngày đã chọn; có ô thêm phút lẻ. Lưu khung mới không dời các lịch đã xác nhận. Có thể xếp riêng các video còn chưa có lịch.
- Đăng ngay từng video: xác nhận Page, caption và Comment 1. Nếu video đang chờ, chuyển chính lịch đó sang hiện tại; không tạo bản trùng. Video đã đăng/đang xử lý không được đăng lại qua nút này.
- Kho còn tối đa 3 video chưa đăng: cảnh báo trên bảng và Telegram; không lặp lại liên tục khi stock vẫn thấp. Bổ sung lên trên 3 sẽ mở lại chu kỳ cảnh báo kế tiếp. Bao gồm video đang chờ/đang xử lý và video chưa xếp, không tính video đã đăng.
- Vẫn là lịch nội bộ trên Mac; đến giờ mới upload và gọi PUBLISHED, không dùng lịch Facebook. Máy bật, có mạng, không ngủ. Không nối tự động từ Studio.

Ô ngày giờ luôn nhận giờ Việt Nam (UTC+7), không phụ thuộc múi giờ trình duyệt. Bên cạnh hiển thị ngày/giờ tại quốc gia Page; lịch dự kiến, hàng đợi và mục sắp đăng dùng cùng phép đổi. Giờ địa phương tính theo IANA và ngày đăng nên tự áp dụng DST. Ví dụ 21:00 Việt Nam ngày 26/10/2026 là 15:00 Ba Lan. Với quốc gia nhiều múi giờ, đối chiếu dùng vùng mặc định của thị trường (Mỹ: New York, Canada: Toronto, Úc: Sydney).

