import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { Gender } from "@/lib/types";

export async function GET(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  const avatars = await repository.avatars.list();
  const pages = await repository.pages.list();

  // Enhance each avatar with human-readable page names where it is used
  const pageId = req.nextUrl.searchParams.get("page_id");
  const selected = pages.find(p => p.id === pageId)?.settings.avatar_ids || [];
  const scoped = pageId ? avatars.filter(a => a.owner_page_id === pageId || (!a.owner_page_id && selected.includes(a.id))) : avatars;
  const enhanced = scoped.map((av) => {
    const usedPages = pages.filter((p) => av.used_by_page_ids.includes(p.id));
    return {
      ...av,
      used_page_names: usedPages.map((p) => p.name),
    };
  });

  return NextResponse.json({
    success: true,
    data: enhanced,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, image_path, gender, age_min, age_max, page_id } = body;

    if (!name || !image_path) {
      return NextResponse.json(
        { success: false, error: "Tên và đường dẫn ảnh là bắt buộc." },
        { status: 400 }
      );
    }

    const newAvatar = await repository.avatars.create({
      name: name.trim(),
      image_path: image_path.trim(),
      gender: (gender === "nam" ? "nam" : "nu") as Gender,
      age_min: Number(age_min) || 25,
      age_max: Number(age_max) || 45,
      used_by_page_ids: page_id ? [page_id] : [],
    });

    return NextResponse.json({
      success: true,
      data: newAvatar,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tạo avatar." },
      { status: 500 }
    );
  }
}
