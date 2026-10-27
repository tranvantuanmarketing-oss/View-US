import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { isBatchRunning } from "@/lib/localRenderQueue";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const batchRes = await repository.batches.get(id);
    if (!batchRes || !batchRes.batch) {
      return NextResponse.json({ success: false, error: `Không tìm thấy lô video "${id}".` }, { status: 404 });
    }
    const batch = batchRes.batch;
    if(batch.status === "running" && !isBatchRunning(id) && batchRes.items.some(i=>i.status==="rendering")) {
      getDb().prepare("UPDATE batches SET status='interrupted' WHERE id=?").run(id);
      batch.status="interrupted" as any;
    }
    const items = batchRes.items;

    // Check ownership if not admin
    if (user.role !== "admin" && batch.owner_staff_id !== user.id) {
      return NextResponse.json({ success: false, error: "Không có quyền xem lô video này." }, { status: 403 });
    }

    const page = await repository.pages.get(batch.page_id);

    return NextResponse.json({
      success: true,
      data: {
        batch: {
          ...batch,
          page_name: page?.name || batch.page_id,
          locale: (batch.settings_snapshot as any)?.locale || page?.locale || "en",
        },
        items,
      },
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/batches/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const batchRes = await repository.batches.get(id);
    if (!batchRes || !batchRes.batch) {
      return NextResponse.json({ success: false, error: `Không tìm thấy lô video "${id}".` }, { status: 404 });
    }
    const batch = batchRes.batch;

    if (user.role !== "admin" && batch.owner_staff_id !== user.id) {
      return NextResponse.json({ success: false, error: "Không có quyền chỉnh sửa lô video này." }, { status: 403 });
    }

    const db = getDb();
    const { status, note } = body;

    if (status && status !== "cancelled") return NextResponse.json({success:false,error:"Không thể đánh dấu hoàn tất thủ công; hãy dựng và kiểm tra file."},{status:400});
    if (status) {
      const now = new Date().toISOString();
      db.prepare(`
        UPDATE batches 
        SET status = ?, finished_at = CASE WHEN ? IN ('completed', 'failed', 'cancelled') THEN ? ELSE finished_at END
        WHERE id = ?
      `).run(status, status, now, id);

      // Record audit log
      db.prepare(`
        INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `audit_${Date.now()}`,
        user.id,
        "batch_status_update",
        "batch",
        id,
        JSON.stringify({ status, note: note || "Cập nhật trạng thái thủ công", actor: user.name }),
        now
      );
    }

    const updated = await repository.batches.get(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/batches/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const batch = db.prepare("SELECT * FROM batches WHERE id = ?").get(id) as any;
    if (!batch) {
      return NextResponse.json({ success: false, error: `Không tìm thấy lô ${id}` }, { status: 404 });
    }

    if(isBatchRunning(id) || ["running","queued"].includes(batch.status)) return NextResponse.json({success:false,error:"Hãy hủy hoặc hoàn tất lô trước khi xóa."},{status:409});
    if(!/^[\w-]+$/.test(id)) return NextResponse.json({success:false,error:"Mã lô không hợp lệ"},{status:400});
    // Delete render files on disk if requested
    const { searchParams } = new URL(req.url);
    const deleteFiles = searchParams.get("delete_files") === "true";
    if (deleteFiles) {
      const fs = await import("fs");
      const path = await import("path");
      const renderDir = path.join(process.cwd(), "public", "renders", `batch_${id}`);
      if (fs.existsSync(renderDir)) {
        fs.rmSync(renderDir, { recursive: true, force: true });
      }
    }

    // Delete items and batch from database
    db.prepare("DELETE FROM batch_items WHERE batch_id = ?").run(id);
    db.prepare("DELETE FROM batches WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: `Đã xóa lô ${id} thành công.` });
  } catch (err: any) {
    console.error("DELETE /api/batches/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

