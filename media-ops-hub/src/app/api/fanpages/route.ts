import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fanpages = await prisma.fanpage.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { country: 'asc' },
    });

    return NextResponse.json({ success: true, fanpages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi lấy danh sách fanpage' },
      { status: 500 }
    );
  }
}
