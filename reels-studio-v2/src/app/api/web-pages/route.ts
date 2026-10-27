import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const db = getDb();

    // List websites
    const websites = await repository.websites.list(user.role === "admin" ? undefined : user.id);

    // List pages with website information
    const pages = await repository.pages.list(user.role === "admin" ? undefined : user.id);

    return NextResponse.json({
      success: true,
      data: {
        websites,
        pages,
        isAdmin: user.role === "admin",
      },
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/web-pages error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { name, domain, slug } = body;
    if (!name?.trim() || !domain?.trim()) {
      return NextResponse.json({ success: false, error: "Tên website và domain là bắt buộc." }, { status: 400 });
    }

    const created = await repository.websites.create({
      name: name.trim(),
      domain: domain.trim().toLowerCase().replace(/^https?:\/\//, ""),
      slug: (slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      owner_id: user.id,
      status: "approved",
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/web-pages error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID website là bắt buộc." }, { status: 400 });
    }

    const db = getDb();
    const res = db.prepare("DELETE FROM websites WHERE id = ?").run(id);
    return NextResponse.json({ success: res.changes > 0 });
  } catch (err: any) {
    console.error("DELETE /api/web-pages error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Chỉ quản trị viên mới có quyền duyệt website." }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json({ success: false, error: "ID và trạng thái hợp lệ là bắt buộc." }, { status: 400 });
    }

    const success = await repository.websites.updateStatus(id, status);
    return NextResponse.json({ success });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/web-pages error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
