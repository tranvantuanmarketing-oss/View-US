const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const {isOpaquePng,renderParallelism,runRenderWorkers}=require('../src/lib/renderPerformance.ts');
function chunk(kind,size=0){const b=Buffer.alloc(12+size);b.writeUInt32BE(size);b.write(kind,4);return b;}
function png(color,transparent=false){const header=chunk('IHDR',13);header[17]=color;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),header,...(transparent?[chunk('tRNS')]:[]),chunk('IEND')]);}
(async()=>{
 assert.equal(isOpaquePng(png(2)),true);assert.equal(isOpaquePng(png(0)),true);
 for(const color of [3,4,6])assert.equal(isOpaquePng(png(color)),false);
 assert.equal(isOpaquePng(png(2,true)),false);assert.equal(isOpaquePng(Buffer.alloc(40)),false);assert.equal(isOpaquePng(png(2).subarray(0,40)),false);
 assert.equal(renderParallelism(10,16*1024**3),2);assert.equal(renderParallelism(4,16*1024**3),1);assert.equal(renderParallelism(10,8*1024**3),1);
 let active=0,max=0;const seen=[];
 await runRenderWorkers(Array.from({length:20},(_,i)=>i),2,async i=>{active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,2));seen.push(i);active--;});
 assert.equal(max,2);assert.equal(seen.length,20);assert.equal(new Set(seen).size,20);
 let cancelled=false;const claimed=[];await runRenderWorkers([1,2,3,4,5],2,async i=>{if(cancelled)return;claimed.push(i);await new Promise(r=>setTimeout(r,2));cancelled=true;});assert.deepEqual(claimed,[1,2]);
 let settled=false;await assert.rejects(runRenderWorkers([1,2],2,async i=>{if(i===1)throw Error('failure');await new Promise(r=>setTimeout(r,10));settled=true;}));assert.equal(settled,true);
 console.log('PASS opaque detection, alpha fallback, memory/CPU bounds, 20 items exactly once, cancellation, settled errors');
})().catch(e=>{console.error(e);process.exitCode=1;});
