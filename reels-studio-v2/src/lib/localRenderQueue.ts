import { spawn, ChildProcess } from "child_process";
import { enqueueTelegramNotification } from "./telegram";
import { getDb } from "./db";
import { repository } from "./repository";
import { renderBatchItemVideo } from "./renderEngine";
import {renderParallelism,runRenderWorkers} from './renderPerformance';

// This worker lives in the persistent local Node server (not a serverless deployment).
const state = globalThis as typeof globalThis & {storyRenderQueue?: {running:Set<string>; tail:Promise<void>; recovered?:boolean; awake?:ChildProcess}};
const queue: NonNullable<typeof state.storyRenderQueue> = state.storyRenderQueue ||= {running:new Set<string>(),tail:Promise.resolve()};
export function isBatchRunning(id:string) {return queue.running.has(id);}
export function startLocalBatch(id:string) {
  if(queue.running.has(id)) return;
  queue.running.add(id);
  if(process.platform === "darwin" && !queue.awake) {
    const awake=spawn("/usr/bin/caffeinate",["-i","-w",String(process.pid)],{stdio:"ignore"});
    queue.awake=awake;awake.on("error",()=>{if(queue.awake===awake)queue.awake=undefined;});
    awake.on("exit",()=>{if(queue.awake===awake)queue.awake=undefined;});
  }
  queue.tail = (queue.tail || Promise.resolve()).then(()=>run(id)).catch(error=>{
    console.error("Local render worker",error);
    getDb().prepare("UPDATE batches SET status='failed', finished_at=? WHERE id=? AND status!='cancelled'").run(new Date().toISOString(),id);
  }).finally(()=>{
    queue.running.delete(id);
    if(!queue.running.size){queue.awake?.kill();queue.awake=undefined;}
  });
}
export function recoverLocalBatches() {
  if(queue.recovered) return;
  queue.recovered=true;
  const db=getDb();
  const batches=db.prepare("SELECT id FROM batches WHERE status IN ('queued','running','interrupted') ORDER BY created_at").all() as {id:string}[];
  db.transaction(()=>{
    for(const batch of batches){
      db.prepare("UPDATE batch_items SET status='pending',progress=0,error=NULL,lease_helper_id=NULL WHERE batch_id=? AND status IN ('rendering','leased')").run(batch.id);
      db.prepare("UPDATE batches SET status='queued',finished_at=NULL WHERE id=?").run(batch.id);
    }
  })();
  for(const batch of batches) startLocalBatch(batch.id);
  console.log(`Local render queue recovered ${batches.length} batch(es)`);
}

async function run(id:string) {
  const db=getDb();
  if((db.prepare("SELECT status FROM batches WHERE id=?").get(id) as any)?.status === "cancelled") return;
  db.prepare("UPDATE batches SET status='running',finished_at=NULL WHERE id=?").run(id);
  const result=await repository.batches.get(id);
  const snapshot = result.batch?.settings_snapshot as { page_name?: string } | undefined;
  const pageName = snapshot?.page_name || (result.batch?.page_id && result.batch.page_id !== "free"
    ? (await repository.pages.get(result.batch.page_id))?.name || "Page đã xóa"
    : "Lô tự do (chưa chọn page)");
  await enqueueTelegramNotification({eventType:"batch_started",title:"Bắt đầu dựng lô",details:{batchId:id,pageName},correlationId:id});
  const cancelled=()=> (db.prepare("SELECT status FROM batches WHERE id=?").get(id) as any)?.status === "cancelled";
  await runRenderWorkers(result.items,renderParallelism(),async item=>{
    if(cancelled()) return;
    if(item.status!=="pending") return;
    const claimed=db.prepare("UPDATE batch_items SET status='rendering',progress=0,error=NULL,render_started_at=? WHERE id=? AND status='pending'").run(new Date().toISOString(),item.id);
    if(!claimed.changes) return;
    try {
      const output=await renderBatchItemVideo(item,{isCancelled:cancelled,onProgress:p=>db.prepare("UPDATE batch_items SET progress=? WHERE id=?").run(p,item.id)});
      db.prepare("UPDATE batch_items SET status='completed',progress=100,output_path=?,output_video_url=?,finished_at=? WHERE id=? AND status='rendering'").run(output.outputPath,output.outputVideoUrl,new Date().toISOString(),item.id);
    } catch(error:any) {
      db.prepare("UPDATE batch_items SET status=?,error=?,finished_at=? WHERE id=?").run(cancelled()?"cancelled":"failed",String(error.message).slice(-2000),new Date().toISOString(),item.id);
    }
    updateCounts(id);
  });
  updateCounts(id);
  if(cancelled()) return;
  const counts=db.prepare("SELECT status,COUNT(*) n FROM batch_items WHERE batch_id=? GROUP BY status").all(id) as any[];
  if(counts.some(c=>["pending","leased","rendering"].includes(c.status))) return;
  const failed=counts.some(c=>c.status==="failed");const done=counts.some(c=>c.status==="completed");
  db.prepare("UPDATE batches SET status=?,finished_at=? WHERE id=?").run(failed?(done?"partial_failed":"failed"):"completed",new Date().toISOString(),id);
  await enqueueTelegramNotification({eventType:failed?"batch_partial_failed":"batch_completed",title:failed?"Lô dựng có lỗi":"Đã dựng xong",details:{batchId:id,pageName,completed:counts.find(c=>c.status==="completed")?.n || 0,failed:counts.find(c=>c.status==="failed")?.n || 0},correlationId:id});
}
export function updateCounts(id:string) {
  getDb().prepare(`UPDATE batches SET done_count=(SELECT COUNT(*) FROM batch_items WHERE batch_id=? AND status='completed'), failed_count=(SELECT COUNT(*) FROM batch_items WHERE batch_id=? AND status='failed') WHERE id=?`).run(id,id,id);
}
