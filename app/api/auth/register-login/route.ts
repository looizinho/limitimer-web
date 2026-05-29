import { NextRequest, NextResponse } from 'next/server';
import { createUser, loginUser, validateUsername, validatePin } from '@/lib/userStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, pin } = body as { username?: string; pin?: string };

    if (!username || !pin) {
      return NextResponse.json(
        { error: 'Username and PIN are required' },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid username format. Use 3-20 lowercase letters only.' },
        { status: 400 }
      );
    }

    if (!validatePin(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits.' },
        { status: 400 }
      );
    }

    // Try to login first
    const user = await loginUser(username, pin);

    if (user) {
      return NextResponse.json(
        { userId: user.userId, username: user.username, isNewUser: false },
        { status: 200 }
      );
    }

    // If login failed, try to create new user
    try {
      const newUser = await createUser(username, pin);
      return NextResponse.json(
        { userId: newUser.userId, username: newUser.username, isNewUser: true },
        { status: 201 }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage === 'Username already taken') {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
