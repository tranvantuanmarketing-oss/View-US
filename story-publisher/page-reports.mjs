import {randomUUID} from 'node:crypto';
import {localParts,safeError} from './core.mjs';
const VN='Asia/Ho_Chi_Minh';
export function latestDayReport(videos){
 const rows=videos.map(v=>({...v,day:Number.isFinite(new Date(v.created_time).getTime())?localParts(new Date(v.created_time),VN).day:null,views:Number.isSafeInteger(v.views)&&v.views>=0?v.views:null}));
 const latest=rows.map(v=>v.day).filter(Boolean).sort().at(-1)||null;
 const ordered=rows.filter(v=>v.day).sort((a,b)=>Date.parse(b.created_time)-Date.parse(a.created_time)||String(a.id).localeCompare(String(b.id)));
 return {latestDay:latest,latestVideos:ordered.slice(0,5),thresholdVideos:rows.filter(v=>v.views!==null&&v.views>=1000),videos:rows,undated:rows.filter(v=>!v.day).length};
}
export function reportMessages(report){
 const messages=[`📊 STORY · QUÉT VIEWS TẤT CẢ PAGE\n${new Date(report.finishedAt).toLocaleString('vi-VN',{timeZone:VN})} · giờ VN\nLượt xem tích lũy hiện tại, KHÔNG phải lượt xem tăng trong ngày.\nPhạm vi: video Meta cho phép đọc qua /Page/videos (gồm video ngoài tool).`];
 for(const p of report.pages){
  const heading=`📄 ${p.name}\n${p.error?'Không đọc được: '+p.error:`Đã quét ${p.videos.length} video · ${p.complete?'Hết danh sách API':'CHƯA HẾT: chạm giới hạn 10.000 video'}\nNgày đăng gần nhất (VN): ${p.latestDay||'Chưa có video'}${p.undated?' · '+p.undated+' video thiếu ngày':''}`}\n`;
  let chunk=heading;
  if(!p.error)chunk+='5 video mới nhất (hoặc ít hơn nếu Page chưa đủ 5):\n';
  const append=line=>{if(chunk.length+line.length>3500){messages.push(chunk);chunk=`📄 ${p.name} (tiếp)\n`;}chunk+=line;};
  for(const v of p.latestVideos||[])append(`\n• ${(v.title||'Video '+v.id).slice(0,180)}: ${v.views===null?'chưa có dữ liệu':v.views.toLocaleString('vi-VN')+' views'} · ${Number.isSafeInteger(v.comments)?v.comments.toLocaleString('vi-VN')+' bình luận':'bình luận: chưa đọc được'}\nhttps://www.facebook.com/reel/${encodeURIComponent(v.id)}\n`);
  if(!p.error){append(`\n🔗 Toàn Page: ${(p.thresholdVideos||[]).length} video đạt ≥1.000 views${p.complete?'':' (chưa quét hết API)'}.\n`);for(const v of p.thresholdVideos||[])append(`• ${(v.title||v.id).slice(0,180)}: ${v.views.toLocaleString('vi-VN')} views\nhttps://www.facebook.com/reel/${encodeURIComponent(v.id)}\n`);}
  messages.push(chunk);
 }
 return messages;
}
export function createPageReports({db,apiFor,notify,clock=()=>new Date()}){
 db.exec(`CREATE TABLE IF NOT EXISTS page_reports(id TEXT PRIMARY KEY,trigger TEXT NOT NULL,status TEXT NOT NULL,started_at TEXT NOT NULL,finished_at TEXT,result TEXT,error TEXT);`);
 db.exec('CREATE TABLE IF NOT EXISTS page_view_alerts(page_id TEXT NOT NULL,video_id TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(page_id,video_id))');
 db.prepare("UPDATE page_reports SET status='interrupted',error='Máy khởi động lại khi đang quét; hãy quét lại.' WHERE status='running'").run();
 let busy=false;
 function state(){const r=db.prepare("SELECT * FROM page_reports WHERE trigger!='hourly-threshold' ORDER BY rowid DESC LIMIT 1").get();return {enabled:true,time:'07:00',thresholdIntervalMinutes:60,zone:VN,busy,last:r?{...r,result:r.result?JSON.parse(r.result):null}:null};}
 async function scan(trigger='manual',id=randomUUID()){
  if(busy)return {busy:true};busy=true;
  db.prepare("INSERT INTO page_reports(id,trigger,status,started_at) VALUES(?,?,'running',?)").run(id,trigger,clock().toISOString());
  try{
   const pages=[];
   for(const p of db.prepare('SELECT * FROM pages ORDER BY name').all()){
    let api;
    try{if(!p.token)throw Error('Chưa kết nối token.');api=apiFor(p);const listed=await api.videos(p.id),result=latestDayReport(listed.videos);
     if(trigger!=='hourly-threshold')for(const v of result.latestVideos){try{v.comments=await api.commentCount(v.id);}catch(e){v.comments=null;v.commentsError=safeError(e,api?.token);}}
     pages.push({id:p.id,name:p.name,complete:listed.complete,...result});}
    catch(e){pages.push({id:p.id,name:p.name,error:safeError(e,api?.token),videos:[],latestVideos:[]});}
   }
   const report={pages,finishedAt:clock().toISOString()};
   db.exec('BEGIN IMMEDIATE');
   try{if(trigger!=='hourly-threshold')reportMessages(report).forEach((message,n)=>notify(`page-report:${id}:${n}`,message));
    for(const p of pages)for(const v of p.thresholdVideos||[])if(!db.prepare('SELECT 1 FROM page_view_alerts WHERE page_id=? AND video_id=?').get(p.id,String(v.id))){notify(`views1000:${p.id}:${v.id}`,`🔗 VIDEO ĐẠT 1.000 LƯỢT XEM — LÀM LINK\nPage: ${p.name}\nBài: ${(v.title||v.id).slice(0,180)}\nLượt xem: ${v.views.toLocaleString('vi-VN')}\nhttps://www.facebook.com/reel/${encodeURIComponent(v.id)}`);db.prepare('INSERT INTO page_view_alerts VALUES(?,?,?)').run(p.id,String(v.id),report.finishedAt);}
    db.prepare("UPDATE page_reports SET status=?,finished_at=?,result=? WHERE id=?").run(pages.some(p=>p.error||!p.complete||p.latestVideos.some(v=>v.commentsError))?'partial':'completed',report.finishedAt,JSON.stringify(report),id);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
   return {id};
  }catch(e){db.prepare("UPDATE page_reports SET status='failed',error=?,finished_at=? WHERE id=?").run(safeError(e),clock().toISOString(),id);return {id,error:safeError(e)};}
  finally{busy=false;}
 }
 async function tick(){const {day,time}=localParts(clock(),VN);if(busy)return;
  if(time==='07:00'){const id=`daily:${day}`;if(!db.prepare('SELECT 1 FROM page_reports WHERE id=?').get(id))await scan('daily',id);return;}
  const hour=`${day}:${time.slice(0,2)}`,id=`threshold:${hour}`;
  if(time.startsWith('07:')&&db.prepare('SELECT 1 FROM page_reports WHERE id=?').get(`daily:${day}`))return;
  if(!db.prepare('SELECT 1 FROM page_reports WHERE id=?').get(id))await scan('hourly-threshold',id);
 }
 return {state,scan,tick};
}
