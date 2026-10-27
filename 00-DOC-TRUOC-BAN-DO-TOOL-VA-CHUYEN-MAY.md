# VIEW US — Sổ tay toàn bộ tool, code và chuyển máy

Cập nhật theo cấu trúc/mã nguồn đã kiểm tra ngày **27/10/2026**. Đường dẫn máy cũ: `/Users/tony/Downloads/View US`. Đây là tài liệu bàn giao, không phải lệnh cho phép AI tự đăng bài, xóa dữ liệu, đổi token hoặc khởi động worker.

## 1. Đọc nhanh: cần gì thì mở đâu?

| Bạn cần làm | Dùng đúng bộ | Địa chỉ / điểm vào |
|---|---|---|
| Gen video, chỉnh mẫu, avatar, nhạc, cấu hình Page | `reels-studio-v2/` — bộ Studio đang tích hợp | http://localhost:3020/render |
| Kho video, xếp giờ, đăng Reels, Comment 1, Telegram, views | `story-publisher/` — bộ Publisher đang vận hành | http://localhost:3030/ |
| Viết file nhiều story để nạp Studio | Gói `content-tools` trong `skill/installed-packages-2026-10-25/` | Đọc SKILL.md và tài nguyên của gói |
| Viết caption, comment, prompt ảnh theo bộ Page riêng | Gói `drama-post` trong cùng thư mục skill | Không nhầm số p1/p2/p3 giữa các gói |
| Viết truyện dài theo bible, nhiều chương | Gói `new-story` + quy tắc xuất Blogbio trong `web-pagination/` | Nội dung truyện và định dạng nhập CMS là hai lớp riêng |
| Đưa truyện lên web thành nhiều trang riêng | Blogbio admin + `web-pagination/HUONG-DAN-SERIES-CHAPTER.md` | https://thestory.danhngon.pro/admin/series |
| Xem hướng dẫn có mũi tên, giọng đọc | `web-pagination/HUONG-DAN-SERIES-MUI-TEN-VA-GIONG-DOC.mp4` | Video mới; không nhầm video JS cũ |
| Nghiên cứu trend PL/FR/NL, xem kho kiến thức | Tab AI nghiên cứu trong Publisher | Code: `drama-agent.mjs`, `knowledge-base.mjs` |
| Dùng kho mẫu cũ 76 mẫu / kiểm tra engine cũ | `story_video_generator/` | Cổng 8088; không phải Studio 3020 |
| Tool tạo video độc lập dự phòng | `reels-video-generator-standalone/` | Cổng 8090; không mặc định nối Publisher |
| Dashboard quản lý khác / code thử nghiệm quản trị | `media-ops-hub/` | Next.js mặc định 3000; KHÔNG thay Publisher 3030 |
| Màn hình AI Office Ngọc Rồng | `dragon-ball-ai-office/` | 8899; giao diện minh họa, không phải bằng chứng agent thật đang làm việc |

**Hai tool chính hiện tại: 3020 dựng → 3030 nhận, xếp giờ và đăng.** Không chạy tất cả project chỉ vì đều có package.json.

## 2. Luồng vận hành thực tế

```text
Brief / bible / kịch bản từ AI
        ↓
Studio 3020: chọn đúng Page → nhập nội dung → dựng lô
        ↓ lô completed, đủ MP4 + caption, đúng Page/ngôn ngữ
Cầu nối Studio trong Publisher, kiểm tra khoảng mỗi 10 giây
        ↓
Kho Publisher → xếp vào khung tương lai còn trống của Page
        ↓ đến giờ
Local upload → Meta xác nhận xuất bản → Comment 1 / Telegram
```

- Bản local là **API đăng khi đến giờ**, không phải bot tự bấm giao diện Business Suite.
- Chỉ các Page có ánh xạ được xác nhận mới tự nhận lô. Không phải Page nào tồn tại trong Studio cũng đã có trong Publisher.
- Bộ 9 Page đang quản lý: Mroczne Dziedzictwo, Ukryty Testament, Sekrety Rodziny, Za Zamkniętymi Drzwiami, Gorzkie Dziedzictwo, Cienie Spadku, Masques Tombés, Dernières Volontés, Behind Estate Gates. Kiểm tra DB/API để lấy trạng thái mới nhất; tên thư mục không chứng minh Page đã kết nối.
- Cầu nối so tên chuẩn hóa, locale, file, hash và item ID; nhập lô + xếp lịch trong transaction. Page tạm dừng/lỗi token có thể làm lô chưa được chuyển; video gốc vẫn giữ trong Studio.
- Tắt tự nhận lô không hủy các lịch đã tạo. Tạm dừng Page khác với dừng dịch vụ.
- Có nhánh thử nghiệm **hẹn lịch trên Meta** cho Dernières Volontés và Behind Estate Gates. Đọc `jobs.delivery_mode`: `local` hay `meta`, không suy từ tên Page. Lịch đã được Meta xác nhận có thể chạy khi máy tắt; local không tự hủy lịch đó. Bình luận/thông báo local vẫn cần dịch vụ hoạt động.
- Giờ chọn thường là VN; giờ quốc gia Page được tính đối chiếu bằng vùng IANA và ngày thực tế. Không cộng cố định 5/6 tiếng quanh thời điểm đổi mùa.
- Publisher/Studio local cần máy bật, có mạng và dịch vụ chạy. Chưa có chế độ đã xác minh tự tắt tool giữa các lượt rồi tự bật lại; đừng cho AI tuyên bố đã có.

## 3. Bản đồ code: giao đúng file cho AI

### A. Studio mới — `reels-studio-v2/`

| Khu vực | File / thư mục |
|---|---|
| Trang gen / các trang chức năng | `src/app/render/`, `src/app/batches/`, `src/app/settings/` |
| API | `src/app/api/` |
| Database SQLite, tạo schema | `src/lib/db.ts` |
| Truy cập dữ liệu | `src/lib/repository.ts` |
| Đọc kịch bản / định dạng story | `src/lib/storyImport.ts` |
| Render MP4, Chrome headless, FFmpeg | `src/lib/renderEngine.ts` |
| Hàng đợi lô / khôi phục lô | `src/lib/localRenderQueue.ts` |
| Mức song song / hiệu năng render | `src/lib/renderPerformance.ts` |
| Dựng giao diện thẻ | `src/lib/templateRenderer.ts` |
| Cấu hình Page / avatar / xuất lô | `src/lib/studioPageConfig.ts`, `avatarMatcher.ts`, `batchExport.ts` |
| Thanh điều hướng, thành phần UI | `src/components/`, CSS của app |
| Dịch vụ nền macOS | `scripts/manage-local-service.cjs`, `scripts/local-service-supervisor.cjs` |
| Dữ liệu sống | `data/reels_studio.db`, nội dung khác trong `data/` |
| Video đã gen | `public/renders/` |
| Nhạc, ảnh, nền | `public/assets/` và thư viện tài nguyên được DB tham chiếu |

README Studio có mô tả Supabase/helper theo thiết kế ban đầu. Bản local kiểm tra hiện tại có SQLite + local render queue; **không mặc định cần Supabase để khôi phục bản local**. Trước khi sửa, xem code và cấu hình thực tế.

### B. Publisher — `story-publisher/`

| Việc cần sửa/kiểm tra | File chính |
|---|---|
| HTTP API, worker đăng, comment, outbox Telegram | `server.mjs` |
| Kế hoạch giờ, timezone, mã hóa, parse TXT | `core.mjs` |
| Gọi Meta: verify, upload, finish, status, videos | `meta.mjs` |
| Trạng thái kết nối / nhận diện lỗi quyền | `connections.mjs` |
| Ánh xạ tên hiển thị Page | `pageIdentity.mjs` |
| Gen xong tự chuyển MP4 + nội dung / Page | `studio-bridge.mjs` |
| Thử nghiệm upload trước, hẹn lịch Meta | `meta-schedule.mjs` |
| Theo dõi views các job đã đăng | `view-monitor.mjs` |
| Quét Page, 5 video gần nhất, ngưỡng views | `page-reports.mjs` |
| Lỗi vận hành, mất mạng, khởi động lại | `operations-monitor.mjs` |
| Báo cáo Telegram tổng hợp | `telegram-summary.mjs` |
| Nghiên cứu Gemini / Search grounding | `drama-agent.mjs` |
| Kiến thức dùng chung, ghi chú biên tập | `knowledge-base.mjs` |
| Kho lưu trữ | `asset-archive.mjs` |
| Giao diện | `public/index.html`, `app.js`, `dashboard.js`, `ux.js`, `research.js`, `time.js`, `style.css` |
| Bật/tắt dịch vụ macOS | `service.mjs` |
| Test | `test/*.test.mjs` |

Những bảng quan trọng trong `data/publisher.db`:

- `pages`: Page ID, token mã hóa, khung giờ, quốc gia, enabled, lỗi kết nối.
- `assets`: file video, caption, comment, hash, Page sở hữu.
- `jobs`: lịch đăng, trạng thái, video_id, comment_id, chế độ giao bài.
- `outbox`: thông báo Telegram và trạng thái gửi; giữ để tránh gửi lặp.
- `events`: lịch sử thao tác/lỗi.
- `studio_links`, `studio_bridge_batches`, `studio_bridge_items`: ánh xạ Studio và dấu chuyển; giữ để không nhập lại lô cũ.
- Các bảng theo dõi views, báo cáo, nghiên cứu và vận hành được module tạo thêm.

**Không chạy lại các script `scripts/recover-*`, `restore-authorized-queue.mjs`, `cleanup-*`, `set-pilot-*`, `schedule-polish-prime.mjs` để “khởi động”.** Đây là tiện ích can thiệp từng đợt, có thể chứa ID/giờ cứng và thay dữ liệu thật. Đọc trước, xác định đúng đối tượng, sao lưu, có yêu cầu rõ ràng rồi mới chạy.

README Publisher có các đoạn lịch sử mâu thuẫn: vừa ghi chưa nối Studio, vừa có phần cầu nối; một số tần suất quét cũ cũng đã đổi. Dùng code + dữ liệu chạy thực tế làm căn cứ, không chỉ đọc đoạn đầu README.

### C. Các project khác

- `story_video_generator/`: bộ mẫu cũ 8088; `server.js`, tài nguyên `assets/`, kho mẫu HTML và hướng dẫn sử dụng. Dùng tham khảo/mẫu hoặc khi bạn yêu cầu bộ cũ, không tự thay bộ 3020.
- `reels-video-generator-standalone/`: Express + `lib/renderEngine.js`, `lib/storyParser.js`, `lib/templateRenderer.js`; kết quả ở `public/outputs/`. Có start.command/start.bat. Không có bằng chứng nó tự nối DB Publisher như Studio V2.
- `media-ops-hub/`: Next.js + Prisma SQLite, quản lý Page/bài/link/Telegram. `prisma/schema.prisma`, `prisma/dev.db`, `src/app/api/queue/pending/route.ts` và `callback/route.ts`. Có API đưa việc cho worker ngoài và nhận callback; sự tồn tại API **không chứng minh có worker Meta đang vận hành**. Đọc `AGENTS.md` của project nếu sửa code bên trong. Không seed/db:push lên dữ liệu thật một cách máy móc.
- `dragon-ball-ai-office/`: `index.html` + `start.command`; giao diện anime/canvas minh họa. Nếu cần chạy an toàn tại máy: `python3 -m http.server 8899 --bind 127.0.0.1` từ thư mục này. Launcher hiện có không ghi bind loopback; không dùng nó như công cụ quản trị có xác thực.
- `web-pagination/`: hướng dẫn nhập Blogbio, dữ liệu sao lưu truyện mẫu, code/video hướng dẫn. `bai6-pagination.js` là cách chia phần JS cũ; ưu tiên native Series/Chapter mới cho bài mới. Không xóa JS toàn site chỉ vì một truyện đã chuyển native; bài cũ có thể còn phụ thuộc.
- `series-mau/`: truyện mẫu 3 phần, content HTML và GIF hướng dẫn; dữ liệu mẫu, không phải server.

## 4. Các thư mục không phải ứng dụng

| Nhóm | Dùng làm gì / lưu ý |
|---|---|
| `1 Closed Doors…` đến các thư mục Page đánh số | Kịch bản, blog, ảnh, tài liệu theo Page. Thư mục không phải định danh Facebook. |
| `10 Mroczne…`, `15 Mroczne…`, hai nhóm Sekrety/Ukryty | Có tên/số trùng và tên cũ. Không tự gộp/xóa; đối chiếu nội dung và Page ID trước. Có tên chứa dấu Unicode tổ hợp hoặc khoảng trắng cuối. |
| `5_pages_balan_assets/`, `page_*_assets/`, `page_mroczne_dziedzictwo_moi/` | Ảnh bìa, avatar, tài nguyên thương hiệu; không phải video queue. |
| `outputs/` | Sản phẩm nội dung, file TXT, nguồn JSON, bảng và script kiểm tra từng lô. Một số build.py/validator chỉ dùng cho lô cụ thể. |
| `80-brief-4-page-27-10-2026/`, `Mroczne-Dziedzictwo-20-brief-moi-27-10-2026/`, `lo-4-Closed-Doors-Verborgen-Waarheden-27-10-2026/` | Các lô brief/nội dung theo ngày; không phải cấu hình runtime. |
| `nghien-cuu-reels-ba-lan/`, `competitor-audit/` | Nghiên cứu, báo cáo audit, lệnh sửa cũ, bằng chứng nghiệm thu; đọc tham khảo, không tự thực thi các lệnh lịch sử. |
| `adsconex/` và PDF hướng dẫn Adsconex ở gốc | SOP nền tảng, quảng cáo, nội dung mẫu. Chính sách/giá/quy tắc quảng cáo phải kiểm tra lại hiện hành; không mặc định số liệu trong tài liệu cũ còn đúng. |
| `skill/` | ZIP và bản giải nén các bộ hướng dẫn viết; xem mục 5. |
| `mẫu/` (tên thực tế có dấu tổ hợp) | Mẫu ảnh và phiên bản skill cũ; không mặc định ưu tiên hơn gói hiện dùng. |
| `Tài nguyên/` (tên thực tế có dấu tổ hợp) | Tài liệu, batch mẫu, extension scheduler cũ và asset. Extension cũ khác extension chỉ mở Publisher. Không cài hàng loạt. |
| `BANG_QUAN_LY*.md`, `LO_TRINH*.md`, `DU_AN_TONG_QUAN*.md`, `PROMPT_ANTIGRAVITY*.md`, `ANTIGRAVITY_VIEW_US_AUDIT_FIX.md` | Kế hoạch/đặc tả/lịch sử, không phải trạng thái live. |
| `.claude/launch.json` | Cấu hình mở/chạy trong môi trường AI cũ; kiểm tra đường dẫn trước khi dùng trên máy mới. |
| `.git/`, `.gitignore` | Lịch sử mã nguồn và quy tắc loại trừ. Git **không phải** backup đầy đủ DB/video/secret. |

## 5. Giao việc viết nội dung cho AI

Các gói được lưu đầy đủ trong:

```text
skill/installed-packages-2026-10-25/content-tools/skills/content-tools/
skill/installed-packages-2026-10-25/drama-post/skills/drama-post/
skill/installed-packages-2026-10-25/new-story/skills/new-story/
web-pagination/claude-blogbio-chapters/SKILL.md
```

- `content-tools`: xuất file cho Studio; bộ Page riêng của skill là Closed Doors / Masques Tombés / Verborgen Waarheden.
- `drama-post`: bộ Page khác, gồm Ombres du Passé, Verbroken Maskers, Stille Schaduwen, Vérités d'Hier, Verborgen Oordeel, Verhalen van Ons, Zu Spät Gefragt. Không dùng p1 một cách mơ hồ.
- `new-story`: bible → caption/comment → truyện web theo phần, ảnh minh họa. Giữ bible và tiến độ khi đổi chat/máy.
- `claude-blogbio-chapters`: bổ sung định dạng xuất CMS; không thay thế bible hay phong cách viết.

Máy mới có thể chưa được cài các skill. Cách giao độc lập với ứng dụng AI: cung cấp thư mục gói hoặc file cần thiết, bảo AI đọc trọn SKILL.md và tài nguyên liên quan. Không chỉ chép mỗi SKILL.md của gói lớn vì còn templates, references, countries và script.

`skill/install_local_skills.py` là script cài theo máy cũ, có đường dẫn `/Users/tony/...` cố định và từ chối ghi đè. **Không chạy nguyên xi trên máy mới**; giao AI kiểm tra/cài đúng vị trí được sản phẩm hỗ trợ. Việc copy gói vào View US chưa đồng nghĩa AI đã tự nhận skill.

Ví dụ câu lệnh:

```text
Đọc gói content-tools tại skill/installed-packages-2026-10-25/content-tools/skills/content-tools.
Làm 20 story cho [TÊN PAGE ĐẦY ĐỦ], ngôn ngữ [mã], chủ đề [chủ đề].
Lưu trong thư mục Page của tôi. Kiểm tra định dạng bằng validator của gói nếu dùng được.
Chỉ viết file, không gen video và không đăng bài.
```

```text
Đọc gói new-story và web-pagination/claude-blogbio-chapters/SKILL.md.
Dùng bible đính kèm; xuất riêng metadata Series và file chapters.txt.
Mỗi phần bắt đầu CHAPTER N - Tiêu đề, thân bài là văn bản thuần.
Giữ nguyên nội dung đã duyệt; không trộn prompt ảnh/caption/checklist vào file nhập CMS.
```

Không mặc định domain trong skill cũ còn là domain bạn muốn: có gói dùng thestorypress.online, trong khi web đang dùng thestory.danhngon.pro. Nêu domain đích rõ ràng, không tự thay link đã đăng.

## 6. Làm link Blogbio đúng cách

1. Tạo/chọn Series. Title và Description ngắn riêng, không dán toàn truyện vào mô tả Series.
2. Trong Series, mở danh sách chương → Create chapter.
3. Dán TXT thuần chứa marker `CHAPTER 1 - ...`, `CHAPTER 2 - ...` vào Description.
4. Keep chapter name → Analyze chapters → kiểm tra đủ số chương/nội dung → Save khi được phép xuất bản.
5. Mỗi chương có URL thật riêng. Thử Previous/Next; không chỉ đổi nội dung trên cùng trang bằng JS.
6. Copy link chương đầu từ CMS để gắn vào Facebook. Đừng tự bịa URL từ slug đề xuất.

**Lỗi đã gặp:** copy từ vùng code của Claude làm CMS lưu `<code>` và font monospace. File TXT tự nó không có font. Dán không định dạng, dùng Paragraph; nội dung HTML nên là đoạn văn, không phải `<pre>/<code>`. Nếu đã lưu sai phải sửa nội dung trong CMS, không chỉ đổi font bên Claude.

**Lỗi trùng:** đã từng có Series 16 mục cho truyện 15 chương vì chương 1 tạo hai lần. Đối chiếu URL và nội dung trước khi gỡ bản dư, không xóa tự động.

Video đúng: `web-pagination/HUONG-DAN-SERIES-MUI-TEN-VA-GIONG-DOC.mp4`.
Video `HUONG-DAN-CHIA-PART.mp4` và mẫu `[STORY_PARTS]` là luồng JS cũ, không phải quy trình native mới.
Các script build/annotate video có thể tham chiếu frame trong `/private/tmp`, giọng macOS Linh và FFmpeg trong node_modules Studio. Chỉ copy MP4 chưa đủ để tái dựng video nguồn; frame tạm có thể không còn.

## 7. Những gì bắt buộc chuyển sang máy mới

### Bộ vận hành chính

- Toàn bộ source `reels-studio-v2/` và `story-publisher/` cùng package-lock, cấu hình và asset.
- `story-publisher/data/` **nguyên bộ**, nhất là:
  - `publisher.db` + các file WAL/SHM nếu sao lưu lúc còn chạy (ưu tiên snapshot SQLite nhất quán thay vì copy nóng).
  - `secret.key`: khóa giải mã token/config. DB cũ + key mới là sai, sẽ mất khả năng đọc token.
  - `media/`: bản MP4 Publisher dùng để upload.
  - `knowledge_base/`, báo cáo và dấu chuyển/hàng đợi trong DB.
- `reels-studio-v2/data/`, đặc biệt `reels_studio.db` và các cấu hình thư viện.
- `reels-studio-v2/public/renders/`, `public/assets/` và mọi file bên ngoài được DB tham chiếu.
- Các file cấu hình riêng như `.env.local`, `.env`, nếu tồn tại: chuyển bằng kênh riêng an toàn, không dán nội dung vào chat, tài liệu hay Git công khai.
- Các thư mục Page, outputs, brief, bible, file chapters, ảnh, template, skill và hướng dẫn.
- Nếu dùng Media Ops Hub: giữ `prisma/dev.db` và cấu hình DATABASE_URL; không thay bằng DB mới/seed mặc định.

### Những thứ nằm ngoài View US

- Cài đặt skill thực tế của máy cũ có thể nằm trong `/Users/tony/.codex/skills/` và `/Users/tony/.agents/skills/`. Bản gói đã lưu trong View US là nguồn bàn giao, không phải bảo đảm mọi sửa đổi ngoài thư mục đã được sao lưu.
- Phiên đăng nhập Chrome, quyền truy cập tài khoản Meta/Blogbio, cấu hình ứng dụng AI không tự chuyển chỉ bằng copy View US. Đăng nhập lại theo quy trình chính thức; không xuất cookie/token vào tài liệu.
- Dịch vụ macOS cũ: LaunchAgents `com.thestory.publisher`, `com.thestory.studio`; tạo lại trên máy mới, không chép plist có đường dẫn cũ rồi chạy.
- Log mặc định: `~/Library/Logs/TheStoryPublisher/`, `~/Library/Logs/TheStoryStudio/`. Có thể chuyển bản đã lọc secret nếu cần điều tra lịch sử.

### Không cần mang nguyên xi để chạy

`node_modules/`, cache `.next*`, build/native binary cũ có thể phải cài/build lại theo CPU và hệ điều hành máy mới. Không dùng node_modules từ Intel sang Apple Silicon/Windows. Không xóa các bản cũ trước khi backup và chạy máy mới thành công.

## 8. Quy trình chuyển máy an toàn — không đăng trùng

1. Ghi lại giờ cắt chuyển, timezone, số Page, asset, job, item đã bridge; ghi danh sách job có Meta ID và lịch Meta tương lai.
2. Đợi hết upload/finish/comment đang gửi. Chưa rõ kết quả phải đối soát Meta, không tự tạo lại ID.
3. Chốt máy nào là máy vận hành duy nhất. Dừng dịch vụ cũ đúng lúc đã thống nhất, **không xóa/hủy lịch Meta** chỉ để chuyển máy.
4. Backup SQLite nhất quán bằng cơ chế backup SQLite hoặc dừng hẳn writer rồi copy dữ liệu. Giữ DB + key + media đồng bộ. Không chỉ copy file `.db` khi WAL còn thay đổi.
5. Copy dữ liệu và source qua kênh an toàn; không đưa secret lên repo công khai. Không dùng `git clone` thay cho bước chuyển dữ liệu.
6. Trên máy mới, **chưa bật server/worker**. Dùng script đọc SQLite readOnly để kiểm tra dữ liệu; khởi động server chỉ để “xem thử” vẫn có thể đăng ngay hoặc tự nhận lô.
7. Rà và sửa đường dẫn theo bản đồ prefix cũ→mới, có backup và báo cáo. Quan trọng: `assets.file` ở Publisher, `batch_items.output_path` ở Studio; kiểm tra thêm toàn schema/config/payload và asset path. Không replace mù mọi chuỗi có `/Users/tony` hoặc đổi ID Page/batch/job/hash.
8. Nếu không giữ cấu trúc hai tool là thư mục anh em, phải cập nhật đường dẫn Studio DB/renderRoot và các tham chiếu liên tool. Cầu nối đang trỏ `../reels-studio-v2/...`.
9. Cài dependency, build, kiểm tra file tồn tại, integrity, key giải mã được (chỉ in yes/no), Page mapping và timezone. Không in token.
10. Đăng nhập Meta/Blogbio trên máy mới, xác minh token đúng Page và quyền; không giả định token sống mãi. Không đổi secret.key của DB đã chuyển.
11. Chỉ khi được xác nhận cutover mới bật máy mới; máy cũ phải dừng. Đối soát job đã có Meta ID trước. Bài local trễ quá 30 phút sẽ cần xử lý, không dồn cả lô đăng một lúc.
12. Kiểm tra một lô/ảnh preview và khi được duyệt mới thử một bài thật; xác nhận đúng Page, comment, Telegram, lịch kế tiếp. Giữ backup cũ để rollback.

Rollback: dừng máy mới trước, ghi nhận các thay đổi phát sinh và Meta ID, đối soát rồi mới bật máy cũ. Không khôi phục snapshot cũ rồi cho đăng lại các bài vừa xuất bản.

**Chuyển Windows/Linux:** code render có một số đường dẫn Chrome đa nền tảng, nhưng service manager dùng launchctl, launcher .command, một số thao tác unzip dùng `/usr/bin/python3`, video hướng dẫn dùng `say`. Không gọi đây là gói chạy Windows đã nghiệm thu. AI cần chuyển lớp dịch vụ/đường dẫn, test native SQLite và Chrome/FFmpeg trên máy đích.

## 9. Lệnh chạy và kiểm tra — dành cho AI kỹ thuật

Đầu tiên xác định đường dẫn thật trên máy mới. Các lệnh dưới chạy từ đúng thư mục con; không sao chép nguyên đường dẫn máy cũ.

### Chỉ kiểm tra, không bật worker

```bash
node --version
npm --version
```

Publisher yêu cầu Node **>=24** trong package.json và dùng `node:sqlite`. Dùng môi trường Node 24 phù hợp với bản đã chạy; kiểm tra lại package-lock và native module trên máy đích.

Nếu dịch vụ đã chạy, endpoint GET có thể đọc:

```text
http://127.0.0.1:3030/api/health
http://127.0.0.1:3030/api/state
http://127.0.0.1:3030/api/studio-bridge
http://127.0.0.1:3020/api/health
```

Không dump toàn bộ DB/config hoặc payload chat; chỉ tổng hợp tên Page, trạng thái, số lượng và lỗi đã lọc secret.

### Studio 3020 — chỉ khởi động sau cutover được duyệt

Từ `reels-studio-v2/`:

```bash
npm ci
npm run build:local
npm run local:start
```

Kiểm tra / dừng / cập nhật có chủ đích:

```bash
npm run local:status
npm run local:stop
npm run local:update
```

`local:update` build và thay runtime; không chạy khi đang có lô cần hoàn tất. Render queue có cơ chế khôi phục lô, nên server mới có thể dựng tiếp ngay.

### Publisher 3030 — có thể đăng ngay khi được bật

Từ `story-publisher/`:

```bash
node service.mjs status
node service.mjs start
```

Dừng / restart theo yêu cầu, sau khi kiểm tra bài đang xử lý:

```bash
node service.mjs stop
node service.mjs restart
```

`node server.mjs` là foreground thay thế; không chạy thêm nếu service đã chiếm 3030. Bộ launcher ở gốc `Mở The Story Publisher.command`, `Mở The Story Studio.command` đang ghi cứng `/usr/local/bin/node`; máy mới có thể ở vị trí khác. Dùng `command -v node` để sửa đúng, không giả định `/opt/homebrew/bin/node` hay `/usr/local/bin/node` luôn có.

### Kiểm tra mã sau thay đổi

- Publisher: `npm test` từ `story-publisher/`; kiểm tra mock/test temp trước, không thử live post thay cho unit test.
- Studio: `npm run verify:parser`, `npm run build:local`. Các verify khác có thể cần server và tạo dữ liệu test; đọc script trước khi chạy trên DB thật.
- Tool dự phòng: xem scripts trong package.json của đúng project, không cài/build tất cả thư mục.

### Các cổng phụ

- `story_video_generator/`: `node server.js`, 8088.
- `reels-video-generator-standalone/`: cài dependency phù hợp rồi `npm start`, 8090.
- `media-ops-hub/`: `npm run dev`, mặc định 3000; xác minh DATABASE_URL trước, không chạy seed lên DB cũ.

## 10. Nghiên cứu AI, báo cáo và thông báo

- Agent nghiên cứu hiện nằm trong Publisher, không phải cửa sổ anime. Module `drama-agent.mjs` gọi Gemini với Search grounding; cấu hình model/key/enable lấy từ cấu hình thật. Chưa kiểm chứng model/key thì không hứa chạy được.
- Luồng lịch nghiên cứu có cửa sổ bắt đầu từ 06:30 VN và xử lý báo cáo sáng; kiểm tra tab AI nghiên cứu và lịch sử run để xác nhận đã chạy/gửi, không chỉ nhìn cờ enabled.
- Kho chia sẻ: `story-publisher/data/knowledge_base/trends.jsonl`, `CLAUDE_BRAIN.md`, `CODEX_BRAIN.md`. Là tài liệu tham chiếu/nhớ ngoài, không phải các mô hình đã tự được huấn luyện lại.
- Quét Page: `page-reports.mjs`, lịch mặc định 07:00 VN, quét ngưỡng theo giờ và nút quét tay. Có giới hạn API; báo cáo thiếu dữ liệu không được hiểu là 0 view.
- Theo dõi từng video trong Publisher còn có `view-monitor.mjs`. Xem code để phân biệt tần suất giữa các bộ quét, không tự cho rằng mọi lượt quét đều đúng một giờ.
- Telegram: đăng thành công chỉ khi Meta xác nhận; cảnh báo lỗi/tồn kho/views là các loại độc lập. Xem outbox status `sent` mới kết luận đã gửi.
- Token hợp lệ xác nhận đúng danh tính Page không đồng nghĩa mọi thao tác đăng/comment đều được Meta cho phép. Có thể còn checkpoint/xác nhận danh tính trên điện thoại; không retry upload hàng loạt để vượt qua.

## 11. Các câu lệnh giao AI trên máy mới — copy dùng ngay

### A. Tiếp nhận toàn bộ bộ máy, chưa cho đăng

```text
Bạn đang làm việc trong thư mục View US trên máy mới.
Đọc 00-DOC-TRUOC-BAN-DO-TOOL-VA-CHUYEN-MAY.md trước.
Chỉ kiểm kê source, dependency, DB, secret.key tồn tại, file media, đường dẫn cũ,
Page mapping, batch bridge và lịch có Meta ID; không in secret.
Không bật Studio/Publisher, không gọi POST, không đăng thử, không seed/reset/xóa dữ liệu.
Lập danh sách còn thiếu và kế hoạch cutover; đợi tôi duyệt trước khi chạy worker.
```

### B. Khôi phục máy mới sau khi đã duyệt

```text
Tôi xác nhận máy cũ đã dừng và đã có backup nhất quán.
Khôi phục Studio 3020 và Publisher 3030 từ dữ liệu đã chuyển.
Giữ nguyên DB, secret.key, Page ID, job/video/comment ID, hash, dấu bridge và lịch Meta.
Sửa đường dẫn có kiểm soát theo vị trí mới, cài dependency/build phù hợp máy này.
Đối soát trước khi bật; báo rõ nếu phải đổi cấu hình ngoài phạm vi. Không tự đăng bù hàng loạt.
```

### C. Gen video và kiểm tra tự chuyển

```text
Dùng reels-studio-v2 trên cổng 3020, Page [tên đầy đủ + ID nếu có], file [đường dẫn].
Giữ cấu hình mẫu/nhạc/avatar hiện tại. Kiểm tra preview rồi dựng lô được chỉ định.
Lô completed: kiểm tra studio_bridge_items, assets và jobs để xác nhận số lượng,
đúng Page, caption/Comment 1 và giờ đăng. Không dùng bộ 8088/8090 thay thế.
Không bấm Đăng ngay khi tôi chỉ yêu cầu gen/xếp lịch theo cấu hình hiện có.
```

### D. Chẩn đoán đăng chậm/lỗi, chưa sửa

```text
Kiểm tra Publisher 3030: sức khỏe dịch vụ, Page enabled, lỗi token, jobs quá giờ,
video_id, comment_state, Meta/local và Telegram outbox. Kiểm tra mạng và file tồn tại.
Chỉ báo nguyên nhân kèm giờ VN; không đổi trạng thái DB hay đăng lại khi tôi chưa yêu cầu sửa.
Nếu có Meta ID phải đối soát ID đó, không tạo bản upload mới.
```

### E. Sửa phần giao diện, không đụng luồng đăng

```text
Sửa giao diện [mô tả] của story-publisher/public, giữ nguyên API/timezone và dữ liệu.
Đọc code hiện tại trước, liệt kê file sửa, chạy test liên quan.
Không đổi token, bật/tắt Page, xếp lại giờ hay publish video để test UI.
```

### F. Tối ưu render khi máy nóng

```text
Kiểm tra tải thực tế và localRenderQueue/renderPerformance/renderEngine của Studio 3020.
Phân biệt render với Publisher nhẹ. Đề xuất giới hạn số worker và đo thời gian/chất lượng.
Không tắt app khác, kill FFmpeg đang ghi file, restart khi đang upload hoặc giảm chất lượng
khi chưa báo rõ. Giữ nguyên tài nguyên và cấu hình Page.
```

### G. Thêm Page

```text
Thêm Page [tên, ID, quốc gia, timezone] vào Publisher và ánh xạ đúng Studio Page ID.
Không suy ID từ tên. Giữ các Page cũ, xin đúng quyền cần thiết và chờ tôi xác nhận bảo mật.
Kiểm tra khung VN/giờ quốc gia và khoảng cách đăng; không đăng test thật nếu chưa được duyệt.
```

### H. Làm link nhiều phần trên web

```text
Đọc web-pagination/HUONG-DAN-SERIES-CHAPTER.md và claude-blogbio-chapters/SKILL.md.
Kiểm tra file [chapters.txt]: marker, số phần, nội dung, metadata Series riêng.
Nếu được yêu cầu đăng: dùng native Series/Create chapter/Analyze chapters, dán plain text,
Paragraph, không code/monospace. Tránh trùng chương đầu. Giữ URL đã gắn lên Facebook.
Không thay theme/script quảng cáo toàn site để sửa một bài; trả URL thật đã kiểm tra.
```

## 12. Nguyên tắc để AI không làm hỏng hệ thống

1. Luôn phân biệt “kiểm tra”, “sửa”, “đăng thật”; không coi yêu cầu kiểm tra là quyền publish.
2. Không xóa/reset/seed DB và không đổi secret.key để chữa lỗi token.
3. Không chạy đồng thời hai bản Publisher dùng dữ liệu clone trên hai máy.
4. Không tái tạo job đã có video_id; giữ dấu bridge/hash để không nhập trùng.
5. Không coi tên file/thư mục cũ là Page ID chính thức, nhất là các số trùng.
6. Không in .env, key, token, cookie hoặc ghi chúng vào Git/tài liệu chia sẻ.
7. Token dài hạn vẫn có thể bị thu hồi. Gia hạn đúng phạm vi Page được duyệt, không tự thêm quyền.
8. Giữ máy bật/không ngủ nếu local cần đăng; đóng tab trình duyệt không nhất thiết dừng dịch vụ.
9. Kiểm tra kết quả thật: Meta published, comment có ID, Telegram sent, bridge có đủ item/job — không chỉ thông báo “đã bấm”.
10. Đây là bản đồ kiểm kê ngày 27/10, không phải cam kết mọi tool phụ đã nghiệm thu trên mọi hệ điều hành. Khi source/data đổi, kiểm tra lại trước khi chạy.

## 13. Điểm bắt đầu tốt nhất khi nhận máy mới

**Gửi AI câu ở mục 11A trước.** Sau đó mới duyệt khôi phục theo 11B.
Ngày thường: **nội dung → Studio 3020 → Publisher 3030 → Meta / Telegram**.
Muốn sửa gì: tra bảng mục 3 rồi giao đúng project, không ra lệnh “fix hết tool” một cách mơ hồ.
