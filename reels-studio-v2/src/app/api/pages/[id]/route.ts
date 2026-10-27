import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { normalizeLocale } from "@/lib/locales";

export async function GET(
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

  // Permission check: if staff, only owner can view
  if (auth.user.role === "staff" && page.owner_staff_id !== auth.user.id) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền truy cập page này." },
      { status: 403 }
    );
  }

  const staff = page.owner_staff_id
    ? await repository.staff.get(page.owner_staff_id)
    : null;

  return NextResponse.json({
    success: true,
    data: {
      ...page,
      owner_name: staff ? staff.name : "Chưa gán",
      owner_web: staff ? staff.web_domain : "",
    },
  });
}

export async function PATCH(
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
      { success: false, error: "Bạn không có quyền chỉnh sửa page này." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { display_name, name, locale } = body;

    const updated = await repository.pages.update(params.id, {
      display_name: display_name !== undefined ? String(display_name).trim() : undefined,
      name: name !== undefined ? String(name).trim() : undefined,
      locale: locale !== undefined ? normalizeLocale(locale) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật thông tin Page thành công.",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Lỗi cập nhật page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  if (auth.user.role !== "admin" && page.owner_staff_id !== auth.user.id) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền xoá page này." },
      { status: 403 }
    );
  }

  let deleted = false;
  try { deleted = await repository.pages.delete(params.id); }
  catch(error:any) {return NextResponse.json({success:false,error:error.message},{status:409});}
  return NextResponse.json({
    success: deleted,
    message: deleted ? "Đã xoá page thành công." : "Không thể xoá page.",
  });
}

