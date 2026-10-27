import {localParts} from './core.mjs';
export function buildTelegramSummary(jobs,pages,day){
 const posted=jobs.filter(j=>j.published_at&&localParts(new Date(j.published_at),'Asia/Ho_Chi_Minh').day===day),pending=jobs.filter(j=>j.status==='scheduled'),issues=jobs.filter(j=>['failed','review','missed'].includes(j.status));
 return `📊 THE STORY · BÁO CÁO TỔNG HỢP\nNgày ${day.split('-').reverse().join('/')} · giờ Việt Nam\nĐã đăng hôm nay: ${posted.length}\nĐang chờ đăng: ${pending.length}\nCần xử lý: ${issues.length}\n\n${pages.map(p=>`${p.name}: ${posted.filter(j=>j.page_id===p.id).length} đã đăng · ${pending.filter(j=>j.page_id===p.id).length} chờ`).join('\n')}`;
}
export function createTelegramSummary({db,settings,notify,clock=()=>new Date()}){
 return ()=>{const config=settings();if(!config.enabled)return;const {day,time}=localParts(clock(),'Asia/Ho_Chi_Minh');if(!config.slots.includes(time))return;const key=`summary:${day}:${time}`;if(db.prepare('SELECT 1 FROM outbox WHERE id=?').get(key))return;const text=buildTelegramSummary(db.prepare('SELECT * FROM jobs').all(),db.prepare('SELECT id,name FROM pages ORDER BY name').all(),day);notify(key,text);};
}
