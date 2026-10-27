import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { PageSettings } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  const page = await repository.pages.get(params.id);
  if (!page) {
    return NextResponse.json(
      { success: false, error: "Không tìm thấy Page." },
      { status: 404 }
    );
  }

  if (auth.user.role === "staff" && page.owner_staff_id !== auth.user.id) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền chỉnh sửa cài đặt page này." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const settings: PageSettings = {
      templates: Array.isArray(body.templates) ? body.templates : page.settings.templates,
      overrides: body.overrides || page.settings.overrides || {},
      avatar_ids: Array.isArray(body.avatar_ids) ? body.avatar_ids : page.settings.avatar_ids,
      music_mood: body.music_mood || page.settings.music_mood || "tram",
      selected_track_ids: Array.isArray(body.selected_track_ids)
        ? body.selected_track_ids
        : page.settings.selected_track_ids || [],
      background_categories: Array.isArray(body.background_categories)
        ? body.background_categories
        : page.settings.background_categories || ["hoa", "rung"],
      updated_at: new Date().toISOString(),
    };

    for (const avatarId of settings.avatar_ids) {
      const avatar = await repository.avatars.get(avatarId);
      if (!avatar || (avatar.owner_page_id && avatar.owner_page_id !== params.id)) return NextResponse.json({success:false,error:"Ảnh không thuộc page này."},{status:400});
    }
    const updated = await repository.pageSettings.update(params.id, settings);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Lỗi lưu cài đặt vào cơ sở dữ liệu." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu cài đặt page thành công. Cài đặt sẽ được áp dụng cho các lô dựng mới.",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi cập nhật cài đặt." },
      { status: 500 }
    );
  }
}
