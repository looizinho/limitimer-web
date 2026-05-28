import { NextRequest, NextResponse } from 'next/server';
import { getTimer, startTimer, pauseTimer, resetTimer, setTimerTime, markQrCodeScanned } from '@/lib/timerStorage';
import { TimerUpdate } from '@/types/timer';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timer = await getTimer(id);
    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }
    return NextResponse.json(timer);
  } catch (error) {
    console.error('Error fetching timer:', error);
    return NextResponse.json({ error: 'Failed to fetch timer' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as TimerUpdate;
    const { action, seconds } = body;

    let result;
    switch (action) {
      case 'start':
        result = await startTimer(id);
        break;
      case 'pause':
      case 'stop':
        result = await pauseTimer(id);
        break;
      case 'reset':
        result = await resetTimer(id);
        break;
      case 'set-time':
        if (seconds === undefined) {
          return NextResponse.json({ error: 'Seconds required for set-time action' }, { status: 400 });
        }
        result = await setTimerTime(id, seconds);
        break;
      case 'mark-qr-scanned':
        result = await markQrCodeScanned(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json({ error: 'Failed to update timer' }, { status: 500 });
  }
}
