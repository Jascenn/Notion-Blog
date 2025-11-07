import { NextRequest, NextResponse } from 'next/server';
import { getPostViews, incrementPostViews } from '@/lib/kv';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET: 获取浏览次数
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const views = await getPostViews(slug);

    return NextResponse.json({ views }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error getting views:', error);
    return NextResponse.json(
      { error: 'Failed to get views', views: 0 },
      { status: 500 }
    );
  }
}

// POST: 增加浏览次数
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const views = await incrementPostViews(slug);

    return NextResponse.json({ views }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: 'Failed to increment views', views: 0 },
      { status: 500 }
    );
  }
}
