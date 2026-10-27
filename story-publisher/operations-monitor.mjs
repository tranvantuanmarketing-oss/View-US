// Read-only job monitoring: never retries a Meta publication or changes its ID.
import {isMetaAuthError} from './connections.mjs';
export function createOperationsMonitor({db,notify,probe,clock=()=>new Date()}) {
 db.exec('CREATE TABLE IF NOT EXISTS operations_state(key TEXT PRIMARY KEY,value TEXT NOT NULL)');
 const get=k=>db.prepare('SELECT value FROM operations_state WHERE key=?').get(k)?.value;
 const put=(k,v)=>db.prepare('INSERT OR REPLACE INTO operations_state VALUES(?,?)').run(k,String(v));
 let busy=false,first=true;
 return async function tick(){
  if(busy)return;busy=true;
  try{
   const time=clock(),ms=time.getTime(),iso=time.toISOString(),previous=Number(get('heartbeat')||0);
   if(previous&&ms-previous>180000){
    notify('ops:gap:'+previous,`⚠️ The Story · Máy đăng vừa hoạt động lại sau ${Math.round((ms-previous)/60000)} phút gián đoạn/ngủ máy. Đang rà soát lịch; không tự đăng lại bài chưa rõ kết quả.`);
   }
   put('heartbeat',ms);
   if(first){
    notify('ops:boot:'+iso,'ℹ️ The Story · Dịch vụ đăng đã khởi động. Đang kiểm tra bài lỗi/quá giờ; không tạo lại video để tránh trùng bài.');first=false;
   }
   try{
    await probe();
    const offline=get('offline');
    if(offline){notify('ops:online:'+offline,`✅ The Story · Kết nối mạng tới Meta đã trở lại. Gián đoạn từ ${offline}. Kiểm tra các cảnh báo bài đăng đi kèm.`);put('offline','');}
   }catch{
    if(!get('offline')){put('offline',iso);notify('ops:offline:'+iso,`⚠️ The Story · Không kết nối được tới Meta từ ${iso}. Đây có thể là lỗi mạng hoặc dịch vụ Meta. Thông báo được giữ và gửi khi Telegram kết nối lại.`);}
   }
   const authPages=db.prepare('SELECT id,name,connection_error FROM pages').all().filter(p=>isMetaAuthError(p.connection_error));
   const authIds=new Set(authPages.map(p=>p.id));
   const authSignature=JSON.stringify([...authIds].sort());
   if(authPages.length&&get('auth-pages')!==authSignature){
    notify('ops:auth:'+iso,`⚠️ The Story · ${authPages.length} Page cần kết nối lại Meta\n${authPages.map(p=>'• '+p.name).join('\n')}\nMeta đang từ chối token/quyền đại diện Page. Khởi động lại tool không khắc phục lỗi này. Vào Kết nối để cấp lại token đúng Page và quyền. Không tự đăng lại bài chưa đối soát. Các lịch đã chuyển sang Meta cần kiểm tra riêng.`);
   }
   put('auth-pages',authSignature);
   const jobs=db.prepare(`SELECT j.*,p.name AS page_name,p.enabled FROM jobs j JOIN pages p ON p.id=j.page_id WHERE j.status IN ('review','failed','missed') OR (j.status='scheduled' AND j.scheduled_at<?) OR (j.status IN ('starting','uploading','finishing','checking') AND j.scheduled_at<?) OR (j.status='published' AND j.comment_state='review')`).all(new Date(ms-300000).toISOString(),new Date(ms-1800000).toISOString());
   for(const j of jobs){
    if(authIds.has(j.page_id))continue; // One actionable account alert, not one per blocked video.
    const signature=JSON.stringify([j.status,j.comment_state,j.error||'',j.enabled]);
    const key='job:'+j.id;
    if(get(key)===signature)continue;
    notify('ops:job:'+j.id+':'+iso,`⚠️ The Story · Bài cần kiểm tra\nPage: ${j.page_name}\nVideo: ${j.title||j.asset_id}\nTrạng thái: ${j.status} · Bình luận: ${j.comment_state}\nGiờ VN: ${new Date(j.scheduled_at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}\n${j.error||'Chưa hoàn tất đúng giờ.'}${!j.enabled?'\nPage đang tạm dừng.':''}\n${j.video_id?'Đã có Meta ID; cần đối soát, không đăng lại tự động.':'Mở Lịch đăng để kiểm tra.'}`);
    put(key,signature);
   }
  }finally{busy=false;}
 };
}
