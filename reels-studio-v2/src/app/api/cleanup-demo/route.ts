import { NextRequest, NextResponse } from "next/server";
import { getDemoDataCounts, purgeDemoData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = getDemoDataCounts();
    return NextResponse.json({ success: true, data: stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = purgeDemoData();
    const remaining = getDemoDataCounts();
    return NextResponse.json({
      success: true,
      message: `Đã dọn thành công ${result.deletedCount} bản ghi mẫu.`,
      remaining,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
