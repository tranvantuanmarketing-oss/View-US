from pathlib import Path, PurePosixPath
import hashlib
import json
import shutil
import sys
import zipfile

BASE = Path('/Users/tony/Downloads/View US/skill')
PACKAGES = [('Content tools-v2.zip', 'content-tools'), ('Drama post-v11.zip', 'drama-post'), ('New story-v5.zip', 'new-story')]
STORAGE = BASE / 'installed-packages-2026-10-25'

def extract():
    STORAGE.mkdir(exist_ok=True)
    records = []
    for filename, skill in PACKAGES:
        package = STORAGE / skill
        if package.exists():
            raise RuntimeError(f'Already exists: {package}')
        with zipfile.ZipFile(BASE / filename) as archive:
            if sum(i.file_size for i in archive.infolist()) > 50_000_000:
                raise RuntimeError('Archive too large')
            for info in archive.infolist():
                relative = PurePosixPath(info.filename)
                if relative.is_absolute() or '..' in relative.parts or (info.external_attr >> 16) & 0o170000 == 0o120000:
                    raise RuntimeError(f'Unsafe member: {relative}')
                target = package.joinpath(*relative.parts)
                if info.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.read(info))
        skill_dir = package / 'skills' / skill
        assert (skill_dir / 'SKILL.md').is_file()
        records.append({'skill': skill, 'archive': filename, 'archive_sha256': hashlib.sha256((BASE / filename).read_bytes()).hexdigest(), 'stored_path': str(skill_dir), 'files': len(list(skill_dir.rglob('*')))})
    (STORAGE / 'manifest.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(records, ensure_ascii=False, indent=2))

def install():
    target_root = Path('/Users/tony/.codex/skills')
    for _, name in PACKAGES:
        if (target_root / name).exists():
            raise RuntimeError(f'Refusing overwrite: {name}')
    for _, name in PACKAGES:
        source = STORAGE / name / 'skills' / name
        target = target_root / name
        shutil.copytree(source, target)
        for original in source.rglob('*'):
            if original.is_file():
                assert original.read_bytes() == (target / original.relative_to(source)).read_bytes()
        print(f'Installed and verified: {target}')

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'install':
        install()
    else:
        extract()
