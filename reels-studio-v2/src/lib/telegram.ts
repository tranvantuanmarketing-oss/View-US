import { getDb } from "./db";

const workerState = globalThis as typeof globalThis & {
  storyTelegramWorker?: { timer: ReturnType<typeof setInterval>; busy: boolean };
};

// One delivery worker per persistent local server; retries survive in SQLite.
export function startTelegramDeliveryWorker() {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID || workerState.storyTelegramWorker) return;
  const tick = async () => {
    const worker = workerState.storyTelegramWorker;
    if (!worker || worker.busy) return;
    worker.busy = true;
    try { await dispatchTelegramOutbox({ completionOnly: true }); }
    catch { console.error("Telegram delivery worker failed; retrying later"); }
    finally { worker.busy = false; }
  };
  const timer = setInterval(tick, 15000);
  timer.unref?.();
  workerState.storyTelegramWorker = { timer, busy: false };
  void tick();
}

export interface TelegramEventPayload {
  eventType:
    | "batch_queued"
    | "batch_started"
    | "batch_completed"
    | "batch_partial_failed"
    | "writer_job_ready"
    | "writer_job_failed"
    | "card_low_inventory"
    | "helper_offline"
    | "helper_recovered"
    | "website_registered"
    | "website_status_changed";
  title: string;
  details: Record<string, any>;
  correlationId?: string;
}

/**
 * Enqueue a notification into the durable SQLite telegram_outbox
 */
export async function enqueueTelegramNotification(payload: TelegramEventPayload): Promise<string> {
  const db = getDb();
  const id = `tg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO telegram_outbox (id, event_type, payload_json, status, attempts, max_attempts, created_at)
    VALUES (?, ?, ?, 'pending', 0, 5, ?)
  `).run(id, payload.eventType, JSON.stringify(payload), now);

  startTelegramDeliveryWorker();
  if (["batch_completed", "batch_partial_failed"].includes(payload.eventType)) {
    // Trigger delivery immediately; notification failures never fail a render.
    void dispatchTelegramOutbox({ completionOnly: true }).catch(() => {});
  }
  return id;
}

/**
 * Dispatch pending notifications from telegram_outbox
 */
export async function dispatchTelegramOutbox(options: { completionOnly?: boolean } = {}): Promise<{ processed: number; delivered: number; failed: number }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const db = getDb();
  if(!botToken || !chatId) return {processed:0,delivered:0,failed:0};
  const nowIso=new Date().toISOString();
  // Reclaim a delivery only when its sending lease has expired.
  db.prepare("UPDATE telegram_outbox SET status='pending' WHERE status='sending' AND next_attempt_at <= ?").run(nowIso);
  const completionFilter = options.completionOnly ? " AND event_type IN ('batch_completed','batch_partial_failed')" : "";
  const rows=db.prepare("SELECT * FROM telegram_outbox WHERE status='pending' AND attempts < max_attempts AND (next_attempt_at IS NULL OR next_attempt_at <= ?) AND created_at >= ?" + completionFilter + " ORDER BY created_at LIMIT 10").all(nowIso, process.env.TELEGRAM_NOTIFY_SINCE || "") as any[];
  let processed=0,delivered=0,failed=0;
  for(const row of rows) {
    const leaseUntil=new Date(Date.now()+60000).toISOString();
    const claim=db.prepare("UPDATE telegram_outbox SET status='sending',next_attempt_at=? WHERE id=? AND status='pending'").run(leaseUntil,row.id);
    if(!claim.changes) continue;
    processed++;const attempts=row.attempts+1;
    let retrySeconds=Math.min(3600,Math.pow(2,attempts)*15),permanent=false;
    try {
      const payload:TelegramEventPayload=JSON.parse(row.payload_json);
      const isBatchResult = ["batch_completed", "batch_partial_failed"].includes(payload.eventType);
      const details = isBatchResult
        ? `Page: ${payload.details.pageName || "Lô tự do (chưa chọn page)"}\nLô video: ${payload.details.batchId}\nThành công: ${payload.details.completed || 0} video\nLỗi: ${payload.details.failed || 0} video\nMở The Story Studio → Lô video để xem và tải kết quả.`
        : Object.entries(payload.details).map(([k,v])=>`${k}: ${v}`).join("\n");
      const text=`${isBatchResult ? (payload.eventType === "batch_completed" ? "✅ " : "⚠️ ") : ""}The Story · ${payload.title}\n${details}\n${new Date().toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})}`;
      const response=await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},signal:AbortSignal.timeout(10000),body:JSON.stringify({chat_id:chatId,text:text.slice(0,3900)})});
      const result=await response.json();
      if(!response.ok || !result.ok) {
        retrySeconds=Math.max(retrySeconds,Number(result.parameters?.retry_after)||0);
        permanent=[400,401,403,404].includes(response.status);
        throw new Error(result.description || `HTTP ${response.status}`);
      }
      db.prepare("UPDATE telegram_outbox SET status='delivered',attempts=?,message_id=?,delivered_at=?,error=NULL,next_attempt_at=NULL WHERE id=?").run(attempts,result.result.message_id,new Date().toISOString(),row.id);delivered++;
    }catch(error:any){
      db.prepare("UPDATE telegram_outbox SET status=?,attempts=?,error=?,next_attempt_at=? WHERE id=?").run(permanent || attempts>=row.max_attempts ? "failed":"pending",attempts,String(error.message).slice(0,500),new Date(Date.now()+retrySeconds*1000).toISOString(),row.id);failed++;
    }
  }
  return {processed,delivered,failed};
}
