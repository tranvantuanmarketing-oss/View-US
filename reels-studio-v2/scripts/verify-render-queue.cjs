// Queue regression tests use an in-memory DB and a fake renderer; no live jobs.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),Database=require('better-sqlite3');
const db=new Database(':memory:');
db.exec(`CREATE TABLE batches(id TEXT PRIMARY KEY,status TEXT,finished_at TEXT,done_count INTEGER DEFAULT 0,failed_count INTEGER DEFAULT 0);CREATE TABLE batch_items(id TEXT PRIMARY KEY,batch_id TEXT,status TEXT,progress INTEGER,error TEXT,render_started_at TEXT,finished_at TEXT,output_path TEXT,output_video_url TEXT,lease_helper_id TEXT);`);
const read=id=>({batch:db.prepare('SELECT * FROM batches WHERE id=?').get(id),items:db.prepare('SELECT * FROM batch_items WHERE batch_id=? ORDER BY id').all(id)});
let active=0,max=0,mode='normal';const calls=new Map(),notifications=[];
const load=Module._load;
Module._load=function(id,parent,...rest){
 if(parent?.filename.endsWith(path.join('lib','localRenderQueue.ts'))){
  if(id==='child_process')return {spawn:()=>{const {EventEmitter}=require('node:events');const c=new EventEmitter();c.kill=()=>{};return c;}};
  if(id==='./db')return {getDb:()=>db};
  if(id==='./telegram')return {enqueueTelegramNotification:async data=>notifications.push(data)};
  if(id==='./repository')return {repository:{batches:{get:async id=>read(id)}}};
  if(id==='./renderEngine')return {renderBatchItemVideo:async(item,opt)=>{active++;max=Math.max(max,active);calls.set(item.id,(calls.get(item.id)||0)+1);try{await new Promise(r=>setTimeout(r,8));if(opt.isCancelled())throw Error('cancelled');if(mode==='fail'&&item.id.endsWith('02'))throw Error('render failure');opt.onProgress(100);return {outputPath:'/tmp/'+item.id,outputVideoUrl:'/renders/'+item.id};}finally{active--;}}};
 }
 return load.call(this,id,parent,...rest);
};
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const {startLocalBatch,isBatchRunning}=require('../src/lib/localRenderQueue.ts');
function fixture(id,n){db.prepare("INSERT INTO batches(id,status) VALUES(?,'queued')").run(id);for(let i=1;i<=n;i++)db.prepare("INSERT INTO batch_items(id,batch_id,status) VALUES(?,?,'pending')").run(id+'_'+String(i).padStart(2,'0'),id);}
async function finish(id){for(let i=0;i<300&&isBatchRunning(id);i++)await new Promise(r=>setTimeout(r,3));assert(!isBatchRunning(id),'queue failed to finish');}
(async()=>{
 fixture('many',20);startLocalBatch('many');startLocalBatch('many');await finish('many');assert.equal(read('many').batch.status,'completed');assert.equal(read('many').batch.done_count,20);assert.equal(max,2);assert([...calls.values()].every(n=>n===1));
 startLocalBatch('many');await finish('many');assert([...calls.values()].every(n=>n===1));
 fixture('cancel',8);startLocalBatch('cancel');await new Promise(r=>setTimeout(r,3));db.prepare("UPDATE batches SET status='cancelled' WHERE id='cancel'").run();db.prepare("UPDATE batch_items SET status='cancelled' WHERE batch_id='cancel' AND status='pending'").run();await finish('cancel');assert.equal(read('cancel').batch.status,'cancelled');assert.equal(read('cancel').items.filter(i=>i.status==='completed').length,0);
 fixture('retry',4);mode='fail';startLocalBatch('retry');await finish('retry');assert.equal(read('retry').batch.status,'partial_failed');assert.equal(read('retry').batch.done_count,3);const preserved=read('retry').items.find(i=>i.status==='completed');
 mode='normal';db.prepare("UPDATE batch_items SET status='pending' WHERE batch_id='retry' AND status='failed'").run();startLocalBatch('retry');await finish('retry');assert.equal(read('retry').batch.done_count,4);assert.equal(read('retry').items.find(i=>i.id===preserved.id).finished_at,preserved.finished_at);assert.equal(active,0);
 console.log('PASS actual queue: 20 items, 2 workers, duplicate start, completed items preserved, cancel, partial failure, retry and counts');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.close());
