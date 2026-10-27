import json, re

with open('kho-mau-v1.6.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_mau = re.search(r'<script id="mau-data"[^>]*>(.*?)</script>', html, re.S)
mau_data = json.loads(m_mau.group(1))

print(f"Total templates in MAU: {len(mau_data)}")
for i in [0, 5, 11, 21, 31, 41, 50, 58, 62, 70]:
    m = mau_data[i]
    print(f"[{i:02d}] ID: {m['id']:<25} HO: {str(m.get('ho')):<12} LABEL: {m['label']}")

