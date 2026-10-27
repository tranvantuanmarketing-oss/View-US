with open("index.html") as f:
    text = f.read()

import re
matches = re.findall(r'document\.getElementById\(["\']([a-zA-Z0-9_-]+)["\']\)', text)
missing = []
for id_name in set(matches):
    if f'id="{id_name}"' not in text and f"id='{id_name}'" not in text:
        missing.append(id_name)

print("Total getElementById calls:", len(matches))
print("Missing IDs in index.html:", missing)
