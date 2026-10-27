import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { repository } from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const locale = searchParams.get("locale") || "all";
    const postType = searchParams.get("postType") || "all";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "comments_count";
    const minComments = parseInt(searchParams.get("minComments") || "0", 10);
    const hasLink = searchParams.get("hasLink");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const db = getDb();
    let countSql = "SELECT COUNT(*) as total FROM viral_posts WHERE 1=1";
    let querySql = "SELECT * FROM viral_posts WHERE 1=1";
    const params: any[] = [];

    if (locale !== "all") {
      countSql += " AND locale = ?";
      querySql += " AND locale = ?";
      params.push(locale);
    }

    if (postType !== "all") {
      countSql += " AND post_type = ?";
      querySql += " AND post_type = ?";
      params.push(postType);
    }

    if (minComments > 0) {
      countSql += " AND comments_count >= ?";
      querySql += " AND comments_count >= ?";
      params.push(minComments);
    }

    if (hasLink === "true" || hasLink === "1") {
      countSql += " AND has_website_link = 1";
      querySql += " AND has_website_link = 1";
    }

    if (search.trim()) {
      countSql += " AND (caption LIKE ? OR page_name LIKE ?)";
      querySql += " AND (caption LIKE ? OR page_name LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const totalRow = db.prepare(countSql).get(...params) as any;
    const total = totalRow?.total || 0;

    const allowedSorts = ["comments_count", "reactions_count", "shares_count", "published_at", "page_followers"];
    const sortCol = allowedSorts.includes(sortBy) ? sortBy : "comments_count";

    querySql += ` ORDER BY ${sortCol} DESC LIMIT ? OFFSET ?`;
    const rows = db.prepare(querySql).all(...params, limit, offset) as any[];

    return NextResponse.json({
      success: true,
      data: {
        posts: rows,
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
    console.error("GET /api/viral error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const db = getDb();
    const now = new Date().toISOString();

    // Action 1: Queue selected posts for rewriting
    if (body.action === "queue_rewrite") {
      const { postIds, targetLocales = ["en"] } = body;
      if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
        return NextResponse.json({ success: false, error: "Danh sách postIds rỗng." }, { status: 400 });
      }

      let createdJobs = 0;
      db.transaction(() => {
        for (const postId of postIds) {
          for (const loc of targetLocales) {
            // Deduplicate: check if job already exists for this post & locale
            const existing = db.prepare(`
              SELECT id FROM writing_jobs 
              WHERE source_post_id = ? AND target_locale = ? AND status != 'failed'
            `).get(postId, loc);

            if (!existing) {
              const jobId = `wjob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              db.prepare(`
                INSERT INTO writing_jobs (id, source_post_id, target_locale, status, attempt_count, max_attempts, created_at)
                VALUES (?, ?, ?, 'pending', 0, 3, ?)
              `).run(jobId, postId, loc, now);
              createdJobs++;
            }
          }
        }
      })();

      return NextResponse.json({ success: true, queuedJobs: createdJobs });
    }

    // Action 2: Add single viral post
    const {
      source = "Facebook",
      page_name,
      page_followers = 0,
      locale = "en",
      post_type = "bai-viet",
      published_at,
      comments_count = 0,
      reactions_count = 0,
      shares_count = 0,
      caption,
      image_url,
      post_url,
      has_website_link = 0,
    } = body;

    if (!page_name || !caption) {
      return NextResponse.json({ success: false, error: "Tên page và caption là bắt buộc." }, { status: 400 });
    }

    const id = `vp_${Date.now()}`;
    db.prepare(`
      INSERT INTO viral_posts (id, source, page_name, page_followers, locale, post_type, published_at, comments_count, reactions_count, shares_count, caption, image_url, post_url, has_website_link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      source,
      page_name,
      page_followers,
      locale,
      post_type,
      published_at || now,
      comments_count,
      reactions_count,
      shares_count,
      caption,
      image_url || null,
      post_url || `https://facebook.com/post/${id}`,
      has_website_link ? 1 : 0,
      now
    );

    const created = db.prepare("SELECT * FROM viral_posts WHERE id = ?").get(id);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/viral error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
