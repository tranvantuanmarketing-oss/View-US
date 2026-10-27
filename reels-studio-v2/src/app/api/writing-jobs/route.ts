import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "all";
    const locale = searchParams.get("locale") || "all";

    const db = getDb();
    let query = `
      SELECT 
        wj.*,
        vp.caption as source_caption,
        vp.page_name as source_page,
        vp.image_url as source_image,
        vp.post_url as source_url
      FROM writing_jobs wj
      LEFT JOIN viral_posts vp ON wj.source_post_id = vp.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status !== "all") {
      query += " AND wj.status = ?";
      params.push(status);
    }
    if (locale !== "all") {
      query += " AND wj.target_locale = ?";
      params.push(locale);
    }

    query += " ORDER BY wj.created_at DESC LIMIT 100";
    const jobs = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, data: jobs });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/writing-jobs error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { jobId, action } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: "jobId là bắt buộc." }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    if (action === "retry") {
      db.prepare(`
        UPDATE writing_jobs 
        SET status = 'pending', attempt_count = attempt_count + 1, error = NULL
        WHERE id = ?
      `).run(jobId);
    }

    const updated = db.prepare("SELECT * FROM writing_jobs WHERE id = ?").get(jobId);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/writing-jobs error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
