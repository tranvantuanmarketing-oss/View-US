---
name: "content-tools"
description: Làm file kịch bản .txt nạp thẳng vào tool Story Video Studio (localhost:8088) cho 3 page Reels drama - Page 1 Closed Doors (Pháp), Page 2 Masques Tombés (Pháp), Page 3 Verborgen Waarheden (Hà Lan), kéo traffic về thestorypress.online. Dùng skill này BẤT CỨ KHI NÀO người dùng nói "làm file cho page 1/2/3", "page 1", "p1/p2/p3", "làm 10 truyện cho page 2", "file gen video", "kịch bản tool", "nạp vào tool", hoặc nhắc tên Closed Doors / Masques Tombés / Verborgen Waarheden - kể cả khi chỉ nói ngắn như "làm page 3", "thêm 20 truyện page 1". Không dùng cho các page của skill drama-post (Ombres du Passé, Verbroken Maskers, Stille Schaduwen, Vérités d'Hier, Verborgen Oordeel, Verhalen van Ons, Zu Spät Gefragt) hay khi người dùng gõ /drama-post.
---

# CONTENT TOOLS – FILE KỊCH BẢN CHO TOOL STORY VIDEO STUDIO

Nhiệm vụ: khi người dùng bảo "làm file cho page X", viết một lô truyện drama đúng định dạng tool, xuất ra 1 file `.txt` để dán/nạp thẳng vào tab "Kịch Bản Truyện" của tool tại http://localhost:8088/.

## 1. DANH SÁCH PAGE

| Mã | Tên Page (ghi đúng chính tả) | Ngôn ngữ | Chrome profile | Page ID Facebook |
|---|---|---|---|---|
| **Page 1** (p1) | Closed Doors | Tiếng Pháp (FR) | View US 4 | (chưa có) |
| **Page 2** (p2) | Masques Tombés | Tiếng Pháp (FR) | View US 1 | (chưa có) |
| **Page 3** (p3) | Verborgen Waarheden | Tiếng Hà Lan (NL) | View US 2 | (chưa có) |

Lưu ý: Page 1 tên tiếng Anh nhưng nội dung viết **tiếng Pháp**.
Người dùng có thể gọi "page 1", "p1", "1" hoặc tên page – nhận diện hết. Nếu không nói page nào, hỏi 1 câu: "Làm cho page nào (1 Closed Doors / 2 Masques Tombés / 3 Verborgen Waarheden)?".

### Nhận diện page (áp dụng cho toàn bộ skill)

Không phân biệt hoa/thường, có dấu hay không dấu, có gạch dưới hay khoảng trắng.

| Mã | Tên Page chuẩn | Các cách gọi được nhận diện |
|---|---|---|
| Page 1 | Closed Doors | page 1, p1, trang 1, 1, closed, closed doors, CD |
| Page 2 | Masques Tombés | page 2, p2, trang 2, 2, masques, masques tombes, masque tombé, MT |
| Page 3 | Verborgen Waarheden | page 3, p3, trang 3, 3, waarheden, verborgen waarheden, VW, page Hà Lan (của tool video) |

Quy tắc:
- "page Pháp" trong skill này → hỏi lại Page 1 hay Page 2.
- Trong file luôn ghi đúng Tên Page chuẩn ở cột 2 (validate.py chỉ chấp nhận đúng 3 tên này).
- **Phân biệt với skill drama-post** (hệ thống page Facebook bài viết, có cùng mã p1-p7 nhưng là page khác):
  | Mã drama-post | Tên Page | Nước |
  |---|---|---|
  | p1 | Ombres du Passé | Pháp |
  | p2 | Verbroken Maskers | Ba Lan |
  | p3 | Stille Schaduwen | Hà Lan |
  | p4 | Vérités d'Hier | Pháp |
  | p5 | Verborgen Oordeel | Hà Lan |
  | p6 | Verhalen van Ons | Hà Lan |
  | p7 | Zu Spät Gefragt | Đức |
  Nếu người dùng nhắc một trong các tên này, nhắc "page Ba Lan", "page Đức", p4-p7, /drama-post, hoặc xin caption + comment 1 / prompt ảnh 4:5 / ảnh ghép collage → KHÔNG dùng skill này, chuyển sang drama-post.
- "page 1/2/3" chỉ thuộc skill này khi đi kèm từ khóa của tool: "làm file", "file gen video", "kịch bản tool", "nạp vào tool", "Reels", "lô N truyện", "localhost". Thiếu các từ này mà có kèm caption/comment 1/prompt ảnh → drama-post. Vẫn không rõ → hỏi 1 câu: "Làm file video cho tool (Closed Doors / Masques Tombés / Verborgen Waarheden) hay bài đăng drama-post (Ombres du Passé / Verbroken Maskers / Stille Schaduwen)?".
Số lượng: làm đúng số người dùng yêu cầu; không nói số thì mặc định 5 truyện.

## 2. HẰNG SỐ THEO NGÔN NGỮ

| Trường | FR (Page 1, 2) | NL (Page 3) |
|---|---|---|
| Thời gian | `Il y a 2 h`, `Il y a 3 h`… (tăng dần) | `2 uur geleden`, `3 uur geleden`… |
| Nút CTA | `Continuer la lecture dans les commentaires` | `Lees verder in de reacties` |
| Mở Comment 1 | `PARTIE 2:` | `DEEL 2:` |
| CTA PARTIE 3 | `Écrivez « [MOT-CLÉ] » en commentaire et je publie la PARTIE 3 juste en dessous 👇` | `Reageer met « [TREFWOORD] » en ik plaats DEEL 3 hieronder 👇` |
| CTA web | `👉 Lire la suite complète sur https://www.thestorypress.online/fr` | `👉 Lees het volledige verhaal op https://www.thestorypress.online/nl` |
| Hashtag page | `#closeddoors` (p1) / `#masquestombes` (p2) | `#verborgenwaarheden` |

[MOT-CLÉ]/[TREFWOORD]: từ khóa ngắn 1-3 từ, VIẾT HOA, khớp nội dung từng truyện (vd « SOLDE À ZÉRO », « DE BLAUWE MAP »).

Bối cảnh văn hóa/pháp lý: FR dùng Notaire, Tribunal judiciaire, juge aux affaires familiales, SCI, viager, adoption plénière, thành phố Pháp. NL dùng notaris, Kadaster, kantonrechter, testament, huwelijkse voorwaarden, thành phố Hà Lan.

## 3. ĐỊNH DẠNG BẮT BUỘC (PARSER CỦA TOOL)

Mỗi truyện đúng cấu trúc sau, các truyện nối tiếp nhau, không có dòng thừa giữa các truyện:

```
=== STORY [N] ===
Tác giả: [Tên nhân vật bản xứ]
Thời gian: [theo bảng]
Tên Page: [Tên Page đúng chính tả]
Tiêu đề: [Tiêu đề ngắn bằng ngôn ngữ page]
Nội dung thẻ:
[Dòng 1: mở đầu & hoàn cảnh]
[Dòng 2: câu thoại sỉ nhục của kẻ phản diện, trong « »]
[Dòng 3: sự hy sinh / bất công của nhân vật chính]
[Dòng 4: hành động bình thản / vật bí mật xuất hiện]
[Dòng 5: cliffhanger, kết bằng ...]
Highlights: "[cụm 1]" | "[cụm 2]" | [cụm 3]
Nút CTA: [theo bảng]
Caption: [mồi câu kết bằng … 👇 + 3 hashtag]
Comment 1: PARTIE 2:   (hoặc DEEL 2:)

[Đoạn 1]

[Đoạn 2]
...
[CTA PARTIE 3 / DEEL 3]
[CTA web]
```

### Quy chuẩn thẻ (Nội dung thẻ)
- Đúng 5 dòng, mỗi dòng 14–20 từ. Mỗi dòng một nhịp kịch tính, không ngắt giữa cụm nghĩa.
- Dòng 5 kết thúc bằng `...` và dừng NGAY trước khi bí mật lộ ra.
- Ngôi thứ nhất (je / ik).

### Highlights
- Đúng 3 cụm: 1 cụm lời kiêu ngạo của phản diện, 1 cụm sự hy sinh/bất công, 1 cụm mở bước ngoặt.
- Mỗi cụm phải xuất hiện NGUYÊN VĂN (đúng hoa thường, dấu) trong Nội dung thẻ, nếu không tool không tô màu được.
- Hai cụm đầu có ngoặc kép, cụm 3 không – đúng như mẫu.

### Caption
- Dưới 150 ký tự (tính cả hashtag), kết bằng `… 👇`, rồi 3 hashtag (hashtag page + 2 hashtag chủ đề).

### Comment 1 (DÀI + CTA RA PARTIE 3)
- Dài 380–500 từ, chia 10–14 đoạn ngắn (1–4 câu/đoạn), cách nhau 1 dòng trống.
- Mạch: quay lại đúng khoảnh khắc thẻ dừng → `Je m'appelle X, j'ai Y ans, je suis [nghề] à [ville].` / `Ik heet X, ik ben Y jaar…` → bối cảnh gia đình & sự hy sinh → nhân vật chính âm thầm chuẩn bị (giấy tờ, notaire, ngân hàng) → đối chất, lật kèo pháp lý một phần → kết bằng một CLIFFHANGER MỚI (phong bì thứ hai, cái tên bất ngờ, câu nói bỏ lửng…) để người đọc phải comment xin PARTIE 3.
- Không kể hết kết thúc trong PARTIE 2.
- Hai dòng cuối luôn là CTA PARTIE 3 rồi CTA web (theo bảng mục 2).
- Câu thoại trong « », số tiền/tuổi viết bằng chữ khi tự nhiên (vingt-trois mille euros), giọng tự nhiên như người thật kể chuyện.

## 4. NỘI DUNG
- Chủ đề: thừa kế, mẹ chồng/nàng dâu, con cái bỏ mặc cha mẹ rồi quay lại đòi tài sản, chồng bán tài sản sau lưng, giả chữ ký, bí mật gia đình cũ, con nuôi, di chúc, viager…
- Mỗi truyện trong lô khác nhau rõ: khác nhân vật, thành phố, nghề, tài sản, kiểu lật kèo. Không lặp cốt truyện trong cùng lô và không lặp truyện mẫu đã có trong hội thoại.
- Nếu người dùng đưa bài nguồn: chỉ lấy ý tưởng, viết lại hoàn toàn, không dịch nguyên văn.
- Lật kèo phải hợp lý về pháp lý ở mức người đọc phổ thông tin được.

## 5. XUẤT FILE & KIỂM TRA
- Tên file: `[Tên Page] - Lot [N] récits - DD-MM-YYYY.txt` (FR) / `[Tên Page] - Lot [N] verhalen - DD-MM-YYYY.txt` (NL), ngày hiện tại. Lưu vào `/mnt/user-data/outputs/`.
- Sau khi viết, BẮT BUỘC chạy: `python3 scripts/validate.py "<đường dẫn file>"` (đường dẫn script tính từ thư mục skill). Sửa mọi lỗi báo ra rồi chạy lại đến khi sạch.
- Trình bày file bằng present_files. Trả lời ngắn bằng tiếng Việt: số truyện, page, tóm tắt 1 dòng mỗi truyện (tiếng Việt), từ khóa PARTIE 3 đã dùng, và gợi ý "Render thử 1 video" trước khi chạy cả lô.
- Cuối câu trả lời có thể hỏi có cần viết PARTIE 3 cho các truyện không.
