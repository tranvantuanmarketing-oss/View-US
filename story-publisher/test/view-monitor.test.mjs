import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
import {migrateViewMonitor,createViewMonitor} from '../view-monitor.mjs';import {Meta} from '../meta.mjs';
function fixture(){const db=new DatabaseSync(':memory:');db.exec(`CREATE TABLE pages(id TEXT PRIMARY KEY,name TEXT,token TEXT);CREATE TABLE jobs(id TEXT PRIMARY KEY,page_id TEXT,asset_id TEXT,status TEXT,video_id TEXT,title TEXT);CREATE TABLE outbox(id TEXT PRIMARY KEY,text TEXT,next_try TEXT,status TEXT DEFAULT 'pending');INSERT INTO pages VALUES('p1','Page Ba Lan','encrypted');INSERT INTO pages VALUES('p2','Page thứ hai','encrypted');INSERT INTO jobs VALUES('j1','p1','a1','published','123','Truyện 1');INSERT INTO jobs VALUES('j2','p2','a2','published','456','Truyện 2');INSERT INTO jobs VALUES('j3','p1','a3','scheduled',NULL,'Chưa đăng');`);migrateViewMonitor(db);return db;}
test('1k alerts cover every Page, only published videos, persist once across restarts',async()=>{
 const db=fixture();let count=999,time=new Date('2026-10-25T16:00:00Z'),calls=0;
 const opts={db,clock:()=>time,apiFor:()=>({views:async()=>{calls++;return count;}})};
 try{let tick=createViewMonitor(opts);await tick();assert.equal(calls,2);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM outbox').get().n,0);
 count=1000;time=new Date(time.getTime()+600001);await tick();const messages=db.prepare('SELECT * FROM outbox').all();assert.equal(messages.length,2);assert.match(messages[0].text,/Page Ba Lan/);assert.match(messages[0].text,/LÀM LINK/);assert.match(messages[0].text,/facebook.com\/reel\/123/);assert.equal(db.prepare("SELECT view_count FROM jobs WHERE id='j1'").get().view_count,1000);
 tick=createViewMonitor(opts);count=2000;time=new Date(time.getTime()+86400000);await tick();assert.equal(calls,4);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM outbox').get().n,2);
 }finally{db.close();}
});
test('API errors are visible, do not fabricate zero/views or alert; back off and recover',async()=>{
 const db=fixture();let time=new Date('2026-10-25T16:00:00Z'),error=true;
 try{const tick=createViewMonitor({db,clock:()=>time,apiFor:()=>({token:'secret',views:async()=>{if(error)throw Error('permission missing secret');return 1500;}})});await tick();const row=db.prepare("SELECT * FROM jobs WHERE id='j1'").get();assert.equal(row.view_count,null);assert.match(row.views_error,/permission missing \[secret\]/);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM outbox').get().n,0);error=false;time=new Date(time.getTime()+3600001);await tick();assert.equal(db.prepare('SELECT COUNT(*) AS n FROM outbox').get().n,2);}finally{db.close();}
});
test('views adapter accepts real numeric zero and rejects missing, malformed or negative metrics',async()=>{
 for(const value of [undefined,'1000',-1,null]){const api=new Meta('x','v26.0',async()=>new Response(JSON.stringify({views:value})));await assert.rejects(api.views('123'));}
 const api=new Meta('x','v26.0',async()=>new Response('{"views":0}'));assert.equal(await api.views('123'),0);
});
