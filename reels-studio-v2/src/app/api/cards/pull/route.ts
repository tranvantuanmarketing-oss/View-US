import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { repository } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { pageId, count = 10, action = "preview", batchId } = body;

    if (!pageId) {
      return NextResponse.json({ success: false, error: "pageId là bắt buộc." }, { status: 400 });
    }

    const page = await repository.pages.get(pageId);
    if (!page) {
      return NextResponse.json({ success: false, error: `Không tìm thấy page "${pageId}".` }, { status: 404 });
    }

    const db = getDb();
    const pageLocale = page.locale.toLowerCase();
    const requestedCount = Math.max(1, parseInt(count, 10));

    // Find available cards matching locale
    const availableRows = db.prepare(`
      SELECT * FROM cards
      WHERE LOWER(locale) = ? AND status = 'ready' AND reserved_by_batch_id IS NULL
      ORDER BY created_at ASC
      LIMIT ?
    `).all(pageLocale, requestedCount) as any[];

    const totalAvailable = (db.prepare(`
      SELECT COUNT(*) as count FROM cards
      WHERE LOWER(locale) = ? AND status = 'ready' AND reserved_by_batch_id IS NULL
    `).get(pageLocale) as any)?.count || 0;

    if (availableRows.length < requestedCount) {
      return NextResponse.json({
        success: false,
        error: `Kho thẻ chỉ còn ${totalAvailable} thẻ ngôn ngữ "${page.locale}" ở trạng thái sẵn sàng (bạn yêu cầu ${requestedCount} thẻ). Vui lòng giảm số lượng hoặc viết thêm thẻ mới.`,
        available: totalAvailable,
        requested: requestedCount,
      }, { status: 400 });
    }

    // If action is "reserve", perform atomic reservation transaction
    if (action === "reserve") {
      const reservationBatchId = batchId || `batch_reserve_${Date.now()}`;
      const cardIds = availableRows.map((r) => r.id);

      db.transaction(() => {
        const now = new Date().toISOString();
        for (const cid of cardIds) {
          const res = db.prepare(`
            UPDATE cards
            SET status = 'reserved', reserved_by_batch_id = ?, used_by_page_id = ?, updated_at = ?
            WHERE id = ? AND status = 'ready' AND reserved_by_batch_id IS NULL
          `).run(reservationBatchId, pageId, now, cid);

          if (res.changes === 0) {
            throw new Error(`Thẻ ${cid} đã bị người khác chọn trong lúc xử lý!`);
          }
        }
      })();

      return NextResponse.json({
        success: true,
        reservedCount: cardIds.length,
        batchId: reservationBatchId,
        cardIds,
      });
    }

    // Default action: preview
    const cards = availableRows.map((r) => ({
      id: r.id,
      author: r.author,
      page: r.page,
      locale: r.locale,
      title: r.title,
      content: r.content,
      highlights: JSON.parse(r.highlights_json || "[]"),
      cta: r.cta,
      caption: r.caption,
      comment1: r.comment1,
      status: r.status,
      created_at: r.created_at,
    }));

    return NextResponse.json({
      success: true,
      totalAvailable,
      count: cards.length,
      cards,
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/cards/pull error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
