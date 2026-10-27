import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { Gender } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.gender !== undefined) updates.gender = (body.gender === "nam" ? "nam" : "nu") as Gender;
    if (body.age_min !== undefined) updates.age_min = Number(body.age_min);
    if (body.age_max !== undefined) updates.age_max = Number(body.age_max);

    const updated = await repository.avatars.update(params.id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy avatar." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi cập nhật avatar." },
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

  const deleted = await repository.avatars.delete(params.id);
  return NextResponse.json({
    success: deleted,
    message: deleted ? "Đã xoá avatar thành công." : "Không thể xoá avatar.",
  });
}
