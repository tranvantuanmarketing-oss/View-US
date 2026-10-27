import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-helper-key") || "";
    const rawKey = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!rawKey) {
      return NextResponse.json({ success: false, error: "Missing helper auth key" }, { status: 401 });
    }

    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const db = getDb();

    // Verify helper
    const helper = db.prepare("SELECT * FROM helpers WHERE key_hash = ? AND revoked = 0").get(keyHash) as any;
    if (!helper) {
      return NextResponse.json({ success: false, error: "Invalid or revoked helper key" }, { status: 403 });
    }

    const body = await req.json();
    const { itemId, leaseToken, outputPath, outputVideoUrl, error } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, error: "itemId là bắt buộc." }, { status: 400 });
    }

    const now = new Date().toISOString();

    let updated = false;
    db.transaction(() => {
      // Find item
      const item = db.prepare("SELECT * FROM batch_items WHERE id = ?").get(itemId) as any;
      if (!item) {
        throw new Error(`Không tìm thấy item ${itemId}`);
      }

      if(!leaseToken || !item.lease_token || item.lease_token !== leaseToken || item.lease_helper_id !== helper.id)
        throw new Error("Lease không hợp lệ hoặc không thuộc máy này.");
      if(["completed","failed"].includes(item.status)) {updated=true;return;}
      if(!["leased","rendering"].includes(item.status) || !item.lease_expires_at || item.lease_expires_at < now)
        throw new Error("Lease hết hạn hoặc công việc không còn hoạt động.");
      if(!error) {
        const root=path.resolve(process.cwd(),"public/renders")+path.sep;
        if(typeof outputPath!=="string" || !path.resolve(outputPath).startsWith(root) || !fs.existsSync(outputPath) || fs.statSync(outputPath).size<1000)
          throw new Error("Chưa có file MP4 hợp lệ trong kho kết quả local.");
        if(typeof outputVideoUrl!=="string" || outputVideoUrl!=="/renders/"+path.relative(path.resolve(process.cwd(),"public/renders"),outputPath).split(path.sep).join("/"))
          throw new Error("URL kết quả không khớp file.");
      }

      if (error) {
        db.prepare(`
          UPDATE batch_items 
          SET status = 'failed', error = ?, finished_at = ?
          WHERE id = ?
        `).run(error, now, itemId);

        db.prepare(`
          UPDATE batches 
          SET failed_count = failed_count + 1
          WHERE id = ?
        `).run(item.batch_id);
      } else {
        db.prepare(`
          UPDATE batch_items 
          SET status = 'completed', output_path = ?, output_video_url = ?, finished_at = ?
          WHERE id = ?
        `).run(outputPath || null, outputVideoUrl || null, now, itemId);

        db.prepare(`
          UPDATE batches 
          SET done_count = done_count + 1
          WHERE id = ?
        `).run(item.batch_id);
      }

      // Check if all items in batch are finished
      const remaining = db.prepare(`
        SELECT COUNT(*) as count FROM batch_items 
        WHERE batch_id = ? AND status IN ('pending', 'leased', 'rendering')
      `).get(item.batch_id) as any;

      if (remaining?.count === 0) {
        const failedCheck = db.prepare(`
          SELECT COUNT(*) as count FROM batch_items 
          WHERE batch_id = ? AND status = 'failed'
        `).get(item.batch_id) as any;

        const finalStatus = (failedCheck?.count || 0) > 0 ? "partial_failed" : "completed";
        db.prepare(`
          UPDATE batches 
          SET status = ?, finished_at = ?
          WHERE id = ?
        `).run(finalStatus, now, item.batch_id);
      }

      updated = true;
    })();

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("POST /api/helpers/complete error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
