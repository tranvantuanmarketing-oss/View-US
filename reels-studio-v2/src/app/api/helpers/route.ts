import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const helpers = await repository.helpers.list(user.role === "admin" ? undefined : user.id);
    return NextResponse.json({ success: true, data: helpers });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/helpers error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { name, os = "mac", version = "v2.0" } = body;
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Tên máy dựng là bắt buộc." }, { status: 400 });
    }

    const helperId = `helper_${Date.now()}`;
    // Generate secure API key
    const rawKey = `hlp_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const now = new Date().toISOString();

    const db = getDb();
    db.prepare(`
      INSERT INTO helpers (id, staff_id, name, key_hash, os, version, concurrency, cache_mb, last_seen_at, revoked, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      helperId,
      user.id,
      name.trim(),
      keyHash,
      os,
      version,
      2,
      0,
      now,
      0,
      now
    );

    return NextResponse.json({
      success: true,
      data: {
        id: helperId,
        name: name.trim(),
        key: rawKey, // Show only once upon registration
        os,
        version,
        message: "Lưu key này cẩn thận để cấu hình worker. Key sẽ không hiển thị lại.",
      },
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/helpers error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
