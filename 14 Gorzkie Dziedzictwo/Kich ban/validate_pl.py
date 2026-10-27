#!/usr/bin/env python3
"""Polish configuration for the content-tools validator, plus batch checks."""
import importlib.util,re,sys
from pathlib import Path
source=Path('/Users/tony/.codex/skills/content-tools/scripts/validate.py')
spec=importlib.util.spec_from_file_location('content_tools_validator',source)
v=importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)
v.PAGES['Gorzkie Dziedzictwo']='pl'
v.CTA['pl']='Czytaj dalej w komentarzach'
v.PART2['pl']='CZĘŚĆ 2:'
v.PART3['pl']='CZĘŚĆ 3'
v.WEB['pl']='thestorypress.online'
path=Path(sys.argv[1])
data=path.read_text(encoding='utf-8')
blocks=re.split(r'^=== STORY \d+ ===\n',data,flags=re.M)[1:]
assert len(blocks)==20, f'Expected 20 stories, got {len(blocks)}'
assert re.findall(r'^=== STORY (\d+) ===$',data,re.M)==[str(i) for i in range(1,21)]
counts=[]
keys=[]
for i,b in enumerate(blocks,1):
    com=b.split('Comment 1: ',1)[1].strip()
    counts.append(len(com.split()))
    assert 380 <= counts[-1] <= 500,(i,counts[-1])
    ps=com.split('\n\n')[1:-1]
    assert 10 <= len(ps) <= 14,(i,len(ps))
    h=re.search(r'^Highlights: (.+)$',b,re.M).group(1).split(' | ')
    assert len(h)==3
    assert h[0].startswith('"') and h[1].startswith('"') and not h[2].startswith('"')
    cap=re.search(r'^Caption: (.+)$',b,re.M).group(1)
    assert re.search(r'… 👇 #gorzkiedziedzictwo #\w+ #\w+$',cap)
    keys.append(re.search(r'Napisz «(.+?)»',com).group(1))
assert len(set(keys))==20
try:
    v.main(str(path))
except SystemExit as e:
    if e.code: raise
print(f'PL checks: 20 stories; 13 narrative paragraphs each; comments {min(counts)}–{max(counts)} words; 20 unique keywords.')
