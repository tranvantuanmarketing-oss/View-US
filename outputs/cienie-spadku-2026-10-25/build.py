from pathlib import Path
import json,re,runpy,sys
ROOT=Path(__file__).parent
data=json.loads((ROOT/'stories.json').read_text())
blocks=[]
for i,s in enumerate(data,1):
    blocks.append(f'''=== STORY {i} ===
Tác giả: {s['author']}
Thời gian: {i+1} godz. temu
Tên Page: Cienie Spadku
Tiêu đề: {s['title']}
Nội dung thẻ:
{s['card']}
Highlights: "{s['highlights'][0]}" | "{s['highlights'][1]}" | {s['highlights'][2]}
Nút CTA: Czytaj dalej w komentarzach 👇
Caption: {s['caption']}
Comment 1: CZĘŚĆ 2:

{s['comment']}

Napisz « {s['keyword']} » w komentarzu, a opublikuję CZĘŚĆ 3 poniżej 👇
👉 Przeczytaj całe zakończenie tutaj: https://thestory.danhngon.pro''')
output=ROOT/'Cienie Spadku - 20 opowieści - 25-10-2026.txt'
output.write_text('\n'.join(blocks)+'\n',encoding='utf-8')
module=runpy.run_path('/Users/tony/.codex/skills/content-tools/scripts/validate.py',run_name='validator_pl')
module['PAGES']['Cienie Spadku']='pl'
module['CTA']['pl']='Czytaj dalej w komentarzach 👇'
module['PART2']['pl']='CZĘŚĆ 2:'
module['PART3']['pl']='CZĘŚĆ 3'
module['WEB']['pl']='thestory.danhngon.pro'
extra=[]
for i,s in enumerate(data,1):
    paras=s['comment'].split('\n\n')
    count=len(s['comment'].split())
    if not 380<=count<=500: extra.append(f'Story {i}: body {count} words')
    if not 10<=len(paras)<=14: extra.append(f'Story {i}: {len(paras)} paragraphs')
    if len(s['highlights'])!=3: extra.append(f'Story {i}: highlights')
    if len(re.findall(r'#\w+',s['caption']))!=3: extra.append(f'Story {i}: hashtags')
    print(i,count,len(paras),[module['words'](x) for x in s['card'].splitlines()])
if len(data)!=20:extra.append('Expected 20 stories')
if extra:
    print('\n'.join(extra));sys.exit(1)
module['main'](str(output))
