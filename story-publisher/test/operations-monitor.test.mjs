import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createOperationsMonitor} from '../operations-monitor.mjs';
test('network recovery, job alerts and restart gap persist without duplicate job alerts',async()=>{
 const db=new DatabaseSync(':memory:');
 db.exec(`CREATE TABLE pages(id TEXT,name TEXT,enabled INTEGER,connection_error TEXT);CREATE TABLE jobs(id TEXT,page_id TEXT,asset_id TEXT,title TEXT,status TEXT,comment_state TEXT,error TEXT,scheduled_at TEXT,video_id TEXT);INSERT INTO pages VALUES('p','Page test',1,NULL);INSERT INTO jobs VALUES('j','p','a','Video test','review','pending','Need review','2026-10-26T00:00:00Z',NULL)`);
 let time=new Date('2026-10-26T01:00:00Z'),online=false;const messages=[];
 const options={db,clock:()=>time,notify:(id,text)=>messages.push({id,text}),probe:async()=>{if(!online)throw Error('offline');}};
 try{
  let tick=createOperationsMonitor(options);await tick();assert.equal(messages.length,3);
  await tick();assert.equal(messages.length,3);
  online=true;time=new Date('2026-10-26T01:01:00Z');await tick();assert.equal(messages.length,4);assert.match(messages.at(-1).text,/trở lại/);
  time=new Date('2026-10-26T01:06:00Z');tick=createOperationsMonitor(options);await tick();assert.equal(messages.length,6);assert.match(messages.at(-2).text,/gián đoạn/);
  assert.equal(db.prepare('SELECT status FROM jobs').get().status,'review');
 }finally{db.close();}
});
