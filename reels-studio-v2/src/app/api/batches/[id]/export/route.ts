import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { repository } from "@/lib/repository";
import crypto from "crypto";

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
    const items = batchRes.items;

    if (user.role !== "admin" && batch.owner_staff_id !== user.id) {
      return NextResponse.json({ success: false, error: "Không có quyền xuất lô video này." }, { status: 403 });
    }

    const page = await repository.pages.get(batch.page_id);

    const exportData = {
      schemaVersion: "2.0.0",
      rendererVersion: "v13",
      exportedAt: new Date().toISOString(),
      batchId: batch.id,
      batchName: batch.name,
      page: {
        id: page?.id || batch.page_id,
        name: page?.name || "The Story",
        locale: page?.locale || "en",
      },
      itemCount: items.length,
      settingsSnapshot: batch.settings_snapshot || null,
      items: items.map((item) => {
        const payload = typeof item.story_payload === "string" ? JSON.parse(item.story_payload) : item.story_payload;
        return {
          id: item.id,
          seq: item.seq,
          templateId: item.template_id,
          paletteId: item.palette_id,
          avatarId: item.avatar_id,
          musicTrackId: item.music_track_id,
          backgroundVideoUrl: item.background_video_url,
          title: payload.title,
          author: payload.author,
          content: payload.content,
          highlights: payload.highlights || [],
          cta: payload.cta,
          caption: payload.caption,
          comment1: payload.comment1,
          status: item.status,
        };
      }),
    };

    const serialized = JSON.stringify(exportData, null, 2);
    const checksum = crypto.createHash("sha256").update(serialized).digest("hex");
    const finalData = { ...exportData, checksum };

    return new Response(JSON.stringify(finalData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="batch_${batch.id}.json"`,
        "X-Checksum-Sha256": checksum,
      },
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/batches/[id]/export error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
