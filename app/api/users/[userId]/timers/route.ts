import { NextRequest, NextResponse } from 'next/server';
import { getTimersByUserId } from '@/lib/timerStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const timers = await getTimersByUserId(userId);
    return NextResponse.json({ timers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user timers:', error);
    return NextResponse.json({ error: 'Failed to fetch timers' }, { status: 500 });
  }
}
