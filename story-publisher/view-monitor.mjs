import {safeError} from './core.mjs';
export function migrateViewMonitor(db){
 const columns=db.prepare('PRAGMA table_info(jobs)').all().map(c=>c.name);
 for(const [name,type] of [['view_count','INTEGER'],['views_checked_at','TEXT'],['views_next_check','TEXT'],['views_error','TEXT'],['views_alert_at','TEXT']])if(!columns.includes(name))db.exec(`ALTER TABLE jobs ADD COLUMN ${name} ${type}`);
 db.exec('CREATE INDEX IF NOT EXISTS jobs_views_due ON jobs(status,views_alert_at,views_next_check)');
}
export function createViewMonitor({db,apiFor,clock=()=>new Date()}){
 let busy=false;
 return async function checkViews(){
  if(busy)return;busy=true;
  try{
   const stamp=clock().toISOString();
   // Bound API traffic. A paused posting Page still receives view alerts for its published videos.
   const jobs=db.prepare("SELECT jobs.* FROM jobs JOIN pages ON pages.id=jobs.page_id WHERE jobs.status='published' AND jobs.video_id IS NOT NULL AND jobs.views_alert_at IS NULL AND pages.token IS NOT NULL AND (views_next_check IS NULL OR views_next_check<=?) ORDER BY COALESCE(views_next_check,'') LIMIT 10").all(stamp);
   for(const job of jobs){
    const page=db.prepare('SELECT * FROM pages WHERE id=?').get(job.page_id);
    let api;
    try{
     api=apiFor(page);const count=await api.views(job.video_id),checked=clock().toISOString(),next=new Date(clock().getTime()+10*60000).toISOString();
     db.exec('BEGIN IMMEDIATE');
     try{
      db.prepare('UPDATE jobs SET view_count=?,views_checked_at=?,views_next_check=?,views_error=NULL WHERE id=?').run(count,checked,next,job.id);
      if(count>=1000){
       const key=`views1000:${page.id}:${job.video_id}`,text=`🔗 VIDEO ĐẠT 1.000 LƯỢT XEM — LÀM LINK\nPage: ${page.name}\nBài: ${job.title||job.asset_id}\nLượt xem: ${count.toLocaleString('vi-VN')}\nhttps://www.facebook.com/reel/${job.video_id}\nĐã đủ mốc để bạn làm link bài.`;
       db.prepare('INSERT OR IGNORE INTO outbox(id,text,next_try) VALUES(?,?,?)').run(key,text,checked);
       db.prepare('UPDATE jobs SET views_alert_at=? WHERE id=?').run(checked,job.id);
      }
      db.exec('COMMIT');
     }catch(e){db.exec('ROLLBACK');throw e;}
    }catch(e){db.prepare('UPDATE jobs SET views_error=?,views_checked_at=?,views_next_check=? WHERE id=?').run(safeError(e,api?.token),clock().toISOString(),new Date(clock().getTime()+3600000).toISOString(),job.id);}
   }
  }finally{busy=false;}
 };
}
