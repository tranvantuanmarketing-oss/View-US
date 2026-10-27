import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang');

    const where: any = {};
    if (lang && lang !== 'ALL') where.lang = lang.toLowerCase();

    const articles = await prisma.blogArticle.findMany({
      where,
      orderBy: { clickCount: 'desc' },
    });

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi tải danh sách bài viết blog' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url, lang, category } = body;

    if (!title || !url || !lang) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp tiêu đề, URL và ngôn ngữ' },
        { status: 400 }
      );
    }

    const article = await prisma.blogArticle.create({
      data: {
        title,
        url,
        lang: lang.toLowerCase(),
        category: category || 'General',
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi thêm link bài viết' },
      { status: 500 }
    );
  }
}
