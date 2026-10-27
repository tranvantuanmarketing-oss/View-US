# Ba skill đã lưu và cài — 25/10/2026

Giữ nguyên ba ZIP người dùng cung cấp. Bản giải nén đầy đủ nằm trong `installed-packages-2026-10-25/` cạnh file này. Chỉ cài ba gói được yêu cầu; không cài `Drama-v1.zip`.

Nội dung cài trên máy: `/Users/tony/.codex/skills/content-tools`, `/Users/tony/.codex/skills/drama-post`, `/Users/tony/.codex/skills/new-story`. Các thư mục trong `/Users/tony/.agents/skills/` trỏ tới đúng các bản này.

## Gọi trong Codex trên máy này

Skill có thể dùng ở lượt tiếp theo; mở chat mới để thuận tiện. Gõ `$` rồi chọn skill trong danh sách. Nếu chưa thấy, khởi động lại ứng dụng.

### content-tools — file TXT cho tool video

Ví dụ:

```text
$content-tools Làm file 5 truyện cho Closed Doors, chủ đề mẹ chồng và nhà cửa. Lưu file vào thư mục outputs trong workspace hiện tại.
```

Page theo skill này: Closed Doors (Pháp), Masques Tombés (Pháp), Verborgen Waarheden (Hà Lan). Đây là bộ cho Story Video Studio; có script kiểm tra định dạng `scripts/validate.py`.

### drama-post — bài Facebook theo hệ thống 7 page

Ví dụ:

```text
$drama-post Làm bài cho Zu Spät Gefragt từ ý tưởng: con trai đòi bán nhà mẹ để trả nợ. Tạo caption, comment 1 và prompt ảnh theo skill.
```

Page theo gói v11: Ombres du Passé (Pháp), Verbroken Maskers (Ba Lan), Stille Schaduwen (Hà Lan), Vérités d'Hier (Pháp), Verborgen Oordeel (Hà Lan), Verhalen van Ons (Hà Lan), Zu Spät Gefragt (Đức).

### new-story — truyện theo từng bước, có bible và nhiều phần

Trong chat mới:

```text
$new-story bible Một người mẹ bị con trai đòi bán nhà sau khi bố mất · Đức · Zu Spät Gefragt
```

Sau đó lần lượt:

```text
$new-story caption
$new-story comment
$new-story web 10
$new-story image
```

Mỗi dòng là một tin nhắn riêng. Nội dung tiếp tục dựa trên bible của cùng truyện. Khi chuyển chat, cung cấp bible và các file tiến độ cần thiết. Skill hỗ trợ en-us, en-gb, de, fr, it, es, nl, no, da, pl, ar.

## Gọi trong ChatGPT

Theo tài liệu OpenAI, ChatGPT dùng `@` để chọn skill; Codex dùng `$`.

Nếu skill đã có trong bộ chọn ChatGPT, gõ `@`, chọn `content-tools`, `drama-post` hoặc `new-story`, rồi nhập yêu cầu như ví dụ phía trên (đổi `$` thành `@`). Việc cài vào thư mục trên máy chưa xác nhận skill đã được cài vào tài khoản ChatGPT web/mobile của bạn.

Nếu ChatGPT chưa hiển thị skill: trong chat có khả năng đọc ZIP và xử lý file, đính kèm ZIP tương ứng rồi gửi:

```text
Đọc SKILL.md và các tài nguyên cần thiết trong ZIP tôi vừa gửi. Dùng skill new-story cho yêu cầu này: dựng bible truyện mới về người mẹ bị con đòi bán nhà, bối cảnh Đức, page Zu Spät Gefragt. Lưu đầu ra thành file tải được.
```

Đổi tên skill và yêu cầu cho đúng gói. Cách này cung cấp hướng dẫn cho cuộc chat đó, không tự cài skill lâu dài vào tài khoản. Nếu chat không đọc được ZIP, giải nén và gửi SKILL.md cùng các tài nguyên cần cho bước đó.

Các lệnh `/drama`, `/new-story` và `/drama-post` có trong hướng dẫn của gói Claude; trong ChatGPT có thể hiểu chúng như yêu cầu văn bản khi đã đọc skill, nhưng không nên mặc định chúng đã được đăng ký thành lệnh của giao diện.

## Điểm cần nhớ

- Ghi tên skill và tên page đầy đủ: `p1–p3` trùng giữa content-tools và drama-post.
- Gói hiện dùng CTA về `thestorypress.online`; nếu muốn dùng `thestory.danhngon.pro`, ghi rõ trong yêu cầu.
- Một số hướng dẫn ghi đường dẫn Claude như `/mnt/user-data/outputs/` hoặc `/home/claude`. Trong Codex, chỉ định thư mục đầu ra trong workspace đang mở.
- Cài skill không tự chạy các script hoặc đăng bài lên website/Facebook. Cần yêu cầu công việc cụ thể.
- Nội dung ba skill được giữ nguyên; chưa chạy thử quy trình tạo truyện hoặc video trong lần cài này.

Tài liệu chính thức:
- https://learn.chatgpt.com/docs/build-skills
- https://learn.chatgpt.com/docs/skills-and-plugins
