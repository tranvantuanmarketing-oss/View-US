with open("index.html") as f:
    text = f.read()

import re
scripts = re.findall(r'<script>([\s\S]*?)</script>', text)
s_last = scripts[-1] # studio_engine_v7.js

# Find btnMoStudio
for line in s_last.split('\n'):
    if 'btnMoStudio' in line or 'btnOpenQuyChuan' in line:
        print(line)

