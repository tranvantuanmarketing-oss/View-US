"""Extract only paired-media inputs, with path, size, symlink and zip-bomb limits."""
import sys, zipfile, pathlib, stat, json
source, target = sys.argv[1:]
with zipfile.ZipFile(source) as z:
    entries=z.infolist()
    if len(entries)>2000: raise ValueError('ZIP có quá nhiều file')
    total=0; names=set(); selected=[]
    for entry in entries:
        p=pathlib.PurePosixPath(entry.filename.replace('\\','/'))
        if p.is_absolute() or '..' in p.parts or stat.S_ISLNK(entry.external_attr>>16): raise ValueError('Đường dẫn ZIP không an toàn')
        if entry.is_dir() or '__MACOSX' in p.parts or p.name.startswith('.'): continue
        if p.suffix.lower() not in ('.mp4','.txt'): continue
        total+=entry.file_size
        if total>600*1024*1024 or entry.file_size>300*1024*1024: raise ValueError('ZIP giải nén vượt giới hạn 600 MB')
        if entry.file_size>max(1,entry.compress_size)*300: raise ValueError('Tỉ lệ nén bất thường')
        if p.name.casefold() in names: raise ValueError('ZIP chứa tên file trùng; hãy nhập từng lô riêng')
        names.add(p.name.casefold()); selected.append((entry,p.name))
    for entry,name in selected:
        (pathlib.Path(target)/name).write_bytes(z.read(entry))
print(json.dumps([name for _,name in selected]))
