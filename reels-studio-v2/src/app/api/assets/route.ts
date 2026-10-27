import {NextRequest,NextResponse} from 'next/server';
import fs from 'fs';import path from 'path';import crypto from 'crypto';
import {execFile} from 'child_process';import {promisify} from 'util';import ffmpeg from 'ffmpeg-static';
import {getDb} from '@/lib/db';import {repository} from '@/lib/repository';
export const dynamic='force-dynamic';
export async function GET(){
 const root=path.join(process.cwd(),'public/assets/backgrounds');
 const backgrounds=fs.existsSync(root)?fs.readdirSync(root).filter(n=>/\.(mp4|webm)$/i.test(n)).map(n=>({id:n,name:n,file_path:`/assets/backgrounds/${n}`})):[];
 return NextResponse.json({success:true,data:{backgrounds,avatars:await repository.avatars.list(),music:await repository.music.list()}});
}
export async function POST(req:NextRequest){
 try{
  const data=await req.formData();const file=data.get('file');const kind=String(data.get('kind'));
  if(!(file instanceof File) || !['avatar','music','background'].includes(kind)) throw new Error('Chọn loại tài nguyên và file.');
  const ext=path.extname(file.name).toLowerCase();const allowed=kind==='avatar'?['.jpg','.jpeg','.png','.webp']:kind==='music'?['.mp3','.m4a','.mp4','.wav']:['.mp4','.webm'];
  if(!allowed.includes(ext) || file.size<1 || file.size>(kind==='avatar'?10:100)*1024*1024) throw new Error('Định dạng hoặc kích thước không hợp lệ (ảnh tối đa 10 MB, media 100 MB).');
  const pageId=String(data.get('page_id') || '');
  if(kind==='avatar' && pageId && !await repository.pages.get(pageId)) throw new Error('Page không tồn tại.');
  const id=crypto.randomUUID();const folder=kind==='avatar'?'avatars':kind==='music'?'audio':'backgrounds';
  const url=kind==='avatar' && pageId ? `/assets/avatars/pages/${encodeURIComponent(pageId)}/upload_${id}${ext}` : `/assets/${folder}/upload_${id}${ext}`;const target=path.join(process.cwd(),'public',url);fs.mkdirSync(path.dirname(target),{recursive:true});
  const buffer=Buffer.from(await file.arrayBuffer());
  if(kind==='avatar' && !(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || (buffer[0]===255 && buffer[1]===216 && buffer[2]===255) || (buffer.toString('ascii',0,4)==='RIFF' && buffer.toString('ascii',8,12)==='WEBP'))) throw new Error('File ảnh không hợp lệ.');
  fs.writeFileSync(target,buffer);
  try{
    const name=String(data.get('name') || file.name).slice(0,200);
    let asset:any;
    if(kind==='avatar') {
      asset=await repository.avatars.create({name,image_path:url,gender:'nu',age_min:18,age_max:99,used_by_page_ids:pageId?[pageId]:[]});
      if(pageId) getDb().prepare('UPDATE avatars SET owner_page_id=? WHERE id=?').run(pageId,asset.id);
      asset=await repository.avatars.get(asset.id);
    }
    if(kind==='music') {
      if(file.size>30*1024*1024) throw new Error('Nhạc tối đa 30 MB.');
      if(!ffmpeg) throw new Error('Thiếu FFmpeg để kiểm tra nhạc.');
      const probe=await promisify(execFile)(ffmpeg,['-hide_banner','-i',target,'-t','0.05','-f','null','-'],{timeout:20000});
      const match=probe.stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
      if(!match || !probe.stderr.includes('Audio:')) throw new Error('File nhạc không hợp lệ.');
      const duration=Number(match[1])*3600+Number(match[2])*60+Number(match[3]);
      const mood=String(data.get('mood') || 'nhe-nhang');
      asset=await repository.music.create({title:name,file_path:url,mood:['tram','nhe-nhang','tuoi-sang'].includes(mood)?mood as any:'nhe-nhang',duration_sec:Math.round(duration)});
    }
    return NextResponse.json({success:true,file_path:url,data:asset});
  }catch(err){fs.unlinkSync(target);throw err;}
 }catch(error:any){return NextResponse.json({success:false,error:error.message},{status:400});}
}
export async function DELETE(req:NextRequest){
 try{
  const {kind,id}=await req.json();const db=getDb();
  if(!['avatar','music','background'].includes(kind) || typeof id!=='string') throw new Error('Tài nguyên không hợp lệ.');
  const settings=db.prepare('SELECT * FROM page_settings').all() as any[];
  if(kind==='avatar' && settings.some(s=>JSON.parse(s.avatar_ids_json).includes(id))) throw new Error('Ảnh đang được chọn: bỏ chọn và Lưu cấu hình page trước khi xóa.');
  if(kind==='music' && settings.some(s=>JSON.parse(s.selected_track_ids_json).includes(id))) throw new Error('Nhạc đang được chọn trong một page: bỏ chọn và Lưu cấu hình page trước khi xóa.');
  const column=kind==='avatar'?'avatar_id':kind==='music'?'track_id':'background_video_url';
  const value=kind==='background'?`/assets/backgrounds/${id}`:id;
  if((db.prepare(`SELECT COUNT(*) n FROM batch_items WHERE ${column}=?`).get(value) as any).n) throw new Error('Tài nguyên có trong lịch sử lô; giữ lại để bảo toàn snapshot.');
  if(kind==='avatar') db.prepare('DELETE FROM avatars WHERE id=?').run(id);
  if(kind==='music') db.prepare('DELETE FROM music_tracks WHERE id=?').run(id);
  if(kind==='background') {
    if(path.basename(id)!==id) throw new Error('Tên file không hợp lệ.');
    const target=path.join(process.cwd(),'public/assets/backgrounds',id);
    const trash=path.join(process.cwd(),'data/asset-trash');fs.mkdirSync(trash,{recursive:true});
    fs.renameSync(target,path.join(trash,`${Date.now()}_${id}`));
  }
  return NextResponse.json({success:true});
 }catch(error:any){return NextResponse.json({success:false,error:error.message},{status:409});}
}
