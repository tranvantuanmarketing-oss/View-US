import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyPostPublished, notifyPostFailed } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, status, fbPostUrl, errorMessage } = body;

    if (!postId || !status) {
      return NextResponse.json(
        { success: false, message: 'Thiếu postId hoặc status trong body yêu cầu.' },
        { status: 400 }
      );
    }

    // 1. Kiểm tra bài viết tồn tại
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { fanpage: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy bài viết với ID: ${postId}` },
        { status: 404 }
      );
    }

    const now = new Date();
    const isSuccess = status === 'PUBLISHED';

    // 2. Cập nhật trạng thái bài viết trong DB
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: status,
        publishedAt: isSuccess ? now : null,
        fbPostUrl: fbPostUrl || null,
        errorMessage: isSuccess ? null : (errorMessage || 'Lỗi không xác định khi đăng'),
      },
      include: {
        fanpage: true,
      },
    });

    // 3. Kích hoạt thông báo Telegram tương ứng
    let telegramNotified = false;
    if (isSuccess) {
      telegramNotified = await notifyPostPublished({
        pageName: updatedPost.fanpage.name,
        country: updatedPost.fanpage.country,
        title: updatedPost.title,
        commentLink: updatedPost.commentLink,
        fbPostUrl: updatedPost.fbPostUrl,
      });
    } else {
      telegramNotified = await notifyPostFailed({
        pageName: updatedPost.fanpage.name,
        title: updatedPost.title,
        errorMessage: updatedPost.errorMessage || 'Thất bại không rõ nguyên nhân',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật bài đăng thành trạng thái ${status}`,
      telegramNotified,
      post: updatedPost,
    });
  } catch (error: any) {
    console.error('Error in POST /api/queue/callback:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Lỗi xử lý callback từ Auto-post tool',
      },
      { status: 500 }
    );
  }
}
