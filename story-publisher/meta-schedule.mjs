export function migrateMetaSchedule(db){
 for(const table of ['pages','jobs'])if(!db.prepare(`PRAGMA table_info(${table})`).all().some(c=>c.name==='delivery_mode'))db.exec(`ALTER TABLE ${table} ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'local'`);
 if(!db.prepare('PRAGMA table_info(jobs)').all().some(c=>c.name==='remote_confirmed_at'))db.exec('ALTER TABLE jobs ADD COLUMN remote_confirmed_at TEXT');
}
export function assertRemoteSchedule(result,at){
 const raw=result.scheduled_publish_time;
 const seconds=typeof raw==='number'||/^\d+$/.test(String(raw||''))?Number(raw):Date.parse(raw)/1000;
 if(!Number.isFinite(seconds)||Math.abs(seconds-Math.floor(new Date(at).getTime()/1000))>1)throw Error('Meta chưa xác nhận đúng scheduled_publish_time; cần đối soát ID, không tải lại.');
 return true;
}
export async function uploadScheduledReel({job,page,asset,api,update,event,clock=()=>Date.now()}){
 if(new Date(job.scheduled_at).getTime()-clock()<20*60000)throw Error('Lịch Meta cần tải trước ít nhất 20 phút; giữ lịch cũ, không tự đổi giờ.');
 const session=await api.start(page.id);
 if(!/^\d+$/.test(String(session.video_id||'')))throw Error('Meta chưa trả video ID.');
 update({video_id:String(session.video_id),status:'uploading'});
 const uploaded=await api.upload(session.upload_url,asset.file);if(!uploaded.success)throw Error('Meta chưa xác nhận upload.');
 update({status:'finishing'});
 const finished=await api.schedule(page.id,session.video_id,job.title,job.caption,job.scheduled_at);
 if(!finished.success)throw Error('Meta chưa xác nhận yêu cầu hẹn lịch.');
 const evidence=await api.scheduledStatus(session.video_id);assertRemoteSchedule(evidence,job.scheduled_at);
 update({status:'checking',remote_confirmed_at:new Date(clock()).toISOString(),next_check:new Date(Math.min(new Date(job.scheduled_at).getTime(),clock()+300000)).toISOString(),error:null});
 event('Meta xác nhận hẹn lịch '+job.scheduled_at+' · ID '+session.video_id+'. Local không đăng lại video này.');
 return {videoId:String(session.video_id),scheduledAt:job.scheduled_at};
}
