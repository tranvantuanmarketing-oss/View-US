"use client";
import {useState} from 'react';
export function AssetLibrary({onChange}:{onChange:()=>void}){
 const [kind,setKind]=useState('avatar'),[rows,setRows]=useState<any[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function refresh(k=kind){const r=await fetch('/api/assets');const j=await r.json();setRows(j.data[k==='avatar'?'avatars':k==='music'?'music':'backgrounds']);onChange();}
 async function upload(file?:File){if(!file)return;setBusy(true);try{const form=new FormData();form.set('kind',kind);form.set('file',file);form.set('name',file.name);const r=await fetch('/api/assets',{method:'POST',body:form});const j=await r.json();if(!r.ok)throw new Error(j.error);setMessage('Đã thêm tài nguyên. Chọn trong cấu hình hoặc Cài đặt page.');await refresh();}catch(e:any){setMessage(e.message);}finally{setBusy(false);}}
 async function remove(id:string){if(!confirm('Bỏ tài nguyên khỏi kho? Nếu đang dùng trong page/lô, hệ thống sẽ giữ lại.'))return;const r=await fetch('/api/assets',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,kind})});const j=await r.json();setMessage(r.ok?'Đã bỏ khỏi kho (file ảnh/nhạc gốc vẫn được giữ trên đĩa).':j.error);await refresh();}
 return <details className="rounded-xl border border-blue-200 bg-white p-3 text-xs"><summary className="cursor-pointer font-bold text-blue-800" onClick={()=>refresh()}>Kho tài nguyên · Thêm / Xóa avatar, nhạc, nền</summary><div className="space-y-3 pt-3">
  <select aria-label="Loại tài nguyên" value={kind} onChange={e=>{setKind(e.target.value);refresh(e.target.value);}} className="rounded border p-2"><option value="avatar">Avatar</option><option value="music">Nhạc</option><option value="background">Video nền</option></select>
  <input aria-label="Thêm tài nguyên" type="file" disabled={busy} accept={kind==='avatar'?'.jpg,.jpeg,.png,.webp':kind==='music'?'.mp3,.m4a,.mp4,.wav':'.mp4,.webm'} onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}} />
  <p role="status">{busy?'Đang tải lên…':message}</p><div className="max-h-44 overflow-auto">{rows.map(row=><div key={row.id} className="flex justify-between gap-2 border-b py-2"><span>{row.name || row.title}</span><button className="text-red-700" onClick={()=>remove(row.id)}>Xóa</button></div>)}</div>
 </div></details>;
}
