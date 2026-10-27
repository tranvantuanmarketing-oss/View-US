import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

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

    // Update heartbeat
    const now = new Date();
    const nowIso = now.toISOString();
    db.prepare("UPDATE helpers SET last_seen_at = ? WHERE id = ?").run(nowIso, helper.id);

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(helper.concurrency || 2, Math.max(1, body.limit || 1));

    // Lease expiration TTL: 10 minutes
    const leaseExpires = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    const leasedItems: any[] = [];

    db.transaction(() => {
      // Find candidate items
      const candidates = db.prepare(`
        SELECT bi.*, b.name as batch_name, b.page_id, p.name as page_name, p.locale
        FROM batch_items bi
        JOIN batches b ON bi.batch_id = b.id
        LEFT JOIN pages p ON b.page_id = p.id
        WHERE b.status IN ('queued','running') AND (b.target_helper_id IS NULL OR b.target_helper_id=?) AND (bi.status='pending' OR (bi.status='leased' AND bi.lease_expires_at < ?))
        ORDER BY bi.seq ASC
        LIMIT ?
      `).all(helper.id, nowIso, limit) as any[];

      for (const item of candidates) {
        const leaseToken = `lease_${crypto.randomBytes(16).toString("hex")}`;
        const res = db.prepare(`
          UPDATE batch_items
          SET status = 'leased', lease_token = ?, leased_at = ?, lease_expires_at = ?, lease_helper_id=?
          WHERE id = ? AND (status = 'pending' OR (status = 'leased' AND lease_expires_at < ?))
        `).run(leaseToken, nowIso, leaseExpires, helper.id, item.id, nowIso);

        if (res.changes > 0) {
          // Update batch status to running if not already
          db.prepare("UPDATE batches SET status = 'running' WHERE id = ? AND status = 'queued'").run(item.batch_id);

          leasedItems.push({
            id: item.id,
            batch_id: item.batch_id,
            seq: item.seq,
            lease_token: leaseToken,
            template_id: item.template_id,
            palette_id: item.palette_id,
            avatar_id: item.avatar_id,
            music_track_id: item.track_id,
            duration:item.duration, resolution:item.resolution,
            background_video_url: item.background_video_url,
            story_payload: typeof item.story_payload_json === "string" ? JSON.parse(item.story_payload_json) : item.story_payload_json,
            page_id: item.page_id,
            page_name: item.page_name,
            locale: item.locale || "en",
          });
        }
      }
    })();

    return NextResponse.json({
      success: true,
      helper: { id: helper.id, name: helper.name },
      claimedCount: leasedItems.length,
      items: leasedItems,
    });
  } catch (err: any) {
    console.error("POST /api/helpers/claim error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
