import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { enqueueTelegramNotification, dispatchTelegramOutbox, startTelegramDeliveryWorker } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    startTelegramDeliveryWorker();
    const db = getDb();

    const configured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
    const events = db.prepare("SELECT * FROM telegram_outbox ORDER BY created_at DESC LIMIT 50").all();

    return NextResponse.json({
      success: true,
      data: {
        configured,
        botUsername: null,
        chatIdMasked: process.env.TELEGRAM_CHAT_ID ? `${process.env.TELEGRAM_CHAT_ID.slice(0, 4)}***` : null,
        events,
      },
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/telegram error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));

    if (body.action === "dispatch") {
      const result = await dispatchTelegramOutbox();
      return NextResponse.json({ success: true, result });
    }

    if (body.action === "test_event") {
      const eventId = await enqueueTelegramNotification({
        eventType: "batch_queued",
        title: "Test thông báo hệ thống The Story",
        details: {
          sender: user.name,
          role: user.role,
          note: "Kiểm tra tích hợp Telegram Outbox",
        },
      });

      // Attempt dispatch
      const dispatchRes = await dispatchTelegramOutbox();
      return NextResponse.json({ success: true, eventId, dispatchRes });
    }

    return NextResponse.json({ success: false, error: "Action không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/telegram error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
