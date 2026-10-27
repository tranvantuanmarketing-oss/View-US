import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('HTTP import → Page → confirmed schedule → real adapter mock → published + comment + Telegram; no duplicate', {timeout:90000},async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'publisher-test-')),trace=path.join(dir,'trace.jsonl');
 const port=31339,base=`http://127.0.0.1:${port}`;
 const child=spawn(process.execPath,['test/mock-server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port),PUBLISHER_DATA:dir,TRACE_FILE:trace},stdio:['ignore','pipe','pipe']});
 let errors='';child.stderr.on('data',x=>errors+=x);child.stdout.resume();
 const api=async(route,body)=>{const r=await fetch(base+route,body===undefined?{}:{method:'POST',headers:{'X-Story-Client':'publisher',...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body instanceof FormData?body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
 try{
 let ready=false;for(let i=0;i<40;i++){try{if((await api('/api/health')).body.ok){ready=true;break;}}catch{}await sleep(100);}assert.ok(ready,errors);
 const denied=await fetch(base+'/api/pages',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,403);
 const mp4=Buffer.concat([Buffer.from([0,0,0,24]),Buffer.from('ftypisom'),Buffer.alloc(40)]),form=new FormData();form.append('files',new Blob([mp4]),'example.mp4');form.append('files',new Blob(['Title: QA\nContent:\nStory\nCaption:\nCaption one\nComment 1:\nComment one']),'example.txt');
 let r=await api('/api/import',form);assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.body.imported,1);
 r=await api('/api/import',form);assert.equal(r.body.imported,0);assert.match(r.body.warnings[0],/trùng/);
 r=await api('/api/pages',{id:'123456789',name:'QA',country:'US',zone:'America/New_York',slots:['19:00'],token:'fake-token'});assert.equal(r.status,200,JSON.stringify(r));
 let s=(await api('/api/state')).body;assert.ok(!JSON.stringify(s).includes('fake-token'));assert.equal(s.pages[0].name,'QA Page');
 const asset=s.assets[0];assert.equal(asset.caption,'Caption one');
 const discovered=await api('/api/discover',{token:'fake-user-access-token'});assert.equal(discovered.status,200);assert.equal(discovered.body.pages.length,1);assert.ok(!JSON.stringify(discovered.body).includes('discovered-page-secret'));
 assert.equal((await api('/api/connect-pages',{session:discovered.body.session,ids:['unknown'],country:'FR',zone:'Europe/Paris',slots:['12:00']})).status,400);
 assert.equal((await api('/api/connect-pages',{session:discovered.body.session,ids:['123456789'],country:'FR',zone:'Europe/Paris',slots:['12:00']})).status,200);
 s=(await api('/api/state')).body;assert.equal(s.pages[0].zone,'America/New_York');assert.equal(s.pages[0].connection.canCreate,true);assert.equal(s.pages[0].connection.commentPermission,true);assert.ok(!JSON.stringify(s).includes('discovered-page-secret'));
 const future={pageId:'123456789',assetIds:[asset.id],mode:'manual',at:new Date(Date.now()+3600000).toISOString()};
 const planned=(await api('/api/plan',future)).body;
 assert.equal((await api('/api/schedule',{...future,times:planned.items.map(x=>x.at)})).status,200);
 let scheduled=(await api('/api/state')).body.jobs[0];
 const beforePublish=readFileSync(trace,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
 assert.equal(beforePublish.filter(x=>x.form?.upload_phase==='start').length,0,'Future local slot must not upload or schedule a Reel on Meta');
 assert.equal((await api('/api/reschedule',{id:scheduled.id,at:new Date(Date.now()-1000).toISOString()})).status,400);
 const nextTime=new Date(Date.now()+7200000).toISOString();assert.equal((await api('/api/reschedule',{id:scheduled.id,at:nextTime})).status,200);
 assert.equal((await api('/api/state')).body.jobs[0].scheduled_at,nextTime);
 assert.equal((await api('/api/state')).body.notifications.length,0,'Scheduling and changing time must not notify Telegram');
 assert.equal((await api('/api/job-action',{id:scheduled.id,action:'cancel'})).status,200);
 
 await api('/api/telegram',{action:'save',token:'test-bot',chat:'test-chat'});
 assert.equal((await api('/api/telegram',{action:'save-summary',enabled:false,slots:['09:15','21:30']})).status,200);
 const summary=(await api('/api/state')).body.telegramSummary;assert.equal(summary.enabled,false);assert.deepEqual(summary.slots,['09:15','21:30']);
 assert.equal((await api('/api/telegram',{action:'save-summary',enabled:true,slots:['12:60']})).status,400);
 const request={pageId:'123456789',assetIds:[asset.id],mode:'now'};
 assert.equal((await api('/api/plan',request)).body.items.length,1);
 assert.equal((await api('/api/schedule',{...future,times:planned.items.map(x=>x.at)})).status,200);
 assert.equal((await api('/api/state')).body.jobs.length,1,'Cancelled reservation is reused without duplicate history');
 assert.equal((await api('/api/publish-now',{assetId:asset.id,pageId:'123456789'})).status,200);
 assert.equal((await api('/api/schedule',request)).status,400);
 let sawPending=false,published=false;
 for(let i=0;i<100;i++){s=(await api('/api/state')).body;if(s.jobs[0].status==='checking')sawPending=true;if(s.jobs[0].status==='published'&&s.jobs[0].comment_state==='sent'&&s.notifications.filter(x=>x.status==='sent').length>=2){published=true;break;}await sleep(600);}
 assert.ok(sawPending,'Must wait for published status, not assume upload success');assert.ok(published,JSON.stringify(s.jobs));
 const calls=readFileSync(trace,'utf8').trim().split('\n').map(JSON.parse);assert.equal(calls.filter(x=>x.form.upload_phase==='start').length,1);assert.equal(calls.filter(x=>x.form.upload_phase==='finish').length,1);assert.equal(calls.filter(x=>x.path.endsWith('/comments')).length,1);
 const publishCall=calls.find(x=>x.form.upload_phase==='finish');assert.equal(publishCall.form.video_state,'PUBLISHED');assert.equal(publishCall.form.scheduled_publish_time,undefined);
 assert.equal((await api('/api/assets',{id:asset.id,delete:true})).status,400);
 assert.equal((await api('/api/publish-now',{assetId:asset.id,pageId:'123456789'})).status,400,'Published video cannot be posted twice');
 // Page-owned, reverse input order → natural filename ordering and reserved-slot skip.
 const batch=new FormData();batch.append('pageId','123456789');batch.append('autoSchedule','true');
 for(const n of [10,2]){batch.append('files',new Blob([Buffer.concat([mp4,Buffer.from([n])])]),`story_${n}.mp4`);batch.append('files',new Blob([`Title: Story ${n}\nCaption: Caption ${n}\nComment 1: Comment ${n}`]),`story_${n}.txt`);}
 r=await api('/api/import',batch);assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.body.imported,2);assert.equal(r.body.scheduled,2);
 s=(await api('/api/state')).body;assert.equal(s.pages[0].remaining,2);assert.ok(s.assets.every(a=>a.page_id==='123456789'));
 const waiting=s.jobs.filter(j=>j.status==='scheduled').sort((a,b)=>a.scheduled_at.localeCompare(b.scheduled_at));assert.equal(waiting[0].title,'Story 2');assert.equal(waiting[1].title,'Story 10');assert.notEqual(waiting[0].scheduled_at,waiting[1].scheduled_at);
 assert.equal((await api('/api/page-queue',{pageId:'123456789'})).status,400,'No duplicate autoqueue');
 r=await api('/api/import',batch);assert.equal(r.body.imported,0);assert.equal(r.body.scheduled,0);
 assert.equal((await api('/api/pages',{id:'987654321',name:'Empty page',country:'PL',zone:'Asia/Ho_Chi_Minh',slots:['12:00']})).status,200);
 s=(await api('/api/state')).body;assert.equal(s.pages.find(p=>p.id==='987654321').remaining,0);
 assert.equal((await api('/api/plan',{pageId:'987654321',assetIds:[s.assets.find(a=>a.name==='story_2.mp4').id],mode:'now'})).status,400,'Page isolation is enforced by backend');
 const missing=new FormData();missing.append('pageId','123456789');missing.append('autoSchedule','true');missing.append('files',new Blob([Buffer.concat([mp4,Buffer.from([99])])]),'missing.mp4');missing.append('files',new Blob(['Title: Missing caption\nComment 1: test']),'missing.txt');
 r=await api('/api/import',missing);assert.equal(r.body.imported,1);assert.equal(r.body.scheduled,0);assert.match(r.body.warnings[0],/thiếu caption/);
 const noPage=new FormData();noPage.append('autoSchedule','true');assert.equal((await api('/api/import',noPage)).status,400);
 assert.equal((await fetch(base+'/time.js')).status,200);
 }finally{if(child.exitCode===null){child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));}rmSync(dir,{recursive:true,force:true});}
});
