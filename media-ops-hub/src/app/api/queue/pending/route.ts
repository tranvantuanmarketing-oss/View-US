import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();

    // Tìm bài viết có status là SCHEDULED và scheduledAt <= hiện tại, ưu tiên bài có lịch sớm nhất
    const pendingPost = await prisma.post.findFirst({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        fanpage: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    if (!pendingPost) {
      return NextResponse.json({
        hasPost: false,
        message: 'Không có bài nào trong hàng đợi cần đăng tại thời điểm này.',
        serverTime: now.toISOString(),
      });
    }

    return NextResponse.json({
      hasPost: true,
      serverTime: now.toISOString(),
      post: {
        id: pendingPost.id,
        pageCode: pendingPost.fanpage.code,
        pageName: pendingPost.fanpage.name,
        country: pendingPost.fanpage.country,
        title: pendingPost.title,
        videoPath: pendingPost.videoPath,
        caption: pendingPost.caption,
        commentLink: pendingPost.commentLink,
        scheduledAt: pendingPost.scheduledAt,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/queue/pending:', error);
    return NextResponse.json(
      {
        hasPost: false,
        error: error?.message || 'Lỗi truy vấn hàng đợi bài đăng',
      },
      { status: 500 }
    );
  }
}
