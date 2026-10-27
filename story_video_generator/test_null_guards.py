with open("studio_engine_v7.js") as f:
    code = f.read()

import re
lines = code.split('\n')
for i, line in enumerate(lines):
    if '.onclick' in line or '.onchange' in line or '.oninput' in line:
        if not re.search(r'if\s*\(', line):
            print(f"Line {i+1}: {line.strip()}")

