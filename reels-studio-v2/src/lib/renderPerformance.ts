import os from 'os';

/** A Chrome screenshot normally has no alpha. Only skip hidden background work
 * after proving that this PNG cannot contain transparent pixels. */
export function isOpaquePng(bytes:Buffer):boolean {
 if(bytes.length<33||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')return false;
 if(![0,2].includes(bytes[25]))return false;
 let pos=8;
 while(pos+12<=bytes.length){
  const length=bytes.readUInt32BE(pos),end=pos+12+length;
  if(end>bytes.length)return false;
  const kind=bytes.toString('ascii',pos+4,pos+8);
  if(kind==='tRNS')return false;
  if(kind==='IEND')return true;
  pos=end;
 }
 return false;
}
export function renderParallelism(cores=os.availableParallelism(),memory=os.totalmem()):number {
 return cores>=8&&memory>=12*1024**3?2:1;
}
/** Bound CPU usage when two videos are encoding; reserve resources for the UI. */
export function renderThreads():number {return Math.max(1,Math.min(4,Math.floor(os.availableParallelism()/renderParallelism())));}

export async function runRenderWorkers<T>(items:T[],concurrency:number,task:(item:T)=>Promise<void>){
 let cursor=0;
 const outcomes=await Promise.allSettled(Array.from({length:Math.min(items.length,Math.max(1,concurrency))},async()=>{
  while(cursor<items.length){const item=items[cursor++];await task(item);}
 }));
 const failed=outcomes.find((r):r is PromiseRejectedResult=>r.status==='rejected');
 if(failed)throw failed.reason;
}
