import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';import path from 'node:path';import {tmpdir} from 'node:os';
import {migrateStudioBridge,createStudioBridge,studioLocaleMatches,registerAdditionalStudioPages,additionalStudioPages} from '../studio-bridge.mjs';
test('Multi-country bridge accepts French, Polish and English without cross-language transfer',()=>{
 for(const [country,locale]of [['FR','fr-FR'],['PL','pl'],['GB','en-GB']])assert(studioLocaleMatches(country,locale));
 assert.equal(studioLocaleMatches('FR','pl'),false);assert.equal(studioLocaleMatches('GB','fr'),false);assert.equal(studioLocaleMatches('XX','en'),false);
});
test('Four new Page links require exact identities and country, retain cutoff and manual switches',()=>{
 const db=new DatabaseSync(':memory:'),source=new DatabaseSync(':memory:');
 try{db.exec('CREATE TABLE pages(id TEXT,name TEXT,country TEXT)');source.exec('CREATE TABLE pages(id TEXT,name TEXT)');migrateStudioBridge(db);
 for(const [i,m]of additionalStudioPages.entries()){db.prepare('INSERT INTO pages VALUES(?,?,?)').run('fb'+i,m.name,m.country);source.prepare('INSERT INTO pages VALUES(?,?)').run(m.studioId,m.name);}
 registerAdditionalStudioPages(db,source,'2026-10-26T00:00:00Z');assert.equal(db.prepare('SELECT COUNT(*) n FROM studio_links').get().n,4);
 db.exec('UPDATE studio_links SET enabled=0');registerAdditionalStudioPages(db,source,'2026-10-27T00:00:00Z');assert(db.prepare('SELECT * FROM studio_links').all().every(x=>x.enabled===0&&x.after_time==='2026-10-26T00:00:00Z'));
 }finally{db.close();source.close();}
});
function fixture(){
 const dir=mkdtempSync(path.join(tmpdir(),'studio-bridge-')),renders=path.join(dir,'renders');mkdirSync(renders);const file=path.join(dir,'studio.db'),s=new DatabaseSync(file),db=new DatabaseSync(':memory:');
 s.exec("CREATE TABLE pages(id TEXT,name TEXT,locale TEXT);CREATE TABLE batches(id TEXT,page_id TEXT,status TEXT,count INTEGER,created_at TEXT);CREATE TABLE batch_items(id TEXT,batch_id TEXT,seq INTEGER,status TEXT,output_path TEXT,story_payload_json TEXT);INSERT INTO pages VALUES('sp','Ukryty Testament','pl');INSERT INTO pages VALUES('manual','Manual Page','en');");
 db.exec("CREATE TABLE pages(id TEXT,name TEXT);INSERT INTO pages VALUES('fb','Ukryty Testament');CREATE TABLE assets(id TEXT,name TEXT,hash TEXT UNIQUE,file TEXT,title TEXT,content TEXT,caption TEXT,comment TEXT,created_at TEXT,page_id TEXT);CREATE TABLE jobs(page_id TEXT,asset_id TEXT,status TEXT); ");migrateStudioBridge(db);db.prepare('INSERT INTO studio_links(page_id,studio_page_id,after_time) VALUES(?,?,?)').run('fb','sp','2026-10-25T12:00:00Z');
 const queued=[];let reject=false;
 const options={db,studioDb:file,renderRoot:renders,dataRoot:path.join(dir,'publisher'),makePlan:x=>x,enqueue:p=>{if(reject)throw Error('No token');queued.push(p);for(const assetId of p.assetIds)db.prepare('INSERT INTO jobs VALUES(?,?,?)').run(p.pageId,assetId,'scheduled');}};
 function batch(id,page='sp',created='2026-10-25T13:00:00Z',status='completed',count=2){s.prepare('INSERT INTO batches VALUES(?,?,?,?,?)').run(id,page,status,count,created);for(let n=count;n>=1;n--){const out=path.join(renders,id+'_'+n+'.mp4');writeFileSync(out,Buffer.concat([Buffer.from([0,0,0,24]),Buffer.from('ftypisom'),Buffer.from(id+':'+n)]));s.prepare('INSERT INTO batch_items VALUES(?,?,?,?,?,?)').run(id+'_'+n,id,n,'completed',out,JSON.stringify({title:'Story '+n,content:'Nội dung',caption:'Caption '+n,comment1:'CZĘŚĆ 2: Unicode ✓',locale:'pl'}));}}
 return {s,db,batch,queued,options,reject:()=>reject=true,close(){s.close();db.close();rmSync(dir,{recursive:true});}};
}
test('Studio bridge maps exact Page, imports completed batch in order, preserves metadata and deduplicates restart',async()=>{
 const f=fixture();try{f.batch('new');f.batch('manual','manual');f.batch('old','sp','2026-10-24T00:00:00Z');f.batch('running','sp',undefined,'running');let b=createStudioBridge(f.options);assert.equal((await b.sync()).imported,2);const a=f.db.prepare('SELECT * FROM assets ORDER BY name').all();assert.equal(a.length,2);assert.equal(a[0].title,'Story 1');assert.equal(a[0].comment,'CZĘŚĆ 2: Unicode ✓');assert.equal(a[0].page_id,'fb');assert.equal(f.queued.length,1);assert.deepEqual(f.queued[0].assetIds,a.map(a=>a.id));b=createStudioBridge(f.options);assert.equal((await b.sync()).imported,0);assert.equal(f.queued.length,1);assert.equal(b.status().links[0].imported,2);}finally{f.close();}
});
test('French and UK batches transfer metadata and schedule; mismatched language transfers nothing',async()=>{
 for(const [country,locale]of [['FR','fr'],['GB','en-GB']]){
  const f=fixture();try{
   f.db.exec(`ALTER TABLE pages ADD COLUMN country TEXT`);f.db.prepare('UPDATE pages SET country=?').run(country);f.batch('new');
   for(const row of f.s.prepare('SELECT id,story_payload_json FROM batch_items').all()){const payload=JSON.parse(row.story_payload_json);payload.locale=locale;f.s.prepare('UPDATE batch_items SET story_payload_json=? WHERE id=?').run(JSON.stringify(payload),row.id);}
   const bridge=createStudioBridge(f.options);assert.equal((await bridge.sync()).imported,2);assert.equal(f.queued.length,1);assert.equal((await bridge.sync()).imported,0);
   f.batch('wrong');assert.equal((await bridge.sync()).imported,0);assert.match(bridge.status().links[0].error,/Ngôn ngữ/);assert.equal(f.db.prepare('SELECT COUNT(*) n FROM assets').get().n,2);
  }finally{f.close();}
 }
});
test('Explicit backfill permits only selected old batch; disabled link leaves manual gen untouched',async()=>{
 const f=fixture();try{f.batch('old','sp','2026-10-24T00:00:00Z');const b=createStudioBridge(f.options);assert.equal((await b.sync()).imported,0);f.db.prepare('INSERT INTO studio_bridge_batches VALUES(?,?)').run('old','fb');f.db.exec('UPDATE studio_links SET enabled=0');assert.equal((await b.sync()).imported,0);f.db.exec('UPDATE studio_links SET enabled=1');assert.equal((await b.sync()).imported,2);}finally{f.close();}
});
test('Wrong Page name or missing caption blocks entire batch without altering Studio',async()=>{
 const f=fixture();try{f.batch('new');const b=createStudioBridge(f.options);f.db.exec("UPDATE pages SET name='Wrong'");assert.equal((await b.sync()).imported,0);assert.match(b.status().links[0].error,/khớp/);f.db.exec("UPDATE pages SET name='Ukryty Testament'");f.s.prepare('UPDATE batch_items SET story_payload_json=? WHERE id=?').run(JSON.stringify({locale:'pl'}),'new_2');assert.equal((await b.sync()).imported,0);assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM assets').get().n,0);assert.equal(f.s.prepare('SELECT COUNT(*) AS n FROM batch_items').get().n,2);}finally{f.close();}
});
test('Scheduling failure rolls back media ownership and transfer markers, retries safely',async()=>{
 const f=fixture();try{f.batch('new');f.reject();const b=createStudioBridge(f.options);assert.equal((await b.sync()).imported,0);assert.match(b.status().links[0].error,/No token/);assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM studio_bridge_items').get().n,0);assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM assets').get().n,0);}finally{f.close();}
});
test('Two remaining pilot Pages import separate complete batches and queue only their own videos',async()=>{
 const f=fixture();try{
  const pages=[['862640380267439','page_1792940322880','Sekrety Rodziny'],['107489462228044','page_1792940341991','Gorzkie Dziedzictwo']];
  for(const [fb,studio,name]of pages){f.db.prepare('INSERT INTO pages VALUES(?,?)').run(fb,name);f.s.prepare('INSERT INTO pages VALUES(?,?,?)').run(studio,name,'pl');f.db.prepare('INSERT INTO studio_links(page_id,studio_page_id,after_time) VALUES(?,?,?)').run(fb,studio,'2026-10-25T12:00:00Z');f.batch('batch_'+fb,studio);}
  const bridge=createStudioBridge(f.options);assert.equal((await bridge.sync()).imported,4);
  for(const [fb,,name]of pages){const assets=f.db.prepare('SELECT * FROM assets WHERE page_id=?').all(fb);assert.equal(assets.length,2);assert(assets.every(a=>a.name.startsWith(name.replace(/[^\p{L}\p{N}]+/gu,'_'))));const jobIds=f.db.prepare('SELECT asset_id FROM jobs WHERE page_id=?').all(fb).map(j=>j.asset_id).sort();assert.deepEqual(jobIds,assets.map(a=>a.id).sort());}
  assert.equal((await bridge.sync()).imported,0);assert.equal(f.queued.length,2);
 }finally{f.close();}
});
