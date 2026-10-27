import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const { concurrency } = body;
    if (typeof concurrency === "number") {
      const success = await repository.helpers.updateConcurrency(id, concurrency);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ success: false, error: "Tham số concurrency không hợp lệ." }, { status: 400 });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/helpers/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const success = await repository.helpers.revoke(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/helpers/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
