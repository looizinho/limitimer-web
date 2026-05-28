import { NextRequest, NextResponse } from 'next/server';
import { getTimer, updateTimer } from '@/lib/timerStorage';
import {
  startTimer,
  pauseTimer,
  resetTimer,
  setTimerTime,
  restartTimer,
} from '@/lib/timerManager';
import { TimerUpdate } from '@/types/timer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const timer = await getTimer(params.id);
    if (!timer) {
      return NextResponse.json(
        { error: 'Timer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(timer);
  } catch (error) {
    console.error('Error fetching timer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as TimerUpdate;
    const { action, seconds } = body;

    let result;
    switch (action) {
      case 'start':
        result = await startTimer(params.id);
        break;
      case 'pause':
        result = await pauseTimer(params.id);
        break;
      case 'reset':
        result = await resetTimer(params.id);
        break;
      case 'stop':
        result = await pauseTimer(params.id);
        break;
      case 'set-time':
        if (seconds === undefined) {
          return NextResponse.json(
            { error: 'Seconds required for set-time action' },
            { status: 400 }
          );
        }
        result = await setTimerTime(params.id, seconds);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Timer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json(
      { error: 'Failed to update timer' },
      { status: 500 }
    );
  }
}
