import { NextResponse } from 'next/server';
import { notifyPostPublished, notifyPostFailed, notifyDailyReport, sendTelegramMessage } from '@/lib/telegram';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type = 'TEST_CUSTOM', message } = body;

    let result = false;

    if (type === 'PUBLISHED') {
      result = await notifyPostPublished({
        pageName: 'Masques Tombés',
        country: 'FR',
        title: 'Tập 1: Bức thư tuyệt mệnh (Test Alert)',
        commentLink: 'https://thestorypress.online/fr/heritage-secret-beaumont',
        fbPostUrl: 'https://www.facebook.com/reel/1234567890',
      });
    } else if (type === 'FAILED') {
      result = await notifyPostFailed({
        pageName: 'Verborgen Waarheden',
        title: 'Aflevering 1: De Confrontatie (Test Alert)',
        errorMessage: 'Trình duyệt bị timeout khi upload video lên Studio Reel!',
      });
    } else if (type === 'DAILY_REPORT') {
      const publishedCount = await prisma.post.count({ where: { status: 'PUBLISHED' } });
      const scheduledCount = await prisma.post.count({ where: { status: 'SCHEDULED' } });
      const failedCount = await prisma.post.count({ where: { status: 'FAILED' } });
      const pages = await prisma.fanpage.findMany();

      result = await notifyDailyReport({
        totalPublished: publishedCount,
        totalScheduled: scheduledCount,
        totalFailed: failedCount,
        pageBreakdown: pages.map((p) => ({
          pageName: p.name,
          country: p.country,
          count: Math.floor(Math.random() * 5) + 1,
        })),
      });
    } else {
      result = await sendTelegramMessage(
        message || '🔔 <b>[TEST TELEGRAM BOT]</b> Hệ thống Media Ops Hub kết nối ổn định!',
        'HTML'
      );
    }

    return NextResponse.json({
      success: true,
      deliveredToTelegram: result,
      message: result
        ? 'Đã gửi thông báo đến Telegram thành công!'
        : 'Đã xử lý thông báo (nếu chưa cấu hình Token thật, hệ thống đã lưu vào Audit Log).',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi gửi tin test Telegram' },
      { status: 500 }
    );
  }
}
