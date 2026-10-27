import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const localeFilter = searchParams.get("locale");

    let sql = `
      SELECT 
        b.id,
        b.name,
        b.page_id,
        b.staff_id,
        COALESCE(u.name, 'Chủ hệ thống') as staff_name,
        COALESCE(p.name, 'Lô tự do') as page_name,
        COALESCE(json_extract(b.settings_snapshot_json,'$.locale'),p.locale,'en') as locale,
        b.count,
        b.done_count,
        b.failed_count,
        b.status,
        b.created_at,
        b.finished_at
      FROM batches b
      LEFT JOIN users u ON b.staff_id = u.id
      LEFT JOIN pages p ON b.page_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
      sql += ` AND COALESCE(b.finished_at,b.created_at) >= ?`;
      params.push(/^\d{4}-\d{2}-\d{2}$/.test(startDate)?new Date(startDate+"T00:00:00+07:00").toISOString():startDate);
    }
    if (endDate) {
      sql += ` AND COALESCE(b.finished_at,b.created_at) <= ?`;
      params.push(/^\d{4}-\d{2}-\d{2}$/.test(endDate)?new Date(endDate+"T23:59:59.999+07:00").toISOString():endDate);
    }
    if (localeFilter && localeFilter !== "all") {
      sql += ` AND COALESCE(json_extract(b.settings_snapshot_json,'$.locale'),p.locale,'en') = ?`;
      params.push(localeFilter);
    }

    sql += ` ORDER BY b.created_at DESC`;

    const completedBatches = db.prepare(sql).all(...params) as any[];

    // Compute stats matrix: Date / Page / Locale
    const staffMap: Record<string, { staff: string; nl: number; fr: number; es: number; en: number; de: number; pl: number; total: number }> = {};
    const pageBreakdown: Array<{ page: string; lang: string; staff: string; count: number; page_id: string }> = [];

    for (const b of completedBatches) {
      const staffName = b.staff_name || "Chủ hệ thống";
      const count = b.done_count || 0;
      const locale = (b.locale || "en").toLowerCase();

      if (!staffMap[staffName]) {
        staffMap[staffName] = { staff: staffName, nl: 0, fr: 0, es: 0, en: 0, de: 0, pl: 0, total: 0 };
      }

      if (locale.includes("nl")) staffMap[staffName].nl += count;
      else if (locale.includes("fr")) staffMap[staffName].fr += count;
      else if (locale.includes("es")) staffMap[staffName].es += count;
      else if (locale.includes("de")) staffMap[staffName].de += count;
      else if (locale.includes("pl")) staffMap[staffName].pl += count;
      else staffMap[staffName].en += count;

      staffMap[staffName].total += count;

      // Page breakdown
      const existingPage = pageBreakdown.find((p) => p.page_id === b.page_id);
      if (existingPage) {
        existingPage.count += count;
      } else {
        pageBreakdown.push({
          page: b.page_name || b.page_id || "Lô tự do",
          page_id: b.page_id || "free",
          lang: (b.locale || "EN").toUpperCase(),
          staff: staffName,
          count,
        });
      }
    }

    const matrixData = Object.values(staffMap);
    const totalVideos = matrixData.reduce((acc, curr) => acc + curr.total, 0);

    return NextResponse.json({
      success: true,
      data: {
        matrixData,
        pageBreakdown,
        totalVideos,
        totalBatches: completedBatches.length,
      },
    });
  } catch (err: any) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
