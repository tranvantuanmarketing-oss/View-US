import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { repository } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetStaffId = body.staffId;

    const targetStaff = await repository.staff.get(targetStaffId);
    if (!targetStaff) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng được chọn." },
        { status: 404 }
      );
    }

    const token = signSession({
      id: targetStaff.id,
      name: targetStaff.name,
      email: targetStaff.email,
      role: targetStaff.role,
      web_domain: targetStaff.web_domain,
    });

    const res = NextResponse.json({
      success: true,
      message: `Đã chuyển đổi sang tài khoản: ${targetStaff.name} (${targetStaff.role === "admin" ? "Quản trị viên" : "Nhân viên"})`,
      user: {
        id: targetStaff.id,
        name: targetStaff.name,
        email: targetStaff.email,
        role: targetStaff.role,
        web_domain: targetStaff.web_domain,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi xử lý chuyển đổi tài khoản." },
      { status: 500 }
    );
  }
}
