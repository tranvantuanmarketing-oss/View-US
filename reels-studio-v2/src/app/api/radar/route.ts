import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const adsFilter = searchParams.get("ads") || "all";
    const sortBy = searchParams.get("sortBy") || "followers";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "ASC" : "DESC";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const db = getDb();
    let countSql = "SELECT COUNT(*) as total FROM monitored_pages WHERE 1=1";
    let querySql = "SELECT * FROM monitored_pages WHERE 1=1";
    const params: any[] = [];

    if (search.trim()) {
      countSql += " AND (page_name LIKE ? OR target_domain LIKE ?)";
      querySql += " AND (page_name LIKE ? OR target_domain LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (adsFilter !== "all") {
      countSql += " AND ads_status = ?";
      querySql += " AND ads_status = ?";
      params.push(adsFilter);
    }

    const totalRow = db.prepare(countSql).get(...params) as any;
    const total = totalRow?.total || 0;

    // Allowed sort columns
    const allowedSorts = ["followers", "delta_7d", "posts_today", "posts_7d", "comments_7d", "total_posts", "last_scanned_at"];
    const sortCol = allowedSorts.includes(sortBy) ? sortBy : "followers";

    querySql += ` ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
    const rows = db.prepare(querySql).all(...params, limit, offset) as any[];

    return NextResponse.json({
      success: true,
      data: {
        pages: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/radar error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { page_name, page_avatar, followers = 0, target_domain, ads_status = "unknown" } = body;

    if (!page_name?.trim()) {
      return NextResponse.json({ success: false, error: "Tên page là bắt buộc." }, { status: 400 });
    }

    const id = `rad_${Date.now()}`;
    const now = new Date().toISOString();
    const db = getDb();

    db.prepare(`
      INSERT INTO monitored_pages (id, page_name, page_avatar, followers, delta_7d, posts_today, posts_7d, comments_7d, total_posts, target_domain, ads_status, last_scanned_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      page_name.trim(),
      page_avatar || "/assets/avatars/av_01.jpg",
      followers,
      null, // Delta 7d is null initially: "Chưa đủ dữ liệu", not fake 0!
      0,
      0,
      0,
      0,
      target_domain || null,
      ads_status,
      now,
      now
    );

    const created = db.prepare("SELECT * FROM monitored_pages WHERE id = ?").get(id);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/radar error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
