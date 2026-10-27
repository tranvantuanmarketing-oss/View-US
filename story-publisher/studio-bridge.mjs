import {DatabaseSync} from 'node:sqlite';
import {realpathSync,readFileSync,copyFileSync,mkdirSync,existsSync,rmSync} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {hash,safeError} from './core.mjs';
import {migrateAssetArchive} from './asset-archive.mjs';
export const studioPages={
 '104625669131300':'page_1792940301225','664859260049031':'page_1792940311463',
 '862640380267439':'page_1792940322880','783405241533648':'page_1792940331614','107489462228044':'page_1792940341991'
};
export const additionalStudioPages=[
 {name:'Behind Estate Gates',country:'GB',studioId:'page_1792575266027'},
 {name:'Dernières Volontés',country:'FR',studioId:'page_1792740207912'},
 {name:'Masques Tombés',country:'FR',studioId:'page_de_01'},
 {name:'Cienie Spadku',country:'PL',studioId:'page_1792904020605'}
];
export function registerAdditionalStudioPages(db,source,at){
 for(const mapping of additionalStudioPages){
  const matches=db.prepare('SELECT * FROM pages').all().filter(p=>p.name.normalize('NFC')===mapping.name.normalize('NFC')&&p.country===mapping.country);
  const studio=source.prepare('SELECT id,name FROM pages WHERE id=?').get(mapping.studioId);
  if(matches.length!==1||studio?.name.normalize('NFC')!==mapping.name.normalize('NFC'))continue;
  db.prepare('INSERT OR IGNORE INTO studio_links(page_id,studio_page_id,after_time) VALUES(?,?,?)').run(matches[0].id,mapping.studioId,at);
 }
}
export function studioLocaleMatches(country,locale){
 const language={PL:'pl',FR:'fr',NL:'nl',GB:'en',US:'en',DE:'de',VN:'vi',AU:'en',CA:'en'}[country];
 return !!language&&String(locale||'').toLowerCase().split(/[-_]/)[0]===language;
}
export function migrateStudioBridge(db){migrateAssetArchive(db);db.exec(`CREATE TABLE IF NOT EXISTS studio_links(page_id TEXT PRIMARY KEY,studio_page_id TEXT UNIQUE NOT NULL,enabled INTEGER DEFAULT 1,after_time TEXT NOT NULL,last_sync TEXT,error TEXT);
 CREATE TABLE IF NOT EXISTS studio_bridge_batches(batch_id TEXT PRIMARY KEY,page_id TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS studio_bridge_items(item_id TEXT PRIMARY KEY,batch_id TEXT NOT NULL,page_id TEXT NOT NULL,asset_id TEXT NOT NULL,imported_at TEXT NOT NULL);`);}
export function createStudioBridge({db,studioDb,renderRoot,dataRoot,enqueue,makePlan,clock=()=>new Date()}){
 let busy=false;
 function status(){return {available:existsSync(studioDb),links:db.prepare('SELECT studio_links.*,pages.name,(SELECT COUNT(*) FROM studio_bridge_items WHERE page_id=studio_links.page_id) AS imported FROM studio_links JOIN pages ON pages.id=studio_links.page_id ORDER BY pages.name').all()};}
 async function sync(){
  if(busy)return {busy:true,imported:0};busy=true;let source,total=0;
  try{
   if(!existsSync(studioDb))return {imported:0,unavailable:true};
   source=new DatabaseSync(studioDb,{readOnly:true});
   registerAdditionalStudioPages(db,source,clock().toISOString());
   for(const link of db.prepare('SELECT * FROM studio_links WHERE enabled=1').all()){
    let copied=[];
    try{
     const page=db.prepare('SELECT * FROM pages WHERE id=?').get(link.page_id),sp=source.prepare('SELECT * FROM pages WHERE id=?').get(link.studio_page_id);
     if(!page||!sp||page.name.normalize('NFC')!==sp.name.normalize('NFC'))throw Error('Tên Page hai tool không khớp; dừng chuyển để tránh nhầm Page.');
     const batches=source.prepare("SELECT * FROM batches WHERE page_id=? AND status='completed' ORDER BY created_at,id").all(sp.id);
     for(const batch of batches){
      if(batch.created_at<link.after_time&&!db.prepare('SELECT 1 FROM studio_bridge_batches WHERE batch_id=? AND page_id=?').get(batch.id,page.id))continue;
      const items=source.prepare('SELECT * FROM batch_items WHERE batch_id=? ORDER BY seq').all(batch.id);
      if(items.length!==batch.count||items.some(i=>i.status!=='completed'))continue;
      const pending=items.filter(i=>!db.prepare('SELECT 1 FROM studio_bridge_items WHERE item_id=?').get(i.id));if(!pending.length)continue;
      const ready=pending.map(i=>{
       const payload=JSON.parse(i.story_payload_json),root=realpathSync(renderRoot)+path.sep,file=realpathSync(i.output_path);
       if(!file.startsWith(root)||!file.endsWith('.mp4'))throw Error('File render nằm ngoài thư mục Studio được phép.');
       if(!payload.caption?.trim())throw Error(`Video #${i.seq} thiếu caption; chưa chuyển lô.`);
       if(!studioLocaleMatches(page.country||'PL',payload.locale||sp.locale))throw Error('Ngôn ngữ video không khớp quốc gia Page; chưa chuyển lô.');
       const bytes=readFileSync(file);if(bytes.length<12||!bytes.subarray(4,12).includes(Buffer.from('ftyp')))throw Error('File render không phải MP4 hợp lệ.');
       return {item:i,payload,file,hash:hash(bytes)};
      });
      db.exec('BEGIN IMMEDIATE');copied=[];
      try{
       const ids=[];
       for(const r of ready){
        let asset=db.prepare('SELECT * FROM assets WHERE hash=?').get(r.hash);
        if(asset?.page_id&&asset.page_id!==page.id)throw Error('Video trùng đã thuộc Page khác; không chuyển chéo.');
        if(!asset){const id=randomUUID(),dest=path.join(dataRoot,'media',id+'.mp4');mkdirSync(path.dirname(dest),{recursive:true,mode:0o700});copyFileSync(r.file,dest);copied.push(dest);db.prepare('INSERT INTO assets(id,name,hash,file,title,content,caption,comment,created_at,page_id) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,`${page.name.replace(/[^\p{L}\p{N}]+/gu,'_')}_${batch.id}_${String(r.item.seq).padStart(3,'0')}.mp4`,r.hash,dest,r.payload.title||'',r.payload.content||'',r.payload.caption,r.payload.comment1||'',clock().toISOString(),page.id);asset={id};}
        else if(!asset.page_id)db.prepare('UPDATE assets SET page_id=? WHERE id=?').run(page.id,asset.id);
        db.prepare('DELETE FROM asset_archive WHERE asset_id=?').run(asset.id);
        db.prepare('INSERT INTO studio_bridge_items VALUES(?,?,?,?,?)').run(r.item.id,batch.id,page.id,asset.id,clock().toISOString());
        if(!db.prepare("SELECT 1 FROM jobs WHERE page_id=? AND asset_id=? AND status!='cancelled'").get(page.id,asset.id)&&!ids.includes(asset.id))ids.push(asset.id);
       }
       if(ids.length)enqueue(makePlan({pageId:page.id,assetIds:ids,mode:'slots'}));
       db.exec('COMMIT');total+=ready.length;copied=[];
      }catch(e){db.exec('ROLLBACK');for(const f of copied)rmSync(f,{force:true});copied=[];throw e;}
     }
     db.prepare('UPDATE studio_links SET last_sync=?,error=NULL WHERE page_id=?').run(clock().toISOString(),page.id);
    }catch(e){db.prepare('UPDATE studio_links SET last_sync=?,error=? WHERE page_id=?').run(clock().toISOString(),safeError(e),link.page_id);}
   }
   return {imported:total};
  }finally{source?.close();busy=false;}
 }
 return {sync,status};
}
