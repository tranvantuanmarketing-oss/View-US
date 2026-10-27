// Isolated renderer benchmark: read production fixtures, never enqueue or publish them.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),Module=require('node:module'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText,file);
const Database=require('better-sqlite3'),db=new Database(path.join(root,'data/reels_studio.db'),{readonly:true});
const {renderBatchItemVideo}=require('../src/lib/renderEngine.ts');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'story-render-benchmark-'));
const label=process.argv[2]||'benchmark';
(async()=>{
 const sample=db.prepare("SELECT * FROM batch_items WHERE status='completed' AND resolution='1080x1920' ORDER BY finished_at DESC LIMIT 1").get();
 if(!sample)throw Error('No completed fixture');
 const count=Number(process.argv[3]||0);
 if(count){
  const {runRenderWorkers,renderParallelism}=require('../src/lib/renderPerformance.ts');
  const start=performance.now();let completed=0;
  await runRenderWorkers(Array.from({length:count},(_,seq)=>({...sample,story_payload:JSON.parse(sample.story_payload_json),id:'benchmark_'+seq,batch_id:'benchmark',seq:seq+1})),renderParallelism(),async item=>{await renderBatchItemVideo(item,{cwd:root,outputDir:directory});completed++;});
  console.log(JSON.stringify({label,completed,concurrency:renderParallelism(),resolution:sample.resolution,duration:sample.duration,totalMs:Math.round(performance.now()-start),directory}));return;
 }
 const results=[];
 for(const resolution of ['1080x1920','1440x2560']){
  const item={...sample,story_payload:JSON.parse(sample.story_payload_json),id:'benchmark_'+resolution,batch_id:'benchmark',resolution};let captureMs;
  const start=performance.now();
  const result=await renderBatchItemVideo(item,{cwd:root,outputDir:directory,onProgress:p=>{if(p===10&&captureMs===undefined)captureMs=performance.now()-start;}});
  const metrics={label,resolution,duration:item.duration,totalMs:Math.round(performance.now()-start),captureMs:Math.round(captureMs),bytes:result.fileSizeBytes,file:result.outputPath};results.push(metrics);console.log(JSON.stringify(metrics));
 }
 fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify(results,null,2));console.log('RESULTS '+path.join(directory,'results.json'));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.close());
