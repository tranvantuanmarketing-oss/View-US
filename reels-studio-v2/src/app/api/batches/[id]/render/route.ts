import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { startLocalBatch, isBatchRunning, updateCounts } from "@/lib/localRenderQueue";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest,{params}:{params:{id:string}}) {
  const db=getDb(),id=params.id;
  const batch=db.prepare("SELECT * FROM batches WHERE id=?").get(id) as any;
  if(!batch) return NextResponse.json({success:false,error:"Không tìm thấy lô."},{status:404});
  const {action="start"}=await req.json().catch(()=>({}));
  if(!["start","retry","cancel"].includes(action)) return NextResponse.json({success:false,error:"Thao tác không hợp lệ."},{status:400});
  if(action==="cancel") {
    db.transaction(()=>{
      db.prepare("UPDATE batches SET status='cancelled',finished_at=? WHERE id=?").run(new Date().toISOString(),id);
      db.prepare("UPDATE batch_items SET status='cancelled' WHERE batch_id=? AND status IN ('pending','leased')").run(id);
    })();
    return NextResponse.json({success:true});
  }
  if(isBatchRunning(id)) return NextResponse.json({success:true,status:"running"},{status:202});
  // Explicit resume recovers work interrupted by a previous local-server process.
  db.prepare("UPDATE batch_items SET status='pending',progress=0,error=NULL WHERE batch_id=? AND status IN ('rendering','failed','cancelled')").run(id);
  db.prepare("UPDATE batches SET status='queued',finished_at=NULL WHERE id=?").run(id);
  updateCounts(id);startLocalBatch(id);
  return NextResponse.json({success:true,status:"running"},{status:202});
}
