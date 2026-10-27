import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { publicAsset } from "@/lib/renderEngine";
import { getCurrentUser } from "@/lib/auth";
import { normalizeLocale, resolveStoryLocale } from "@/lib/locales";
import { pageTrackPool, pageMusicPlan } from "@/lib/studioPageConfig";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const batches = await repository.batches.list(user?.role === "admin" ? undefined : user?.id);
    return NextResponse.json({ success: true, data: batches });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const itemSchema = z.object({
      template_id:z.string().min(1),palette_id:z.string().min(1),avatar_id:z.string().nullable().optional(),
      music_track_id:z.string().nullable().optional(),background_video_url:z.string(),
      duration:z.number().finite().min(1).max(180),resolution:z.enum(["720x1280","1080x1920","1440x2560"]),
      story_payload:z.object({content:z.string().min(1).max(20000)}).passthrough(),
    });
    const body = z.object({page_id:z.string().default("free"),name:z.string().max(200).optional(),locale:z.string().max(10).default("en"),
      mode:z.string().optional(),music_seed:z.number().int().min(0).max(4294967295).optional(),target_helper_id:z.string().nullable().optional(),items:z.array(itemSchema).min(1).max(200)}).parse(await req.json());
    const page = await repository.pages.get(body.page_id);
    if (!page) throw new Error("Page không tồn tại.");
    body.locale = normalizeLocale(body.page_id === "free" ? body.locale : page.locale) || "en";
    const templates = await repository.templates.list();
    const musicSeed = body.music_seed ?? (Date.now() >>> 0);
    const pageTracks = body.page_id !== "free" ? pageTrackPool(page, await repository.music.list()) : [];
    const plan = pageMusicPlan(pageTracks, body.items.length, musicSeed);
    for(let index = 0; index < body.items.length; index++) {
      const item = body.items[index];
      const template=templates.find(t=>t.id===item.template_id);
      if(!template?.pals.some(p=>p.id===item.palette_id)) throw new Error("Mẫu hoặc bảng màu không hợp lệ.");
      publicAsset(item.background_video_url);
      const story=item.story_payload as any;
      story.locale = resolveStoryLocale(story, body.locale, body.page_id === "free" ? undefined : page.locale);
      story.renderConfig ||= {};
      // Resolve the page playlist on the server as well, including older clients that
      // submit one fixed track for the whole batch. Store the result once for retries.
      if (body.page_id !== "free") {
        if (!story.renderConfig.muted && !plan.length) throw new Error("Page chưa có nhạc khả dụng. Chọn/lưu nhạc trong Cài đặt page hoặc tắt nhạc.");
        item.music_track_id = story.renderConfig.muted ? null : plan[index]?.id || null;
        story.renderConfig.musicSeed = musicSeed;
        story.renderConfig.musicMode = "page-random";
      }
      delete story.renderConfig.trackPath;
      if(item.music_track_id && !story.renderConfig.muted) {
        const track=await repository.music.get(item.music_track_id);
        if(!track) throw new Error("Không tìm thấy bản nhạc đã chọn.");
        publicAsset(track.file_path);story.renderConfig.trackPath=track.file_path;
      }
      if(item.avatar_id) {
        const avatar=await repository.avatars.get(item.avatar_id);
        if(!avatar) throw new Error("Không tìm thấy avatar đã chọn.");
        if(avatar.owner_page_id && avatar.owner_page_id !== body.page_id) throw new Error("Ảnh này thuộc page khác.");
        story.avatarUrl=avatar.image_path;
      }
    }
    if(!await repository.pages.get(body.page_id)) throw new Error("Page không tồn tại.");
    const { page_id, name, items, target_helper_id, locale, mode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Danh sách video rỗng" }, { status: 400 });
    }

    const newBatch = await repository.batches.create(
      {
        page_id: page_id || "free",
        owner_staff_id: user.id,
        name: name || `Lô video ${new Date().toLocaleDateString("vi-VN")}`,
        total_items: items.length,
        target_helper_id: target_helper_id || null,
        locale: locale || "en",
        mode: mode || "system",
      },
      items
    );

    return NextResponse.json({ success: true, data: newBatch });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
