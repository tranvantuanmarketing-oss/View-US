import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exportBaseName, exportStoryText } from "@/lib/batchExport";
import { repository } from "@/lib/repository";
import { ZipArchive } from "archiver";
import fs from "fs";
import path from "path";
import { PassThrough, Readable } from "stream";

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

    const itemId=req.nextUrl.searchParams.get("item");
    const partial=Boolean(itemId) || req.nextUrl.searchParams.get("partial")==="true";
    const ready=items.filter(i=>i.status==="completed");
    if(!ready.length || (!partial && ready.length!==items.length)) return NextResponse.json({success:false,error:"Lô chưa có đủ video. Chọn tải phần đã hoàn tất hoặc chờ dựng xong."},{status:409});
    for(const item of ready) {
      const root=path.resolve(process.cwd(),"public/renders")+path.sep;
      if(!item.output_path || !path.resolve(item.output_path).startsWith(root) || !fs.existsSync(item.output_path))
        return NextResponse.json({success:false,error:`Thiếu video #${item.seq}; hãy dựng lại.`},{status:409});
    }
    const page = await repository.pages.get(batch.page_id);
    const snapshot = batch.settings_snapshot as {page_name?:string;locale?:string} | undefined;
    const pageName = snapshot?.page_name || page?.name || "Lo_tu_do";
    if(itemId) {
      const item = ready.find(i => i.id === itemId);
      if(!item) return NextResponse.json({success:false,error:"Video chưa hoàn thành hoặc không thuộc lô."},{status:409});
      const payload=typeof item.story_payload === "string" ? JSON.parse(item.story_payload) : item.story_payload;
      const base=exportBaseName(pageName,batch.id,item.seq);
      if(req.nextUrl.searchParams.get("format")==="txt") return new Response("\uFEFF"+exportStoryText(payload),{headers:{"Content-Type":"text/plain; charset=utf-8","Content-Disposition":`attachment; filename="${base}.txt"`}});
      return new Response(Readable.toWeb(fs.createReadStream(item.output_path!)) as ReadableStream,{headers:{"Content-Type":"video/mp4","Content-Disposition":`attachment; filename="${base}.mp4"`}});
    }

    const archive = new ZipArchive({ zlib: { level: 6 } });
    const passthrough = new PassThrough();

    archive.pipe(passthrough);

    // 1. Add manifest.json
    const manifest = {
      batchId: batch.id,
      batchName: batch.name,
      pageName,
      locale: snapshot?.locale || page?.locale || "en",
      createdAt: batch.created_at,
      totalItems: items.length,
      items: items.map((i) => ({
        seq: i.seq,
        id: i.id,
        template_id: i.template_id,
        status: i.status,
        file: i.status === "completed" ? `${exportBaseName(pageName,batch.id,i.seq)}.mp4` : null,
        textFile: i.status === "completed" ? `${exportBaseName(pageName,batch.id,i.seq)}.txt` : null,
        story: typeof i.story_payload === "string" ? JSON.parse(i.story_payload) : i.story_payload,
      })),
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });

    // 2. Add captions & comments for each story
    for (const item of ready) {
      const payload = typeof item.story_payload === "string" ? JSON.parse(item.story_payload) : item.story_payload;
      const baseName = exportBaseName(pageName,batch.id,item.seq);
      archive.append("\uFEFF"+exportStoryText(payload), { name: `${baseName}.txt` });

      // If output video exists on disk, add it
      let videoFile: string | null = null;
      if (item.output_path && fs.existsSync(item.output_path)) {
        videoFile = item.output_path;
      } else if (item.output_video_url) {
        const candidate = path.join(process.cwd(), "public", item.output_video_url.replace(/^\//, ""));
        if (fs.existsSync(candidate)) videoFile = candidate;
      }

      if (videoFile) {
        archive.file(videoFile, { name: `${baseName}.mp4` });
      }
    }

    archive.on("error", error=>passthrough.destroy(error));
    void archive.finalize().catch(error=>passthrough.destroy(error));

    return new Response(Readable.toWeb(passthrough) as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="batch_${batch.id}.zip"`,
      },
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/batches/[id]/download error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
