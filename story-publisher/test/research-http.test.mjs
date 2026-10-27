import test from'node:test';import assert from'node:assert/strict';import{mkdtempSync,rmSync}from'node:fs';import{DatabaseSync}from'node:sqlite';import{tmpdir}from'node:os';import path from'node:path';import{spawn}from'node:child_process';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('Research HTTP: CSRF, encrypted key, 3 markets, sandbox widget, shared memory and daily cap',{timeout:20000},async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'story-research-http-')),port=31341,base=`http://127.0.0.1:${port}`,secret='fake-research-secret-key';
 const child=spawn(process.execPath,['test/mock-server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port),PUBLISHER_DATA:dir,TRACE_FILE:path.join(dir,'trace')},stdio:['ignore','ignore','pipe']});let errors='';child.stderr.on('data',b=>errors+=b);
 const api=async(route,body)=>{const r=await fetch(base+route,body===undefined?{}:{method:'POST',headers:{'X-Story-Client':'publisher','Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
 try{
  let ready=false;for(let i=0;i<60;i++){try{if((await api('/api/health')).body.ok){ready=true;break;}}catch{}await sleep(80);}assert(ready,errors);
  assert.equal((await fetch(base+'/api/research',{method:'POST',body:'{}'})).status,403);
  const config={action:'save',key:secret,model:'gemini-2.5-flash',markets:['PL','FR','NL'],focus:'Original editorial direction',maxRunsPerDay:2,enabled:true,consent:false};
  assert.equal((await api('/api/research',config)).status,400);assert.equal((await api('/api/research')).body.settings.configured,false);
  await api('/api/telegram',{action:'save',token:'fake-bot',chat:'fake-chat'});
  assert.equal((await api('/api/research',{...config,enabled:false,consent:true})).status,200);
  let state=(await api('/api/research')).body;assert(state.settings.configured);assert(!JSON.stringify(state).includes(secret));
  const db=new DatabaseSync(path.join(dir,'publisher.db'),{readOnly:true});assert(!db.prepare("SELECT value FROM config WHERE key='gemini_key'").get().value.includes(secret));db.close();
  assert.equal((await api('/api/research',{action:'run'})).status,200);
  for(let i=0;i<40;i++){state=(await api('/api/research')).body;if(!state.busy)break;await sleep(50);}
  assert.equal(state.last.status,'completed');assert.equal(state.last.report.reports.length,3);assert(state.last.notified_at);assert(!JSON.stringify(state).includes(secret));
  const widget=await fetch(base+'/api/research/widget?id='+encodeURIComponent(state.last.id)+'&market=PL');assert(widget.headers.get('content-security-policy').includes("default-src 'none'"));assert(widget.headers.get('content-security-policy').includes('sandbox'));assert((await widget.text()).includes('Search Suggestions'));
  const note=await api('/api/knowledge',{action:'note',market:'PL',body:'User editorial preference',ownership:true});assert.equal(note.status,200);assert.equal(note.body.notes.length,1);assert.equal(note.body.claudeConnected,false);assert(note.body.files.some(f=>f.name==='CLAUDE_BRAIN.md'));
  await api('/api/research',{action:'run'});for(let i=0;i<40;i++){if(!(await api('/api/research')).body.busy)break;await sleep(50);}assert.equal((await api('/api/research',{action:'run'})).status,400);
 }finally{child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));rmSync(dir,{recursive:true,force:true});}
});
