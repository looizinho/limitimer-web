import { NextRequest, NextResponse } from 'next/server';
import { createTimer } from '@/lib/timerStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const initialSeconds = body.initialSeconds || 60;

    const timerId = await createTimer(initialSeconds);

    return NextResponse.json(
      { id: timerId, initialSeconds },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating timer:', error);
    return NextResponse.json(
      { error: 'Failed to create timer' },
      { status: 500 }
    );
  }
}
