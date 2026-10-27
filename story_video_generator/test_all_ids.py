with open("studio_engine_v7.js") as f:
    code = f.read()

import re
matches = set(re.findall(r'document\.getElementById\(["\']([a-zA-Z0-9_-]+)["\']\)', code))
print(f"Total unique IDs in studio_engine_v7.js: {len(matches)}")
print("IDs:", sorted(list(matches)))

