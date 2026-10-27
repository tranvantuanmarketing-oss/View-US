import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync, readdirSync, rmSync, statSync, createReadStream } from 'node:fs';
import { randomUUID, randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import { countries, parseText, hash, encrypt, decrypt, validateSlots, validateTimezone, planSlots, isPublished, safeError } from './core.mjs';
import { Meta } from './meta.mjs';
import { connectionView,isMetaAuthError } from './connections.mjs';
import { pageDisplayName } from './pageIdentity.mjs';
import {migrateViewMonitor,createViewMonitor} from './view-monitor.mjs';
import {migrateStudioBridge,createStudioBridge,studioPages} from './studio-bridge.mjs';
import {createTelegramSummary} from './telegram-summary.mjs';
import {createPageReports} from './page-reports.mjs';
import {createDramaAgent,GeminiResearch,researchDefaults,validateResearchSettings} from './drama-agent.mjs';
import {createKnowledgeBase} from './knowledge-base.mjs';
import {migrateAssetArchive,archiveAssets} from './asset-archive.mjs';
import {createOperationsMonitor} from './operations-monitor.mjs';
import {migrateMetaSchedule,uploadScheduledReel} from './meta-schedule.mjs';
const ROOT=path.dirname(fileURLToPath(import.meta.url)), DATA=process.env.PUBLISHER_DATA||path.join(ROOT,'data');
const PORT=Number(process.env.PORT||3030), VERSION=process.env.META_GRAPH_VERSION||'v26.0';
if(!/^v\d+\.0$/.test(VERSION))throw Error('Invalid Graph version');
mkdirSync(DATA,{recursive:true,mode:0o700});chmodSync(DATA,0o700);
const keyfile=path.join(DATA,'secret.key');if(!existsSync(keyfile))writeFileSync(keyfile,randomBytes(32),{mode:0o600,flag:'wx'});
const KEY=readFileSync(keyfile), db=new DatabaseSync(path.join(DATA,'publisher.db'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS pages(id TEXT PRIMARY KEY,name TEXT NOT NULL,country TEXT NOT NULL,zone TEXT NOT NULL,slots TEXT NOT NULL,token TEXT,enabled INTEGER NOT NULL DEFAULT 1,verified_at TEXT);
CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,hash TEXT UNIQUE NOT NULL,file TEXT NOT NULL,title TEXT,content TEXT,caption TEXT,comment TEXT,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,page_id TEXT REFERENCES pages(id),asset_id TEXT REFERENCES assets(id),scheduled_at TEXT NOT NULL,zone TEXT NOT NULL,status TEXT NOT NULL,title TEXT,caption TEXT,comment TEXT,video_id TEXT,comment_id TEXT,comment_state TEXT DEFAULT 'pending',attempts INTEGER DEFAULT 0,next_check TEXT,error TEXT,created_at TEXT NOT NULL,published_at TEXT, UNIQUE(page_id,asset_id));
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,time TEXT NOT NULL,job_id TEXT,message TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS config(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY,text TEXT NOT NULL,status TEXT DEFAULT 'pending',attempts INTEGER DEFAULT 0,next_try TEXT,error TEXT);
CREATE INDEX IF NOT EXISTS jobs_due ON jobs(status,scheduled_at);`);
for(const [name,type] of [['connection_json',"TEXT DEFAULT '{}'"],['connection_error','TEXT']]) {
 if(!db.prepare('PRAGMA table_info(pages)').all().some(c=>c.name===name))db.exec(`ALTER TABLE pages ADD COLUMN ${name} ${type}`);
}
const discovery=new Map();
migrateMetaSchedule(db);
migrateViewMonitor(db);
migrateStudioBridge(db);
migrateAssetArchive(db);
for(const [pageId,studioId] of Object.entries(studioPages))if(db.prepare('SELECT 1 FROM pages WHERE id=?').get(pageId))db.prepare('INSERT OR IGNORE INTO studio_links(page_id,studio_page_id,after_time) VALUES(?,?,?)').run(pageId,studioId,new Date().toISOString());
if(!db.prepare('PRAGMA table_info(assets)').all().some(c=>c.name==='page_id'))db.exec('ALTER TABLE assets ADD COLUMN page_id TEXT REFERENCES pages(id)');
chmodSync(path.join(DATA,'publisher.db'),0o600);
const now=()=>new Date().toISOString();
const all=(sql,...p)=>db.prepare(sql).all(...p), one=(sql,...p)=>db.prepare(sql).get(...p), run=(sql,...p)=>db.prepare(sql).run(...p);
function tx(fn){db.exec('BEGIN IMMEDIATE');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}
function event(job,message){run('INSERT INTO events(time,job_id,message) VALUES(?,?,?)',now(),job,message);}
function cfg(key){const row=one('SELECT value FROM config WHERE key=?',key);return row?decrypt(row.value,KEY):'';}
function setCfg(key,value){run('INSERT OR REPLACE INTO config VALUES(?,?)',key,encrypt(value,KEY));}
function summarySettings(){try{return JSON.parse(cfg('telegram_summary')||'{"enabled":false,"slots":["09:00","21:00"]}');}catch{return {enabled:false,slots:['09:00','21:00']};}}
function researchSettings(){let settings;try{settings=JSON.parse(cfg('gemini_research')||'{}');}catch{settings={};}return {...researchDefaults,...settings,key:cfg('gemini_key')};}
function notify(id,text){run('INSERT OR IGNORE INTO outbox(id,text,next_try) VALUES(?,?,?)',id,text.slice(0,3900),now());}
function updateJob(id,fields){run(`UPDATE jobs SET ${Object.keys(fields).map(k=>`${k}=?`).join(',')} WHERE id=?`,...Object.values(fields),id);}
// An interrupted write may have reached Meta. Never create a replacement Reel automatically.
run("UPDATE jobs SET status=CASE WHEN video_id IS NULL THEN 'review' ELSE 'checking' END,error='Ứng dụng khởi động lại; đối soát trước khi đăng tiếp.' WHERE status IN ('starting','uploading','finishing')");
run("UPDATE jobs SET comment_state='review' WHERE comment_state='sending'");
run("UPDATE outbox SET status='pending' WHERE status='sending'");
async function collect(req,limit){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw Error('Dữ liệu quá lớn. Mỗi lần nhập tối đa 300 MB.');chunks.push(chunk);}return Buffer.concat(chunks);}
async function jsonBody(req){return JSON.parse((await collect(req,1024*1024)).toString()||'{}');}
function pagePublic(p){const {token,connection_json,connection_error,...rest}=p;return {...rest,facebookName:JSON.parse(connection_json||'{}').facebookName||null,connected:!!token,connection:connectionView(p),slots:JSON.parse(p.slots)};}
function inventory(pageId){return one("SELECT COUNT(*) AS remaining FROM assets WHERE page_id=? AND NOT EXISTS(SELECT 1 FROM jobs WHERE jobs.asset_id=assets.id AND jobs.page_id=? AND published_at IS NOT NULL)",pageId,pageId).remaining;}
function lowInventory(pageId){const count=inventory(pageId),key='low-stock:'+pageId;if(count>3){setCfg(key,'');return;}if(cfg(key))return;const page=one('SELECT name FROM pages WHERE id=?',pageId);notify(randomUUID(),`⚠️ Sắp hết video · ${page.name}\nCòn ${count} video chưa đăng. Hãy gen và tải thêm MP4 + TXT cho Page.`);setCfg(key,'notified');}
function state(){return {version:VERSION,serverTime:now(),uptime:Math.floor(process.uptime()),countries,pages:all("SELECT pages.*,EXISTS(SELECT 1 FROM jobs WHERE page_id=pages.id AND published_at IS NOT NULL) AS live_published FROM pages ORDER BY name").map(p=>({...pagePublic(p),remaining:inventory(p.id)})),assets:all('SELECT id,name,hash,title,content,caption,comment,created_at,page_id FROM assets WHERE NOT EXISTS(SELECT 1 FROM asset_archive WHERE asset_id=assets.id) ORDER BY name COLLATE NOCASE ASC,created_at DESC'),jobs:all('SELECT jobs.*,pages.name AS page_name FROM jobs JOIN pages ON pages.id=jobs.page_id ORDER BY scheduled_at DESC'),events:all('SELECT * FROM events ORDER BY id DESC LIMIT 60'),telegramSummary:summarySettings(),telegram:!!cfg('telegram_token')&&!!cfg('telegram_chat'),notifications:all('SELECT id,status,attempts,error FROM outbox ORDER BY rowid DESC LIMIT 10')};}
function makePlan(b){
 const page=one('SELECT * FROM pages WHERE id=?',b.pageId);if(!page)throw Error('Hãy chọn Page.');
 const ids=[...new Set(b.assetIds||[])];if(!ids.length||ids.length>500)throw Error('Chọn 1–500 video.');
 const assets=ids.map(id=>{const a=one('SELECT * FROM assets WHERE id=?',id);if(!a)throw Error('Không tìm thấy video.');if(one('SELECT 1 FROM asset_archive WHERE asset_id=?',id))throw Error('Video đang lưu trữ; cần khôi phục trước khi xếp lịch.');if(a.page_id&&a.page_id!==page.id)throw Error(`${a.name}: thuộc Page khác.`);if(!a.caption?.trim())throw Error(`${a.name}: cần điền caption trước khi lên lịch.`);if(one("SELECT id FROM jobs WHERE page_id=? AND asset_id=? AND status!='cancelled'",page.id,id))throw Error(`${a.name}: đã có lịch/bài trên Page này.`);return a;}).sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true}));
 let times;
 if(b.mode==='now') { if(ids.length!==1)throw Error('Đăng ngay: chọn đúng 1 video.');times=[now()]; }
 else if(b.mode==='manual') {const d=new Date(b.at);if(!Number.isFinite(d.getTime())||d.getTime()<Date.now()+30000)throw Error('Chọn giờ tương lai (ít nhất 30 giây).');if(ids.length!==1)throw Error('Lịch chính xác: chọn 1 video.');times=[d.toISOString()];}
 else {const start=b.after?new Date(b.after).getTime():Date.now();if(!Number.isFinite(start))throw Error('Ngày bắt đầu không hợp lệ.');times=planSlots(page.zone,JSON.parse(page.slots),assets.length,Math.max(Date.now(),start),all("SELECT scheduled_at FROM jobs WHERE page_id=? AND status!='cancelled'",page.id).map(x=>x.scheduled_at));}
 return {page,assets,items:assets.map((a,i)=>({assetId:a.id,name:a.name,at:times[i],local:new Date(times[i]).toLocaleString('vi-VN',{timeZone:page.zone}),zone:page.zone}))};
}
function enqueue(plan){
 if(!plan.page.enabled||!plan.page.token)throw Error('Page đang tạm dừng hoặc chưa kết nối token.');
 if(['error','permissions'].includes(connectionView(plan.page).status))throw Error('Page có lỗi kết nối/quyền. Hãy kiểm tra lại trước khi xếp lịch.');
 for(const [i,a] of plan.assets.entries()){
  run("DELETE FROM jobs WHERE page_id=? AND asset_id=? AND status='cancelled'",plan.page.id,a.id);
  run('UPDATE assets SET page_id=? WHERE id=? AND page_id IS NULL',plan.page.id,a.id);
  const id=randomUUID();run('INSERT INTO jobs(id,page_id,asset_id,scheduled_at,zone,status,title,caption,comment,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',id,plan.page.id,a.id,plan.items[i].at,plan.page.zone,'scheduled',a.title,a.caption,a.comment,now());event(id,'Đã xác nhận lịch nội bộ, đến giờ mới tải lên Meta.');
 }
}
async function importFiles(req){
 const body=await collect(req,300*1024*1024), form=await new Request('http://localhost/',{method:'POST',headers:{'Content-Type':req.headers['content-type']||''},body}).formData();
 const pageId=form.get('pageId')||null,auto=form.get('autoSchedule')==='true';
 if(pageId&&!one('SELECT id FROM pages WHERE id=?',pageId))throw Error('Chọn Page hợp lệ trước khi nhập.');
 if(auto&&!pageId)throw Error('Chọn Page trước khi tự xếp lịch.');
 const dir=path.join(DATA,'staging',randomUUID());mkdirSync(dir,{recursive:true});const seen=new Set();
 try {
  for(const f of form.getAll('files')){
   if(typeof f==='string')continue;
   const name=path.basename(f.name.replaceAll('\\','/'));if(name!==f.name||seen.has(name.toLowerCase()))throw Error('Tên file trùng hoặc đường dẫn không hợp lệ.');seen.add(name.toLowerCase());
   if(!/\.(mp4|txt|zip)$/i.test(name))throw Error('Chỉ hỗ trợ MP4, TXT hoặc ZIP.');
   const target=path.join(dir,name);writeFileSync(target,Buffer.from(await f.arrayBuffer()));
   if(/\.zip$/i.test(name)){
    const sub=path.join(dir,randomUUID());mkdirSync(sub);
    try{execFileSync('/usr/bin/python3',[path.join(ROOT,'unzip.py'),target,sub],{timeout:60000,stdio:['ignore','pipe','pipe']});}catch{throw Error('ZIP không hợp lệ, trùng tên hoặc vượt giới hạn giải nén 600 MB.');}
    for(const entry of readdirSync(sub)){if(existsSync(path.join(dir,entry)))throw Error('Các ZIP chứa tên file trùng nhau.');writeFileSync(path.join(dir,entry),readFileSync(path.join(sub,entry)));}
    rmSync(sub,{recursive:true});
   }
  }
  const files=readdirSync(dir), pairs=[],warnings=[],hashes=new Set();
  for(const name of files.filter(x=>/\.mp4$/i.test(x))){
   const stem=name.slice(0,-4),txt=files.find(x=>x.toLowerCase()===stem.toLowerCase()+'.txt');
   if(!txt){warnings.push(`${name}: thiếu TXT cùng tên, chưa nhập.`);continue;}
   const video=readFileSync(path.join(dir,name));if(video.length<12||!video.subarray(4,12).includes(Buffer.from('ftyp')))throw Error(`${name}: không phải MP4 hợp lệ.`);
   const h=hash(video);if(hashes.has(h)||one('SELECT id FROM assets WHERE hash=?',h)){warnings.push(`${name}: video đã tồn tại, bỏ qua bản trùng.`);continue;}
   const txtBytes=readFileSync(path.join(dir,txt));if(txtBytes.length>2*1024*1024)throw Error('TXT vượt 2 MB.');
   const parsed=parseText(txtBytes),id=randomUUID(),dest=path.join(DATA,'media',id+'.mp4');mkdirSync(path.dirname(dest),{recursive:true});
   hashes.add(h);pairs.push({id,name,h,dest,video,parsed});
  }
  for(const name of files.filter(x=>/\.txt$/i.test(x)))if(!files.some(x=>x.toLowerCase()===name.slice(0,-4).toLowerCase()+'.mp4'))warnings.push(`${name}: thiếu MP4 cùng tên.`);
  let scheduled=0;
  try{tx(()=>{for(const p of pairs){writeFileSync(p.dest,p.video,{mode:0o600});run('INSERT INTO assets(id,name,hash,file,title,content,caption,comment,created_at,page_id) VALUES(?,?,?,?,?,?,?,?,?,?)',p.id,p.name,p.h,p.dest,p.parsed.title,p.parsed.content,p.parsed.caption,p.parsed.comment,now(),pageId);}
   const ready=pairs.filter(p=>p.parsed.caption?.trim());
   if(auto&&ready.length){const plan=makePlan({pageId,assetIds:ready.map(p=>p.id),mode:'slots'});enqueue(plan);scheduled=ready.length;}
   for(const p of pairs)if(!p.parsed.caption?.trim())warnings.push(`${p.name}: đã nhập nhưng thiếu caption; chưa xếp lịch.`);
   if(pageId&&pairs.length)lowInventory(pageId);
  });}catch(e){for(const p of pairs)if(existsSync(p.dest))rmSync(p.dest);throw e;}
  return {imported:pairs.length,scheduled,warnings};
 }finally{rmSync(dir,{recursive:true,force:true});}
}
async function handle(req,res){
 const host=req.headers.host;
 if(![`127.0.0.1:${PORT}`,`localhost:${PORT}`].includes(host)){res.writeHead(403);return res.end('Local only');}
 const url=new URL(req.url,`http://${host}`),p=url.pathname;
 const reply=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 try{
  if(!['GET','HEAD'].includes(req.method)){
   if(req.headers['x-story-client']!=='publisher'||(req.headers.origin&&!['http://localhost:'+PORT,'http://127.0.0.1:'+PORT].includes(req.headers.origin)))return reply({error:'Yêu cầu không hợp lệ.'},403);
  }
  if(p==='/api/health')return reply({ok:true,service:'story-publisher'});
  if(p==='/api/state')return reply(state());
  if(p==='/api/asset-archive'&&req.method==='GET')return reply({assets:all('SELECT assets.id,assets.name,asset_archive.archived_at FROM assets JOIN asset_archive ON assets.id=asset_archive.asset_id ORDER BY assets.name')});
  if(p==='/api/asset-archive'&&req.method==='POST'){const b=await jsonBody(req);if(!['archive','restore'].includes(b.action))throw Error('Thao tác không hợp lệ.');return reply(archiveAssets(db,b.ids,b.action==='restore'));}
  if(p==='/api/research'&&req.method==='GET')return reply(dramaAgent.state(url.searchParams.get('id')));
  if(p==='/api/knowledge'&&req.method==='GET')return reply(knowledgeBase.state());
  if(p==='/api/knowledge'&&req.method==='POST'){
   const b=await jsonBody(req);if(b.action==='note')knowledgeBase.addNote(b);else if(b.action!=='refresh')throw Error('Thao tác kho kiến thức không hợp lệ.');return reply(knowledgeBase.state());
  }
  if(p==='/api/research/widget'&&req.method==='GET'){
   const report=dramaAgent.state(url.searchParams.get('id')).last?.report?.reports?.find(r=>r.market===url.searchParams.get('market'));
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src https:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; sandbox allow-popups allow-popups-to-escape-sandbox"});
   return res.end(report?.searchSuggestions||'Chưa có Google Search Suggestions.');
  }
  if(p==='/api/research'&&req.method==='POST'){
   const b=await jsonBody(req);
   if(b.action==='save'){
    if(dramaAgent.state().busy)throw Error('Chờ agent nghiên cứu xong trước khi đổi cấu hình.');
    const config=validateResearchSettings(b);
    if(b.key!==undefined&&typeof b.key!=='string')throw Error('API key không hợp lệ.');
    const key=b.key?.trim();if(key&&(key.length<15||key.length>300||/[\s\r\n]/.test(key)))throw Error('Gemini API key không hợp lệ.');
    if(config.enabled&&!(key||cfg('gemini_key')))throw Error('Nhập Gemini API key trước khi bật lịch.');
    if(config.enabled&&b.consent!==true)throw Error('Xác nhận quyền gửi dữ liệu nghiên cứu sang Google và chi phí API trước khi bật.');
    if(config.enabled&&(!cfg('telegram_token')||!cfg('telegram_chat')))throw Error('Cần kết nối Telegram trước khi bật báo cáo tự động.');
    if(key)setCfg('gemini_key',key);setCfg('gemini_research',JSON.stringify({...config,consent:b.consent===true}));return reply({ok:true});
   }
   if(b.action==='run'){
    if(researchSettings().consent!==true)throw Error('Lưu xác nhận sử dụng Gemini API trong cài đặt agent trước.');
    if(!cfg('telegram_token')||!cfg('telegram_chat'))throw Error('Kết nối Telegram trước khi chạy báo cáo.');
    dramaAgent.preflight();void dramaAgent.scan().catch(e=>console.error('Research agent failed:',safeError(e,researchSettings().key)));return reply({ok:true,busy:true});
   }
   throw Error('Thao tác nghiên cứu không hợp lệ.');
  }
  if(p==='/api/studio-bridge'&&req.method==='GET')return reply(studioBridge.status());
  if(p==='/api/studio-bridge'&&req.method==='POST'){
   const b=await jsonBody(req);
   if(b.action==='toggle'){if(!one('SELECT 1 FROM studio_links WHERE page_id=?',b.pageId))throw Error('Page chưa có ánh xạ Studio được xác nhận.');if(b.enabled)run('UPDATE studio_links SET enabled=1,after_time=? WHERE page_id=?',now(),b.pageId);else run('UPDATE studio_links SET enabled=0 WHERE page_id=?',b.pageId);return reply(studioBridge.status());}
   if(b.action==='backfill'){
    const link=one('SELECT * FROM studio_links WHERE page_id=? AND enabled=1',b.pageId);if(!link)throw Error('Bật kết nối Studio của Page trước.');
    const source=new DatabaseSync(STUDIO_DB,{readOnly:true});let batch;try{batch=source.prepare('SELECT * FROM batches WHERE id=? AND page_id=?').get(b.batchId,link.studio_page_id);}finally{source.close();}
    if(!batch||batch.status!=='completed')throw Error('Lô chưa hoàn tất hoặc không thuộc Page.');run('INSERT OR IGNORE INTO studio_bridge_batches VALUES(?,?)',batch.id,b.pageId);
   }else if(b.action!=='sync')throw Error('Thao tác Studio không hợp lệ.');
   return reply({...await studioBridge.sync(),...studioBridge.status()});
  }
  if(p==='/api/discover'&&req.method==='POST'){
   const b=await jsonBody(req);if(typeof b.token!=='string'||b.token.trim().length<10)throw Error('Nhập User Access Token của Meta.');
   for(const [key,value] of discovery)if(value.until<Date.now())discovery.delete(key);
   if(discovery.size>=5)throw Error('Có nhiều phiên kết nối đang mở. Hãy thử lại sau 10 phút.');
   const result=await new Meta(b.token.trim(),VERSION).accounts();
   const id=randomUUID();discovery.set(id,{...result,until:Date.now()+600000});setTimeout(()=>discovery.delete(id),600000).unref();
   return reply({session:id,permissions:result.permissions,truncated:result.truncated,pages:result.pages.map(x=>({id:x.id,name:x.name,tasks:x.tasks||[],available:!!x.access_token,existing:!!one('SELECT id FROM pages WHERE id=?',x.id)}))});
  }
  if(p==='/api/connect-pages'&&req.method==='POST'){
   const b=await jsonBody(req),session=discovery.get(b.session);if(!session||session.until<Date.now())throw Error('Phiên kết nối đã hết hạn. Đọc danh sách Page lại.');
   if(!countries[b.country])throw Error('Chọn quốc gia.');validateTimezone(b.zone);const slots=validateSlots(b.slots);
   const ids=[...new Set(b.ids||[])];if(!ids.length||ids.length>100)throw Error('Chọn 1–100 Page để kết nối.');
   const chosen=ids.map(id=>{const p=session.pages.find(x=>x.id===id);if(!p?.access_token)throw Error('Page chưa có token được cấp.');return p;});
   // Verify each chosen Page before committing any connection; no remote post is created.
   for(const p of chosen)await new Meta(p.access_token,VERSION).verify(p.id);
   tx(()=>{for(const p of chosen){run(`INSERT INTO pages(id,name,country,zone,slots,token,verified_at,connection_json) VALUES(?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name,token=excluded.token,verified_at=excluded.verified_at,connection_json=excluded.connection_json,connection_error=NULL`,p.id,pageDisplayName(p.id,p.name),b.country,b.zone,JSON.stringify(slots),encrypt(p.access_token,KEY),now(),JSON.stringify({tasks:p.tasks||null,scopes:session.permissions,source:'user-token',facebookName:p.name}));}});
   discovery.delete(b.session);return reply({ok:true,count:chosen.length});
  }
  if(p==='/api/reschedule'&&req.method==='POST'){
   const b=await jsonBody(req),job=one('SELECT * FROM jobs WHERE id=?',b.id),time=new Date(b.at);
   if(!job||!['scheduled','missed'].includes(job.status)||job.video_id)throw Error('Chỉ đổi giờ lịch chưa bắt đầu đăng.');
   if(!Number.isFinite(time.getTime())||time.getTime()<Date.now()+60000)throw Error('Chọn thời gian tương lai ít nhất 1 phút.');
   const page=one('SELECT * FROM pages WHERE id=?',job.page_id);
   tx(()=>{updateJob(job.id,{scheduled_at:time.toISOString(),status:'scheduled',error:null});event(job.id,'Đã đổi giờ đăng.');});return reply({ok:true});
  }
  if(p==='/api/import'&&req.method==='POST')return reply(await importFiles(req));
  if(p==='/api/page-queue'&&req.method==='POST'){
   const b=await jsonBody(req),ids=all("SELECT id FROM assets WHERE page_id=? AND TRIM(caption)!='' AND NOT EXISTS(SELECT 1 FROM jobs WHERE jobs.asset_id=assets.id AND jobs.page_id=? AND status!='cancelled') ORDER BY name",b.pageId,b.pageId).map(a=>a.id);
   if(!ids.length)throw Error('Page không có video đủ caption chưa xếp lịch.');
   tx(()=>enqueue(makePlan({pageId:b.pageId,assetIds:ids,mode:'slots'})));return reply({ok:true,count:ids.length});
  }
  if(p==='/api/publish-now'&&req.method==='POST'){
   const b=await jsonBody(req),asset=one('SELECT * FROM assets WHERE id=?',b.assetId),page=one('SELECT * FROM pages WHERE id=?',b.pageId);
   if(!asset||asset.page_id!==b.pageId||!page)throw Error('Video không thuộc Page đã chọn.');
   if(!asset.caption?.trim())throw Error('Bổ sung caption trước khi đăng ngay.');
   if(!page.enabled||!page.token||['error','permissions'].includes(connectionView(page).status))throw Error('Page chưa sẵn sàng đăng. Kiểm tra kết nối.');
   const job=one("SELECT * FROM jobs WHERE page_id=? AND asset_id=? AND status!='cancelled'",page.id,asset.id);
   if(job){if(job.status!=='scheduled'||job.video_id)throw Error('Video đã đăng/đang xử lý hoặc cần đối soát, không tạo bài trùng.');tx(()=>{updateJob(job.id,{scheduled_at:now(),title:asset.title,caption:asset.caption,comment:asset.comment});event(job.id,'Người dùng chọn đăng ngay với caption và Comment 1 vừa xác nhận.');});}
   else tx(()=>enqueue(makePlan({pageId:page.id,assetIds:[asset.id],mode:'now'})));
   return reply({ok:true});
  }
  if(p==='/api/pages'&&req.method==='POST'){
   const b=await jsonBody(req);if(!/^\d{5,30}$/.test(b.id||''))throw Error('Page ID phải là số của Page Facebook.');
   if(!countries[b.country])throw Error('Chọn quốc gia.');validateTimezone(b.zone);const slots=validateSlots(b.slots);
   const old=one('SELECT * FROM pages WHERE id=?',b.id);let token=old?.token||null,name=String(b.name||'').trim(),verified=old?.verified_at||null;
   if(b.token?.trim()){const me=await new Meta(b.token.trim(),VERSION).verify(b.id);token=encrypt(b.token.trim(),KEY);name=pageDisplayName(b.id,me.name);verified=now();}
   if(!name)throw Error('Nhập tên Page.');
   run('INSERT INTO pages(id,name,country,zone,slots,token,verified_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,country=excluded.country,zone=excluded.zone,slots=excluded.slots,token=excluded.token,verified_at=excluded.verified_at',b.id,name,b.country,b.zone,JSON.stringify(slots),token,verified);if(b.token?.trim())run("UPDATE pages SET connection_error=NULL,connection_json='{}' WHERE id=?",b.id);return reply({ok:true});
  }
  if(p==='/api/page-action'&&req.method==='POST'){
   const b=await jsonBody(req),page=one('SELECT * FROM pages WHERE id=?',b.id);if(!page)throw Error('Không tìm thấy Page.');
   if(b.action==='delete'){if(one('SELECT id FROM jobs WHERE page_id=?',b.id))throw Error('Page có lịch sử đăng. Hãy tạm dừng để giữ lịch sử.');run('DELETE FROM pages WHERE id=?',b.id);}
   else if(b.action==='toggle')run('UPDATE pages SET enabled=? WHERE id=?',page.enabled?0:1,b.id);
   else if(b.action==='verify'){if(!page.token)throw Error('Chưa có Page Access Token.');try{await new Meta(decrypt(page.token,KEY),VERSION).verify(page.id);run('UPDATE pages SET verified_at=?,connection_error=NULL WHERE id=?',now(),page.id);}catch(e){run('UPDATE pages SET connection_error=? WHERE id=?',safeError(e),page.id);throw e;}}
   else throw Error('Thao tác không hợp lệ.');return reply({ok:true});
  }
  if(p==='/api/assets'&&req.method==='POST'){
   const b=await jsonBody(req),asset=one('SELECT * FROM assets WHERE id=?',b.id);if(!asset)throw Error('Không tìm thấy file.');
   if(b.delete){if(one('SELECT id FROM jobs WHERE asset_id=?',b.id))throw Error('Video có lịch sử/lịch đăng; giữ lại để đối soát.');run('DELETE FROM assets WHERE id=?',b.id);rmSync(asset.file,{force:true});}
   else run('UPDATE assets SET title=?,caption=?,comment=? WHERE id=?',String(b.title||'').slice(0,500),String(b.caption||'').slice(0,60000),String(b.comment||'').slice(0,60000),b.id);
   return reply({ok:true});
  }
  if(p==='/api/plan'&&req.method==='POST'){const plan=makePlan(await jsonBody(req));return reply({items:plan.items});}
  if(p==='/api/schedule'&&req.method==='POST'){
   const b=await jsonBody(req),plan=makePlan(b);
   if(!plan.page.enabled)throw Error('Page đang tạm dừng.');
   if(!plan.page.token)throw Error('Hãy kết nối Page Access Token trước khi xác nhận lịch đăng.');
   const connection=connectionView(plan.page);if(['error','permissions'].includes(connection.status))throw Error('Kết nối Page có lỗi/quyền còn thiếu. Vào Kết nối để kiểm tra lại.');
   if(JSON.stringify(b.times)!==JSON.stringify(plan.items.map(x=>x.at))&&b.mode!=='now')throw Error('Lịch đã thay đổi. Bấm xem lịch dự kiến lại.');
   tx(()=>enqueue(plan));
   return reply({ok:true,count:plan.items.length});
  }
  if(p==='/api/job-action'&&req.method==='POST'){
   const b=await jsonBody(req),job=one('SELECT * FROM jobs WHERE id=?',b.id);if(!job)throw Error('Không tìm thấy lịch.');
   if(b.action==='cancel'&&['scheduled','missed'].includes(job.status))updateJob(job.id,{status:'cancelled'});
   else if(b.action==='retry'&&['failed','missed'].includes(job.status)&&!job.video_id)updateJob(job.id,{status:'scheduled',scheduled_at:now(),error:null});
   else if(b.action==='check'&&job.video_id&&!['starting','uploading','finishing'].includes(job.status))updateJob(job.id,{status:'checking',next_check:now(),error:null});
   else throw Error('Trạng thái này cần đối soát; không thể tự đăng lại vì có thể gây trùng.');return reply({ok:true});
  }
  if(p==='/api/meta-schedule'&&req.method==='POST'){
   const b=await jsonBody(req),page=one('SELECT * FROM pages WHERE id=?',b.pageId);
   if(!['1335519456320008','492636187266260'].includes(b.pageId))throw Error('Chế độ thử nghiệm chỉ bật cho Dernières Volontés và Behind Estate Gates.');
   if(!page?.enabled||!page.token)throw Error('Page chưa sẵn sàng.');
   const ids=[...new Set(b.jobIds||[])];if(!ids.length||ids.length>100)throw Error('Chọn 1–100 lịch.');
   const jobs=ids.map(id=>one('SELECT * FROM jobs WHERE id=?',id));
   if(jobs.some(j=>!j||j.page_id!==page.id||j.status!=='scheduled'||j.video_id||j.delivery_mode!=='local'||new Date(j.scheduled_at).getTime()<Date.now()+20*60000))throw Error('Chỉ chuyển lịch local chưa bắt đầu, còn ít nhất 20 phút. Không tự đổi giờ.');
   tx(()=>{for(const j of jobs){updateJob(j.id,{delivery_mode:'meta'});event(j.id,'Yêu cầu tải trước và hẹn lịch trên Meta; chưa xác nhận hẹn lịch.');}});
   return reply({ok:true,count:jobs.length});
  }
  if(p==='/api/page-reports'&&req.method==='GET')return reply(pageReports.state());
  if(p==='/api/page-reports'&&req.method==='POST'){
   if(!cfg('telegram_token')||!cfg('telegram_chat'))throw Error('Cần kết nối Telegram trước khi quét và gửi báo cáo.');
   if(pageReports.state().busy)return reply({ok:true,busy:true});
   void pageReports.scan().catch(()=>console.error('Page report failed'));
   return reply({ok:true,busy:true});
  }
  if(p==='/api/telegram'&&req.method==='POST'){
   const b=await jsonBody(req);
   if(b.action==='reuse'){
    const envPath=path.join(ROOT,'../reels-studio-v2/.env.local');const env=parseEnv(readFileSync(envPath,'utf8'));
    if(!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID)throw Error('Tool Studio chưa có cấu hình Telegram đầy đủ.');
    setCfg('telegram_token',env.TELEGRAM_BOT_TOKEN);setCfg('telegram_chat',env.TELEGRAM_CHAT_ID);
   }else if(b.action==='save'){if(!b.token||!b.chat)throw Error('Nhập Bot Token và Chat ID.');setCfg('telegram_token',b.token.trim());setCfg('telegram_chat',b.chat.trim());}
   else if(b.action==='save-summary'){setCfg('telegram_summary',JSON.stringify({enabled:b.enabled===true,slots:validateSlots(b.slots)}));}
   else if(b.action==='test'){if(!cfg('telegram_token')||!cfg('telegram_chat'))throw Error('Chưa cấu hình Telegram.');notify(randomUUID(),'✅ The Story Publisher đã kết nối. Chỉ báo đăng thành công khi Meta xác nhận xuất bản; không báo khi bấm nút hay xếp lịch.');}
   else throw Error('Thao tác không hợp lệ.');return reply({ok:true});
  }
  if(p.startsWith('/media/')){
   const asset=one('SELECT * FROM assets WHERE id=?',p.slice(7));if(!asset)return reply({error:'Không tìm thấy'},404);
   const size=statSync(asset.file).size;let start=0,end=size-1,status=200;
   if(req.headers.range){const m=req.headers.range.match(/^bytes=(\d+)-(\d*)$/);if(!m)return reply({error:'Invalid range'},416);start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;if(start>end||start>=size)return reply({error:'Invalid range'},416);status=206;}
   res.writeHead(status,{'Content-Type':'video/mp4','Content-Length':end-start+1,'Accept-Ranges':'bytes',...(status===206?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});if(req.method==='HEAD')return res.end();return createReadStream(asset.file,{start,end}).pipe(res);
  }
  if(p==='/brand-tree.png'){res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-cache'});return res.end(readFileSync(path.join(ROOT,'public/brand-tree.png')));}
  const staticFile={'/':'index.html','/app.js':'app.js','/ux.js':'ux.js','/research.js':'research.js','/time.js':'time.js','/dashboard.js':'dashboard.js','/style.css':'style.css'}[p];
  if(staticFile){res.writeHead(200,{'Content-Type':staticFile.endsWith('.html')?'text/html; charset=utf-8':staticFile.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; media-src 'self'; frame-ancestors 'none'",'Cache-Control':'no-store'});return res.end(readFileSync(path.join(ROOT,'public',staticFile)));}
  reply({error:'Không tìm thấy'},404);
 }catch(e){reply({error:safeError(e)},400);}
}
let busy=false;
async function checkJob(job,page,api){
 if(job.delivery_mode==='meta'&&Date.now()<new Date(job.scheduled_at).getTime()){
  updateJob(job.id,{next_check:new Date(Math.min(new Date(job.scheduled_at).getTime(),Date.now()+300000)).toISOString()});return;
 }
 const result=await api.status(job.video_id),status=result.status;
 if(isPublished(status)){
  const first=job.published_at||now();
  tx(()=>{updateJob(job.id,{status:'published',published_at:first,error:null});notify('published:'+job.id,`✅ The Story Publisher · Đã đăng thành công\nPage: ${page.name}\n${job.title||job.asset_id}\n${new Date(first).toLocaleString('vi-VN',{timeZone:job.zone})} (${job.zone})\nhttps://www.facebook.com/reel/${job.video_id}`);lowInventory(page.id);});
  if(job.comment?.trim()&&job.comment_state==='pending'){
   updateJob(job.id,{comment_state:'sending'});
   try{const c=await api.comment(job.video_id,job.comment);if(!c.id)throw Error('Meta chưa trả ID bình luận.');updateJob(job.id,{comment_state:'sent',comment_id:String(c.id)});}
   catch(e){updateJob(job.id,{comment_state:'review',error:'Bài đã đăng; bình luận cần kiểm tra: '+safeError(e,api.token)});event(job.id,'Bình luận cần đối soát, không gửi lại tự động.');}
  }
  return;
 }
 if(['error','upload_failed','expired'].includes(status?.video_status)||status?.publishing_phase?.publish_status==='error'){
  updateJob(job.id,{status:'review',error:'Meta báo lỗi xử lý. Kiểm tra bài/ID trước khi tạo bản mới.'});return;
 }
 if(job.attempts>=120){updateJob(job.id,{status:'review',error:'Chưa xác nhận đã đăng. Dùng Kiểm tra Meta để đối soát ID hiện có.'});return;}
 updateJob(job.id,{status:'checking',attempts:job.attempts+1,next_check:new Date(Date.now()+30000).toISOString()});
}
async function tick(){
 if(busy)return;busy=true;
 try{
  // Sleep/reboot must not dump yesterday's posts into a burst.
  run("UPDATE jobs SET status='missed',error='Quá giờ hơn 30 phút. Hãy chọn đăng lại hoặc hủy.' WHERE status='scheduled' AND page_id IN (SELECT id FROM pages WHERE enabled=1) AND scheduled_at<?",new Date(Date.now()-1800000).toISOString());
  const job=one("SELECT jobs.* FROM jobs JOIN pages ON pages.id=jobs.page_id WHERE pages.enabled=1 AND ((status='scheduled' AND (scheduled_at<=? OR jobs.delivery_mode='meta')) OR (status='checking' AND (next_check IS NULL OR next_check<=?)) OR (status='published' AND comment_state='pending' AND TRIM(comment)!='')) ORDER BY CASE WHEN status='scheduled' AND scheduled_at<=? THEN 0 ELSE 1 END,COALESCE(next_check,scheduled_at) LIMIT 1",now(),now(),now());
  if(!job)return;
  const page=one('SELECT * FROM pages WHERE id=?',job.page_id);if(!page.token){updateJob(job.id,{status:'failed',error:'Chưa kết nối Page.'});return;}
  const token=decrypt(page.token,KEY),api=new Meta(token,VERSION);
  try{
   if(['checking','published'].includes(job.status)){await checkJob(job,page,api);return;}
   const asset=one('SELECT * FROM assets WHERE id=?',job.asset_id);if(!existsSync(asset.file))throw Error('File video không còn trên máy.');
   if(!run("UPDATE jobs SET status='starting' WHERE id=? AND status='scheduled'",job.id).changes)return;
   if(job.delivery_mode==='meta'){
    await uploadScheduledReel({job,page,asset,api,update:fields=>updateJob(job.id,fields),event:message=>event(job.id,message)});return;
   }
   const session=await api.start(page.id);
   if(!/^\d+$/.test(String(session.video_id||'')))throw Error('Meta chưa trả video ID.');
   updateJob(job.id,{video_id:String(session.video_id),status:'uploading'});
   const uploaded=await api.upload(session.upload_url,asset.file);if(!uploaded.success)throw Error('Meta chưa xác nhận nhận file.');
   updateJob(job.id,{status:'finishing'});
   const finished=await api.finish(page.id,session.video_id,job.title,job.caption);if(!finished.success)throw Error('Meta chưa xác nhận bước hoàn tất.');
   updateJob(job.id,{status:'checking',next_check:now(),error:null});event(job.id,'Đã gửi video; đang đợi Meta xác nhận đã xuất bản.');
  }catch(e){
   const current=one('SELECT * FROM jobs WHERE id=?',job.id);
   if(job.delivery_mode==='meta'&&job.status==='scheduled')updateJob(job.id,{status:'review',error:safeError(e,token),next_check:null});
   else if(['checking','published'].includes(job.status)&&job.attempts<120)updateJob(job.id,{status:'checking',attempts:job.attempts+1,next_check:new Date(Date.now()+60000).toISOString(),error:safeError(e,token)});
   else updateJob(job.id,{status:current.video_id?'checking':'review',next_check:new Date(Date.now()+60000).toISOString(),error:safeError(e,token)});
   if(isMetaAuthError(e)){run('UPDATE pages SET enabled=0,connection_error=? WHERE id=?',safeError(e,token),page.id);event(job.id,'Tạm dừng Page: kiểm tra token/quyền Meta, sau đó bật lại.');}
  }
 }finally{busy=false;}
}
let telegramBusy=false;
async function telegramTick(){
 if(telegramBusy)return;const token=cfg('telegram_token'),chat=cfg('telegram_chat');if(!token||!chat)return;
 telegramBusy=true;
 try{
  const item=one("SELECT * FROM outbox WHERE status='pending' AND (next_try IS NULL OR next_try<=?) ORDER BY rowid LIMIT 1",now());if(!item)return;
  run("UPDATE outbox SET status='sending',attempts=attempts+1 WHERE id=?",item.id);
  try{
   const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text:item.text,disable_web_page_preview:true}),signal:AbortSignal.timeout(15000)}),b=await r.json();
   if(!r.ok||!b.ok){const e=Error(b.description||'Telegram lỗi');e.retry=b.parameters?.retry_after;e.permanent=[400,401,403,404].includes(r.status);throw e;}
   run("UPDATE outbox SET status='sent',error=NULL WHERE id=?",item.id);
  }catch(e){run('UPDATE outbox SET status=?,error=?,next_try=? WHERE id=?',e.permanent?'failed':'pending',safeError(e,token),new Date(Date.now()+Math.max(e.retry||0,Math.min(900,30*2**Math.min(item.attempts,5)))*1000).toISOString(),item.id);}
 }finally{telegramBusy=false;}
}
const server=http.createServer((req,res)=>{handle(req,res).catch(()=>{if(!res.headersSent)res.writeHead(500);res.end('Internal error');});});
const STUDIO_DB=path.join(ROOT,'../reels-studio-v2/data/reels_studio.db');
const studioBridge=createStudioBridge({db,studioDb:STUDIO_DB,renderRoot:path.join(ROOT,'../reels-studio-v2/public/renders'),dataRoot:DATA,enqueue:plan=>{enqueue(plan);lowInventory(plan.page.id);},makePlan});
setInterval(()=>studioBridge.sync().catch(()=>console.error('Studio bridge error; will retry')),10000);
server.requestTimeout=120000;
server.listen(PORT,'127.0.0.1',()=>console.log(`The Story Publisher: http://localhost:${PORT}`));
const operationsTick=createOperationsMonitor({db,notify,probe:async()=>{await fetch('https://graph.facebook.com/',{signal:AbortSignal.timeout(10000)});}});
setTimeout(()=>operationsTick().catch(()=>console.error('Operations monitor failed; will retry')),2500);
setInterval(()=>operationsTick().catch(()=>console.error('Operations monitor failed; will retry')),60000);
setInterval(()=>tick().catch(()=>console.error('Worker error; will retry')),5000);
setInterval(()=>telegramTick().catch(()=>console.error('Telegram worker error')),5000);
const summaryTick=createTelegramSummary({db,settings:summarySettings,notify});
const dramaAgent=createDramaAgent({db,settings:researchSettings,apiFor:c=>new GeminiResearch(c.key,c.model),notify});
const knowledgeBase=createKnowledgeBase({db,directory:path.join(DATA,'knowledge_base')});knowledgeBase.refresh();
setInterval(()=>{try{knowledgeBase.refresh();}catch{console.error('Shared editorial memory refresh failed');}},30000);
setInterval(()=>dramaAgent.tick().catch(()=>console.error('Research agent schedule failed')),30000);
const pageReports=createPageReports({db,apiFor:p=>new Meta(decrypt(p.token,KEY),VERSION),notify});
setInterval(()=>pageReports.tick().catch(()=>console.error('Daily Page report failed')),30000);
setInterval(()=>{try{summaryTick();}catch{console.error('Telegram summary error; will retry');}},30000);
// All-Page hourly threshold scans supersede the old per-job 10-minute monitor.
setTimeout(()=>pageReports.tick().catch(()=>console.error('Hourly Page threshold check failed')),1500);
