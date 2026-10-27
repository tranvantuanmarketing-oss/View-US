import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
import {isMetaAuthError,connectionView} from '../connections.mjs';import {createOperationsMonitor} from '../operations-monitor.mjs';
test('real impersonation error requests reconnect; network errors do not',()=>{
 assert.equal(isMetaAuthError({code:190}),true);assert.equal(isMetaAuthError('Any of the pages_read_engagement permission(s) must be granted before impersonating a user page.'),true);assert.equal(isMetaAuthError('fetch failed'),false);
 assert.doesNotThrow(()=>connectionView({connection_json:'broken'}));
});
test('auth incidents are grouped, deduplicated over restart and do not hide unrelated failures',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(`CREATE TABLE pages(id TEXT,name TEXT,enabled INTEGER,connection_error TEXT);CREATE TABLE jobs(id TEXT,page_id TEXT,asset_id TEXT,title TEXT,status TEXT,comment_state TEXT,error TEXT,scheduled_at TEXT,video_id TEXT);INSERT INTO pages VALUES('p','Page',0,'Token invalid before impersonating'),('q','Other',1,NULL);INSERT INTO jobs VALUES('a','p','asset','A','review','pending','auth','2026-10-26T00:00:00Z',NULL),('b','p','asset2','B','missed','pending','late','2026-10-26T00:00:00Z',NULL),('c','q','asset3','C','review','pending','missing file','2026-10-26T00:00:00Z',NULL)`);
 const messages=[],o={db,notify:(id,text)=>messages.push({id,text}),probe:async()=>{},clock:()=>new Date('2026-10-27T00:00:00Z')};
 try{let tick=createOperationsMonitor(o);await tick();await tick();assert.equal(messages.filter(x=>x.id.startsWith('ops:auth:')).length,1);assert.equal(messages.filter(x=>x.id.startsWith('ops:job:')).length,1);tick=createOperationsMonitor(o);await tick();assert.equal(messages.filter(x=>x.id.startsWith('ops:auth:')).length,1);}finally{db.close();}
});
