import { NextRequest, NextResponse } from "next/server";
import { getSession, signSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { repository } from "@/lib/repository";

export async function GET(req: NextRequest) {
  let session = await getSession();

  // If no session exists, default to Staff 1 (Phan Hà) so user can immediately browse
  if (!session) {
    const defaultStaff = (await repository.staff.get("staff_01")) || {
      id: "staff_01",
      name: "Phan Hà",
      email: "phanha@danhngon.pro",
      role: "staff" as const,
      web_domain: "bestnovel.danhngon.pro",
      created_at: new Date().toISOString(),
    };

    const token = signSession({
      id: defaultStaff.id,
      name: defaultStaff.name,
      email: defaultStaff.email,
      role: defaultStaff.role,
      web_domain: defaultStaff.web_domain,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: defaultStaff.id,
        name: defaultStaff.name,
        email: defaultStaff.email,
        role: defaultStaff.role,
        web_domain: defaultStaff.web_domain,
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
  }

  return NextResponse.json({
    success: true,
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      web_domain: session.web_domain,
    },
  });
}
