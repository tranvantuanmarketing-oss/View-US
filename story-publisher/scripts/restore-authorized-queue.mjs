// User authorized reconnecting the existing nine Pages and publishing unsent overdue jobs.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync} from 'node:fs';
import {decrypt,safeError} from '../core.mjs';
import {Meta} from '../meta.mjs';
const db=new DatabaseSync(new URL('../data/publisher.db',import.meta.url));
const key=readFileSync(new URL('../data/secret.key',import.meta.url));
const now=new Date(), pages=db.prepare('SELECT * FROM pages').all();
const candidates=db.prepare("SELECT * FROM jobs WHERE video_id IS NULL AND scheduled_at<? AND (status IN ('scheduled','missed','failed') OR (status='review' AND error LIKE '%must be granted before impersonating%')) ORDER BY scheduled_at").all(now.toISOString());
const verified=new Set(),conflicts=[];
for(const p of pages){
 const api=new Meta(decrypt(p.token,key));
 try{
  await api.verify(p.id);verified.add(p.id);
  const pending=candidates.filter(j=>j.page_id===p.id);
  if(!pending.length)continue;
  const r=await api.call(`${p.id}/videos`,{fields:'id,title,created_time',limit:'100'});
  if(!Array.isArray(r.data)||r.paging?.next)throw Error('Cannot confirm complete recent video list; stop before retry.');
  for(const j of pending){
   if(r.data.some(v=>v.title?.trim()===j.title?.trim()))conflicts.push(j.id);
   const asset=db.prepare('SELECT file FROM assets WHERE id=?').get(j.asset_id);
   if(!asset||!existsSync(asset.file))throw Error('Missing asset file');
  }
 }catch(e){console.log(p.name,safeError(e,api.token));db.close();process.exit(1);}
}
const reserved=db.prepare("SELECT scheduled_at FROM jobs WHERE status IN ('scheduled','checking','starting','uploading','finishing') AND scheduled_at>=?").all(now.toISOString()).map(j=>new Date(j.scheduled_at).getTime());
let cursor=Math.ceil((Date.now()+60000)/60000)*60000;
const plan=candidates.filter(j=>!conflicts.includes(j.id)).map(j=>{
 while(reserved.some(t=>Math.abs(t-cursor)<300000))cursor+=60000;
 const at=new Date(cursor).toISOString();reserved.push(cursor);cursor+=300000;return {...j,at};
});
db.exec('BEGIN IMMEDIATE');
try{
 for(const j of plan){
  const r=db.prepare("UPDATE jobs SET status='scheduled',scheduled_at=?,next_check=NULL,error=NULL,attempts=0 WHERE id=? AND video_id IS NULL AND status IN ('scheduled','missed','failed','review')").run(j.at,j.id);
  if(r.changes!==1)throw Error('Job changed during recovery');
  db.prepare('INSERT INTO events(time,job_id,message) VALUES(?,?,?)').run(now.toISOString(),j.id,'Đã xác minh token, đọc danh sách video Meta không thấy tiêu đề trùng; người dùng yêu cầu đăng bù, giãn tối thiểu 5 phút.');
 }
 // Reconcile existing Meta IDs; never start a replacement upload for these.
 db.prepare("UPDATE jobs SET status='checking',attempts=0,next_check=? WHERE video_id IS NOT NULL AND status IN ('checking','review')").run(now.toISOString());
 for(const p of pages)if(verified.has(p.id))db.prepare('UPDATE pages SET enabled=1,connection_error=NULL WHERE id=?').run(p.id);
 db.exec('COMMIT');
}catch(e){db.exec('ROLLBACK');throw e;}
console.log(JSON.stringify({enabled:verified.size,requeued:plan.map(j=>({id:j.id,page:pages.find(p=>p.id===j.page_id).name,title:j.title,at:j.at})),conflicts},null,2));
db.close();
