import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { normalizeLocale } from "@/lib/locales";

export async function GET(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { user } = auth;
  const pages = await repository.pages.list(user.role === "admin" ? undefined : user.id);
  const staffList = await repository.staff.list();

  // Attach owner staff info
  const enrichedPages = pages.map((p) => {
    const owner = staffList.find((s) => s.id === p.owner_staff_id);
    return {
      ...p,
      owner_name: owner ? owner.name : "Chưa gán",
      owner_web: owner ? owner.web_domain : "",
    };
  });

  return NextResponse.json({
    success: true,
    data: enrichedPages,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, locale, owner_staff_id } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên Page." },
        { status: 400 }
      );
    }

    if (!locale) {
      return NextResponse.json(
        { success: false, error: "Vui lòng chọn ngôn ngữ (locale)." },
        { status: 400 }
      );
    }

    const newPage = await repository.pages.create({
      name: name.trim(),
      locale: normalizeLocale(locale),
      owner_staff_id: owner_staff_id || auth.user.id,
      settings: {
        templates: [],
        avatar_ids: [],
        music_mood: "tram",
        selected_track_ids: [],
        background_categories: ["hoa", "rung"],
        overrides: {},
        updated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: newPage,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tạo page mới." },
      { status: 500 }
    );
  }
}
