with open("index.html") as f:
    html = f.read()

with open("studio_engine_v13.js") as f:
    code = f.read()

import re
matches = set(re.findall(r'document\.getElementById\(["\']([a-zA-Z0-9_-]+)["\']\)', code))

missing = []
present = []
for id_name in sorted(list(matches)):
    pattern = f'id="{id_name}"'
    if pattern in html:
        present.append(id_name)
    else:
        missing.append(id_name)

print(f"Present: {len(present)}/{len(matches)}")
print("MISSING:", missing)

