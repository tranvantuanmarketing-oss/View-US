# 🎬 CẨM NANG CONTENT CHUẨN ĐỊNH DẠNG CHO TOOL STORY VIDEO STUDIO
> **Mục đích**: Hướng dẫn quy chuẩn định dạng đầu vào (Input Spec), công thức viết câu chữ chuẩn độ dài cho Card chữ 9:16, và bộ kịch bản mẫu sẵn sàng nạp thẳng vào Tool Studio `http://localhost:8088/` để render video hàng loạt.  
> **Dự án**: Fanpage Reels Âu - Mỹ ➔ Funnel về Website `www.thestorypress.online`.

---

## 📑 MỤC LỤC
1. [CẤU TRÚC ĐỊNH DẠNG BẮT BUỘC CỦA TOOL (INPUT SPEC)](#1-cấu-trúc-định-dạng-bắt-buộc-của-tool-input-spec)
2. [QUY CHUẨN ĐỘ DÀI & VĂN PHONG ĐỂ VIDEO RENDER HOÀN HẢO](#2-quy-chuẩn-độ-dài--văn-phong-để-video-render-hoàn-hảo)
3. [BỘ KỊCH BẢN MẪU PHÁP (CHO PAGE MASQUES TOMBÉS)](#3-bộ-kịch-bản-mẫu-pháp-cho-page-masques-tombés)
4. [BỘ KỊCH BẢN MẪU HÀ LAN (CHO PAGE VERBORGEN WAARHEDEN)](#4-bộ-kịch-bản-mẫu-hà-lan-cho-page-verborgen-waarheden)
5. [BỘ KỊCH BẢN MẪU MỸ (CHO PAGE US DRAMA)](#5-bộ-kịch-bản-mẫu-mỹ-cho-page-us-drama)
6. [PROMPT TẠO KỊCH BẢN HÀNG LOẠT BẰNG AI (BATCH GENERATOR PROMPT)](#6-prompt-tạo-kịch-bản-hàng-loạt-bằng-ai-batch-generator-prompt)

---

## 1. CẤU TRÚC ĐỊNH DẠNG BẮT BUỘC CỦA TOOL (INPUT SPEC)

Tool Studio tại `http://localhost:8088/` sử dụng bộ phân tích cú pháp (Parser) tự động bóc tách từng trường dữ liệu. Khi dán danh sách kịch bản vào tool, mỗi câu chuyện **bắt buộc phải tuân theo đúng 100% cấu trúc 11 dòng** sau:

```text
=== STORY [SỐ THỨ TỰ] ===
Tác giả: [Tên nhân vật bản xứ]
Thời gian: [2h ago / Il y a 2 h / 2 uur geleden]
Tên Page: [Tên Page Facebook tương ứng]
Tiêu đề: [Tiêu đề nội bộ câu chuyện]
Nội dung thẻ:
[Dòng 1: Mở đầu & hoàn cảnh]
[Dòng 2: Câu thoại sỉ nhục / áp bức của kẻ phản diện]
[Dòng 3: Sự nhẫn nhịn / bất công của nhân vật chính]
[Dòng 4: Hành động bất ngờ / đồ vật bí mật xuất hiện]
[Dòng 5: Cú lật tẩy bỏ lửng trước khi sự thật lộ diện...]
Highlights: "[Cụm từ 1 cần tô màu]" | "[Cụm từ 2]" | [Cụm từ 3]
Nút CTA: [Câu kêu gọi trên nút hồng bo góc]
Caption: [Đoạn mồi câu đăng kèm video kết thúc bằng dấu 👇 #hashtag]
Comment 1: PARTIE 2: [Toàn bộ nội dung phần 2 ghim ở bình luận kèm link web]
```

---

## 2. QUY CHUẨN ĐỘ DÀI & VĂN PHONG ĐỂ VIDEO RENDER HOÀN HẢO

Để video kết xuất ra có giao diện cân đối, chữ không bị tràn viền (overflow) hay quá trống trải:

### 2.1. Quy chuẩn Thẻ chữ (Nội dung thẻ)
* **Số dòng:** Chuẩn đúng **5 dòng**.
* **Số từ mỗi dòng:** Từ **14 đến 20 từ/dòng** (khoảng 80 – 110 ký tự/dòng).
* **Quy tắc ngắt câu:** Mỗi dòng là một nhịp kịch tính độc lập, tránh ngắt dòng giữa cụm từ có nghĩa.
* **Quy tắc Dòng 5 (The Cliffhanger):** Luôn kết thúc bằng dấu ba chấm `...` và ngắt ngay trước khi bí mật được công bố (ép người xem phải mở bình luận).

### 2.2. Quy chuẩn Tô màu điểm nhấn (Highlights)
* Chọn đúng **2 đến 3 cụm từ đắt giá nhất**:
  * 1 cụm nói về sự hy sinh/bất công.
  * 1 cụm nói về lời nói kiêu ngạo của kẻ phản diện.
  * 1 cụm mở ra bước ngoặt kết quả.
* Cách viết trong trường `Highlights`: Dùng dấu gạch đứng `|` ngăn cách giữa các cụm:
  `Highlights: "cụm 1" | "cụm 2" | cụm 3`

### 2.3. Quy chuẩn Nút CTA trên Card
Tùy theo quốc gia của Page mà dùng câu tương ứng:
* 🇫🇷 **Pháp:** `Continuer la lecture dans les commentaires` (hoặc `Lire la suite dans la légende`)
* 🇳🇱 **Hà Lan:** `Lees verder in de reacties`
* 🇺🇸 **Mỹ:** `Continue reading in the comments`

### 2.4. Quy chuẩn Caption & Comment 1 (Kéo Traffic Web)
* **Caption:** Dưới 150 ký tự, có dấu ba chấm `... 👇` và 3 – 4 hashtag bản xứ có lượt tìm kiếm cao.
* **Comment 1:** 
  * Bắt đầu bằng: `PARTIE 2:` (Pháp) / `DEEL 2:` (Hà Lan) / `PART 2:` (Mỹ).
  * Kể tiếp diễn biến trừng phạt kẻ xấu (Twist) trong 5 – 7 câu ngắn.
  * Câu cuối dẫn thẳng link bài viết trên website:
    `📖 Lisez l'histoire complète : https://www.thestorypress.online/fr/stories/...`

---

## 3. BỘ KỊCH BẢN MẪU PHÁP (CHO PAGE MASQUES TOMBÉS)

Dưới đây là 3 kịch bản chuẩn định dạng, bạn có thể copy nguyên khối dán thẳng vào ô kịch bản của tool:

```text
=== STORY 1 ===
Tác giả: Robert Vaneau
Thời gian: Il y a 2 h
Tên Page: Masques Tombés
Tiêu đề: L'expulsion lors de mon 70ème anniversaire
Nội dung thẻ:
Devant cinquante invités à mon anniversaire, ma belle-fille m'a tendu une brochure en souriant avec condescendance.
Mon fils a pris le micro devant nos proches : « Papa, nous t'avons réservé une chambre dans un hospice à cent kilomètres. »
Tous deux ont exigé que je leur cède la propriété viticole familiale le soir même pour payer mes vieux jours.
J'ai essuyé mes lunettes en silence, puis j'ai sorti une chemise cartonnée bleue de mon veston.
Ils ont soudainement découvert qui était le véritable propriétaire de leur duplex parisien...
Highlights: "réservé une chambre dans un hospice" | "cède la propriété viticole" | véritable propriétaire de leur duplex
Nút CTA: Continuer la lecture dans les commentaires
Caption: Ils ont voulu m'envoyer en maison de retraite pour saisir mon domaine familial. J'ai posé le dossier bleu sur la table et… 👇 #masquestombes #famille #heritage #paris
Comment 1: PARTIE 2: Ce que ma belle-fille ignorait, c'est que quinze ans plus tôt, j'avais sauvé mon fils de la faillite en rachetant son luxueux duplex du 16e arrondissement via ma propre société. J'ai annoncé devant toute l'assemblée la résiliation immédiate du bail gratuit et la vente aux enchères du bien pour financer un orphelinat local. Leurs masques mondains sont tombés en un instant... 📖 Lisez l'histoire complète : https://www.thestorypress.online/fr

=== STORY 2 ===
Tác giả: Éléonore Dupré
Thời gian: Il y a 3 h
Tên Page: Masques Tombés
Tiêu đề: Le testament falsifié sous morphine
Nội dung thẻ:
Trois jours après le décès de mon mari, ses deux filles aînées ont fait changer les serrures de notre hôtel particulier.
L'aînée m'a jeté mes affaires sur le perron : « Tu n'étais que sa seconde épouse, repars d'où tu viens sans rien demander. »
Pendant sept ans de maladie, elles n'avaient jamais mis les pieds à son chevet à Lyon.
J'ai ramassé mes affaires calmement et j'ai composé le numéro du notaire de famille en présence d'un huissier.
Elles ont vite compris ce que contenait le coffre-fort scellé de la chambre d'amis...
Highlights: "changer les serrures" | "repars d'où tu viens" | coffre-fort scellé de la chambre
Nút CTA: Continuer la lecture dans les commentaires
Caption: Elles m'ont mise à la rue en croyant s'emparer de l'hôtel particulier. Le notaire a brisé le scellé de cire et… 👇 #dramefamilial #notaire #revanche #lyon
Comment 1: PARTIE 2: Le notaire a ouvert le codicille officiel rédigé en pleine lucidité devant deux témoins assermentés. Mon époux avait légué l'usufruit total de la demeure et la totalité de la quotité disponible à mon profit, tout en joignant un rapport d'expertise révélant que ses filles avaient tenté de falsifier sa signature sur des ordres de virement deux semaines avant sa mort. Elles ont été sommées d'évacuer les lieux sous astreinte de 500 € par jour. 📖 Retrouvez nos récits : https://www.thestorypress.online/fr

=== STORY 3 ===
Tác giả: Marc Delacroix
Thời gian: Il y a 5 h
Tên Page: Masques Tombés
Tiêu đề: Le chèque d'aumône au milieu des vignes
Nội dung thẻ:
Le jour des obsèques de notre père, mon frère aîné m'a tendu un chèque de cinq cents euros devant les vignes bordelaises.
Il a ricané avec arrogance : « Papa savait que tu n'étais qu'un ouvrier, signe ce renoncement et quitte le domaine. »
Pendant douze ans, j'avais taillé chaque cep de vigne de mes mains pendant qu'il dilapidait les comptes à Monaco.
J'ai déchiré son chèque en deux et j'ai sorti la clé en laiton que mon père m'avait confiée sur son lit de mort.
Ce que contenait le registre de la cave allait briser sa réputation pour toujours...
Highlights: "chèque de cinq cents euros" | "dilapidait les comptes à Monaco" | briser sa réputation pour toujours...
Nút CTA: Continuer la lecture dans les commentaires
Caption: Il pensait m'exclure du domaine familial de quarante hectares avec une aumône. Mais la clé en laiton a ouvert le coffre et… 👇 #heritage #vignoble #justice #bordeaux
Comment 1: PARTIE 2: Le registre secret contenait les preuves formelles d'un détournement de fonds de 1,2 million d'euros orchestré par mon frère sur les comptes d'exploitation. Le testament définitif désignait le domaine comme patrimoine inaliénable confié à ma gérance unique, ne lui laissant que la réserve légale grevée de sa dette de remboursement. Les masques sont tombés sous les voûtes du chai... 📖 Chroniques complètes : https://www.thestorypress.online/fr
```

---

## 4. BỘ KỊCH BẢN MẪU HÀ LAN (CHO PAGE VERBORGEN WAARHEDEN)

```text
=== STORY 1 ===
Tác giả: Willem van Berg
Thời gian: 2 uur geleden
Tên Page: Verborgen Waarheden
Tiêu đề: De valse zorgfactuur rondom het sterfbed
Nội dung thẻ:
Vlak na de uitvaart van onze vader overhandigde mijn broer me een factuur van achttienduizend euro voor verzorgingskosten.
Hij keek me koel aan : « Ik heb dit uit eigen zak voorgeschoten, betaal jouw helft binnen achtenveertig uur terug. »
Terwijl vader ziek was in Den Bosch, verbleef mijn broer maandenlang in luxe resorts in Spanje.
Ik betaalde niet, maar belde direct met de hoofdadministratie van het zorgkantoor met het factuurnummer.
Wat de administratrice in het dossier ontdekte, liet zijn gezicht lijkbleek wegtrekken...
Highlights: "factuur van achttienduizend euro" | "luxe resorts in Spanje" | dossier ontdekte, liet zijn gezicht lijkbleek
Nút CTA: Lees verder in de reacties
Caption: Mijn broer eiste 18.000 euro voor zogenaamde privézorg rond het sterfbed van vader. De administratie opende het dossier en… 👇 #erfenis #gerechtigheid #familie #denbosch
Comment 1: DEEL 2: De administratie bevestigde dat alle zorgkosten volledig waren vergoed via de Wet langdurige zorg en dat er geen openstaand saldo bestond. Mijn broer had zelf een valse briefhoofdfactuur nagemaakt om geld af te troggelen. De kantonrechter heeft hem veroordeeld wegens oplichting en hem uitgesloten als executeur-testamentair. De waarheid zegeviert altijd... 📖 Lees het hele verhaal : https://www.thestorypress.online/nl

=== STORY 2 ===
Tác giả: Anouk De Vries
Thời gian: 4 uur geleden
Tên Page: Verborgen Waarheden
Tiêu đề: De uitsluiting uit het grachtenpand
Nội dung thẻ:
Mijn stiefmoeder liet op de dag van de begrafenis direct de sloten van het monumentale grachtenpand in Amsterdam vervangen.
Ze zei met een kille glimlach : « Je vader heeft alles aan mij nagelaten, jij hebt hier niets meer te zoeken. »
Jarenlang had ik de familieonderneming draaiende gehouden terwijl zij weigerde naar hem om te kijken.
Ik bleef kalm en nodigde haar uit op het kantoor van de notaris aan de Keizersgracht.
Toen de notaris de verzegelde akte van vooroverlijden openlegde, verdween haar zelfverzekerde lach meteen...
Highlights: "sloten van het grachtenpand" | "niets meer te zoeken" | verzegelde akte van vooroverlijden openlegde
Nút CTA: Lees verder in de reacties
Caption: Ze dacht me met lege handen op straat te zetten na vaders dood. De notaris brak het zegel aan de Keizersgracht en… 👇 #amsterdam #notaris #familiegeheim #erfenis
Comment 1: DEEL 2: De akte bevatte een harde uitsluitingsclausule : het monumentale pand behoorde toe aan een familiestichting waarvan ik enig bestuurder was, met een direct verbod op bewoning door derden bij wangedrag. Mijn stiefmoeder kreeg per deurwaardersexploit dertig dagen om te ontruimen. Verborgen waarheden komen altijd aan het licht... 📖 Volledige kroniek : https://www.thestorypress.online/nl
```

---

## 5. BỘ KỊCH BẢN MẪU MỸ (CHO PAGE US DRAMA)

```text
=== STORY 1 ===
Tác giả: Marcus Vance
Thời gian: 2h ago
Tên Page: The Story Press
Tiêu đề: The ranch eviction after twenty years
Nội dung thẻ:
My wealthy brother showed up at our Montana ranch with a real estate developer and an eviction notice.
He grinned arrogantly in front of his wife: « Dad left this land to someone who could actually monetize it, get packing. »
For twenty years, I had worked eighteen-hour shifts keeping the cattle alive while he partied in New York.
I didn't argue. I simply walked into the study and handed the county sheriff our father's silver lockbox.
When the sheriff unsealed the land deed inside, my brother's face completely lost all color...
Highlights: "with a real estate developer" | "get packing" | completely lost all color...
Nút CTA: Continue reading in the comments
Caption: He brought an eviction crew to throw me off our 500-acre family ranch. The sheriff opened the silver lockbox and… 👇 #familydrama #inheritance #justice #montana
Comment 1: PART 2: The lockbox contained the original deed of trust transferring ownership directly to an agricultural conservancy under my sole trusteeship, alongside documented bank records proving my brother had embezzled $400,000 from our father's medical accounts. The sheriff escorted him off the property that afternoon. 📖 Read the full chronicle: https://www.thestorypress.online/en
```

---

## 6. PROMPT TẠO KỊCH BẢN HÀNG LOẠT BẰNG AI (BATCH GENERATOR PROMPT)

Khi bạn muốn AI sinh thêm 10, 20 hay 50 kịch bản mới cho bất kỳ ngôn ngữ nào, hãy copy nguyên văn prompt dưới đây:

```markdown
Bạn là Biên kịch trưởng chuyên sản xuất kịch bản Video Viral Drama ngắn (Reels/TikTok) chuẩn cấu trúc Tool Video Studio.

Hãy viết cho tôi [SỐ LƯỢNG] câu chuyện kịch tính theo định dạng bên dưới:
- Ngôn ngữ: [Tiếng Pháp / Tiếng Hà Lan / Tiếng Anh]
- Tên Page: [Masques Tombés / Verborgen Waarheden / The Story Press]
- Chủ đề: [Tranh chấp thừa kế / Lật tẩy đạo đức giả / Mẹ chồng nàng dâu / Bằng chứng ngoại tình]

BẮT BUỘC TUÂN THỦ CÁC QUY TẮC SAU:
1. Mỗi kịch bản có đúng 5 dòng trong "Nội dung thẻ", mỗi dòng 14-20 từ. Dòng 5 phải kết thúc bằng dấu ba chấm "..." và ngắt ngay trước khi sự thật lộ diện.
2. Mục "Highlights": Chọn đúng 2-3 cụm từ đắt giá ngăn cách bằng dấu "|".
3. Mục "Caption": Dưới 150 ký tự, có mồi câu "... 👇" và 3 hashtag bản xứ.
4. Mục "Comment 1": Bắt đầu bằng PARTIE 2: (hoặc DEEL 2:), giải quyết cú lật mặt (Twist) đanh thép và chốt bằng link: 📖 Lisez l'histoire complète : https://www.thestorypress.online/[lang]

CẤU TRÚC ĐẦU RA (KHÔNG ĐƯỢC THIẾU DÒNG NÀO):
=== STORY [X] ===
Tác giả: [Tên nhân vật bản xứ]
Thời gian: [2h ago / Il y a 2 h / 2 uur geleden]
Tên Page: [Tên Page]
Tiêu đề: [Tiêu đề câu chuyện]
Nội dung thẻ:
[Dòng 1]
[Dòng 2]
[Dòng 3]
[Dòng 4]
[Dòng 5]
Highlights: "[Cụm 1]" | "[Cụm 2]" | [Cụm 3]
Nút CTA: [Continuer la lecture dans les commentaires / Lees verder in de reacties]
Caption: [Caption ngắn kèm 👇]
Comment 1: PARTIE 2: [Nội dung đầy đủ + Link web]
```
