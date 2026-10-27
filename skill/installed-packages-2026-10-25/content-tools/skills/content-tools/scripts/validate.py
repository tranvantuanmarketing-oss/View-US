#!/usr/bin/env python3
"""Kiểm tra file kịch bản cho tool Story Video Studio. Dùng: python3 validate.py file.txt"""
import re, sys

PAGES = {"Closed Doors": "fr", "Masques Tombés": "fr", "Verborgen Waarheden": "nl"}
CTA = {"fr": "Continuer la lecture dans les commentaires", "nl": "Lees verder in de reacties"}
PART2 = {"fr": "PARTIE 2:", "nl": "DEEL 2:"}
PART3 = {"fr": "PARTIE 3", "nl": "DEEL 3"}
WEB = {"fr": "thestorypress.online/fr", "nl": "thestorypress.online/nl"}

def words(line):
    return len([w for w in line.split() if re.search(r"\w", w)])

def main(path):
    text = open(path, encoding="utf-8").read()
    blocks = re.split(r"^=== STORY (\d+) ===\s*$", text, flags=re.M)
    errs, n = [], 0
    for i in range(1, len(blocks), 2):
        n += 1
        sid, body = blocks[i], blocks[i + 1]
        lines = body.strip("\n").split("\n")
        p = f"STORY {sid}"
        def field(name):
            for l in lines:
                if l.startswith(name + ":"):
                    return l[len(name) + 1:].strip()
            errs.append(f"{p}: thiếu trường '{name}'"); return ""
        for f in ["Tác giả", "Thời gian", "Tiêu đề"]:
            field(f)
        page = field("Tên Page")
        lang = PAGES.get(page)
        if not lang:
            errs.append(f"{p}: Tên Page '{page}' không nằm trong danh sách"); lang = "fr"
        try:
            k = lines.index("Nội dung thẻ:")
        except ValueError:
            errs.append(f"{p}: thiếu 'Nội dung thẻ:'"); continue
        card = lines[k + 1:k + 6]
        if len(card) < 5 or not lines[k + 6].startswith("Highlights:"):
            errs.append(f"{p}: thẻ phải có đúng 5 dòng rồi tới Highlights")
        for j, l in enumerate(card, 1):
            w = words(l)
            if not 14 <= w <= 20:
                errs.append(f"{p}: dòng thẻ {j} có {w} từ (cần 14-20)")
        if card and not card[-1].rstrip().endswith("..."):
            errs.append(f"{p}: dòng 5 phải kết thúc bằng ...")
        hl = [h.strip().strip('"') for h in field("Highlights").split("|") if h.strip()]
        if not 2 <= len(hl) <= 3:
            errs.append(f"{p}: cần 2-3 cụm Highlights")
        joined = " ".join(card)
        for h in hl:
            if h not in joined:
                errs.append(f"{p}: Highlight không khớp nguyên văn: {h}")
        if field("Nút CTA") != CTA[lang]:
            errs.append(f"{p}: Nút CTA phải là '{CTA[lang]}'")
        cap = field("Caption")
        if len(cap) >= 150: errs.append(f"{p}: Caption {len(cap)} ký tự (cần <150)")
        if "👇" not in cap: errs.append(f"{p}: Caption thiếu 👇")
        if len(re.findall(r"#\w+", cap)) < 3: errs.append(f"{p}: Caption cần >=3 hashtag")
        m = re.search(r"^Comment 1:(.*)", body, flags=re.M | re.S)
        com = m.group(1).strip() if m else ""
        if not com.startswith(PART2[lang]):
            errs.append(f"{p}: Comment 1 phải mở bằng '{PART2[lang]}'")
        cw = len(com.split())
        if not 380 <= cw <= 520:
            errs.append(f"{p}: Comment 1 có {cw} từ (cần 380-500)")
        tail = com[-400:]
        if PART3[lang] not in tail: errs.append(f"{p}: thiếu CTA {PART3[lang]} ở cuối Comment 1")
        if WEB[lang] not in tail: errs.append(f"{p}: thiếu link {WEB[lang]} ở cuối Comment 1")
    if n == 0: errs.append("Không tìm thấy truyện nào (=== STORY N ===)")
    print(f"Đã kiểm tra {n} truyện.")
    print("\n".join(errs) if errs else "✅ Tất cả đạt chuẩn.")
    sys.exit(1 if errs else 0)

if __name__ == "__main__":
    main(sys.argv[1])
