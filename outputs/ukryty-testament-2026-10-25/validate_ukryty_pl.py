"""Run the installed content-tools validator with this user's explicit new Page/PL mapping."""
import runpy
import sys
from pathlib import Path

source = Path('/Users/tony/.codex/skills/content-tools/scripts/validate.py')
ns = runpy.run_path(str(source))
env = ns['main'].__globals__
env['PAGES'] = {'Ukryty Testament': 'pl'}
env['CTA']['pl'] = 'Czytaj dalej w komentarzu'
env['PART2']['pl'] = 'CZĘŚĆ 2:'
env['PART3']['pl'] = 'CZĘŚĆ 3'
env['WEB']['pl'] = 'https://www.thestorypress.online'
env['main'](sys.argv[1])
