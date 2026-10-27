import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { parseStories } from "@/lib/storyImport";
import { detectStoryLocale } from "@/lib/locales";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "all";
    const locale = searchParams.get("locale") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const db = getDb();
    let countSql = "SELECT COUNT(*) as total FROM cards WHERE 1=1";
    let querySql = "SELECT * FROM cards WHERE 1=1";
    const params: any[] = [];

    if (status !== "all") {
      countSql += " AND status = ?";
      querySql += " AND status = ?";
      params.push(status);
    }
    if (locale !== "all") {
      countSql += " AND locale = ?";
      querySql += " AND locale = ?";
      params.push(locale);
    }
    if (search.trim()) {
      countSql += " AND (title LIKE ? OR content LIKE ? OR author LIKE ?)";
      querySql += " AND (title LIKE ? OR content LIKE ? OR author LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const totalRow = db.prepare(countSql).get(...params) as any;
    const total = totalRow?.total || 0;

    querySql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    const rows = db.prepare(querySql).all(...params, limit, offset) as any[];

    const cards = rows.map((r) => ({
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
      reserved_by_batch_id: r.reserved_by_batch_id,
      used_by_page_id: r.used_by_page_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        cards,
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
    console.error("GET /api/cards error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Check if bulk import or single card
    if (body.bulkText) {
      const stories = parseStories(String(body.bulkText));
      if (!stories.length) return NextResponse.json({success:false,error:"File chưa có nội dung video."},{status:400});
      const createdCards = [];
      for (const story of stories) {
        createdCards.push(await repository.cards.create({
          author_name:story.author || body.defaultAuthor || "",
          page:story.pageName || body.defaultPage || "", locale:detectStoryLocale(story, body.locale || "en"),
          title:story.title || story.content.slice(0,60), body:story.content,
          highlights:story.highlights, cta:story.cta, caption:story.caption, first_comment:story.comment1,
          status:"ready", category:"Drama", avatar_hint:{gender:"nu",age_hint:28},
        }));
      }

      return NextResponse.json({
        success: true,
        count: createdCards.length,
        data: createdCards,
      });
    }

    // Single card creation
    const {
      author,
      page,
      locale = "en",
      title,
      content,
      highlights = [],
      cta = "Read continuation in comments",
      caption = "",
      comment1 = "",
      status = "ready",
    } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Tiêu đề và nội dung là bắt buộc." }, { status: 400 });
    }

    const newCard = await repository.cards.create({
      author_name: author || user.name || "Anonymous",
      page: page || "Daily Confessions",
      locale,
      title,
      body: content,
      highlights: Array.isArray(highlights) ? highlights : typeof highlights === "string" ? highlights.split("|").map((h: string) => h.trim()) : [],
      cta,
      caption: caption || content.slice(0, 140) + "...",
      first_comment: comment1,
      status: status as any,
      category: "Drama",
      avatar_hint: { gender: "nu", age_hint: 30 },
    });

    return NextResponse.json({ success: true, data: newCard }, { status: 201 });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/cards error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
