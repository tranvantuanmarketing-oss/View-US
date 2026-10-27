import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fanpageId = searchParams.get('fanpageId');
    const status = searchParams.get('status');

    const where: any = {};
    if (fanpageId && fanpageId !== 'ALL') where.fanpageId = fanpageId;
    if (status && status !== 'ALL') where.status = status;

    const posts = await prisma.post.findMany({
      where,
      include: {
        fanpage: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi tải danh sách bài viết' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fanpageId, title, videoPath, caption, commentLink, scheduledAt, status } = body;

    if (!fanpageId || !title || !videoPath || !caption) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        fanpageId,
        title,
        videoPath,
        caption,
        commentLink: commentLink || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: status || 'SCHEDULED',
      },
      include: {
        fanpage: true,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi tạo bài viết mới' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu post ID cần xóa' },
        { status: 400 }
      );
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa bài viết thành công' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi xóa bài viết' },
      { status: 500 }
    );
  }
}
