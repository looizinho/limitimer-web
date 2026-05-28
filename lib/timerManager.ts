import { Timer } from '@/types/timer';
import { getTimer, updateTimer } from './timerStorage';

const activeIntervals = new Map<string, NodeJS.Timeout>();
const broadcastCallbacks = new Map<string, Set<(timer: Timer) => void>>();

export function onTimerChange(timerId: string, callback: (timer: Timer) => void) {
  if (!broadcastCallbacks.has(timerId)) {
    broadcastCallbacks.set(timerId, new Set());
  }
  broadcastCallbacks.get(timerId)?.add(callback);

  return () => {
    broadcastCallbacks.get(timerId)?.delete(callback);
  };
}

async function broadcastTimerChange(timerId: string, timer: Timer) {
  const callbacks = broadcastCallbacks.get(timerId);
  if (callbacks) {
    callbacks.forEach((cb) => cb(timer));
  }
}

function startCountdown(timerId: string) {
  if (activeIntervals.has(timerId)) {
    return;
  }

  const interval = setInterval(async () => {
    const timer = await getTimer(timerId);
    if (!timer) {
      clearInterval(interval);
      activeIntervals.delete(timerId);
      return;
    }

    if (timer.state !== 'running') {
      clearInterval(interval);
      activeIntervals.delete(timerId);
      return;
    }

    const newSeconds = timer.currentSeconds - 1;
    const newState = newSeconds <= 0 ? 'finished' : 'running';
    const updated = await updateTimer(timerId, {
      currentSeconds: Math.max(0, newSeconds),
      state: newState,
    });

    if (updated) {
      await broadcastTimerChange(timerId, updated);
    }

    if (newState === 'finished') {
      clearInterval(interval);
      activeIntervals.delete(timerId);
    }
  }, 1000);

  activeIntervals.set(timerId, interval);
}

function stopCountdown(timerId: string) {
  const interval = activeIntervals.get(timerId);
  if (interval) {
    clearInterval(interval);
    activeIntervals.delete(timerId);
  }
}

export async function startTimer(timerId: string): Promise<Timer | null> {
  const timer = await getTimer(timerId);
  if (!timer) return null;

  if (timer.state === 'running') return timer;

  const updated = await updateTimer(timerId, { state: 'running' });
  if (updated) {
    startCountdown(timerId);
    await broadcastTimerChange(timerId, updated);
  }
  return updated;
}

export async function pauseTimer(timerId: string): Promise<Timer | null> {
  const timer = await getTimer(timerId);
  if (!timer) return null;

  stopCountdown(timerId);
  const updated = await updateTimer(timerId, { state: 'paused' });
  if (updated) {
    await broadcastTimerChange(timerId, updated);
  }
  return updated;
}

export async function resetTimer(timerId: string): Promise<Timer | null> {
  const timer = await getTimer(timerId);
  if (!timer) return null;

  stopCountdown(timerId);
  const updated = await updateTimer(timerId, {
    currentSeconds: timer.initialSeconds,
    state: 'paused',
  });
  if (updated) {
    await broadcastTimerChange(timerId, updated);
  }
  return updated;
}

export async function setTimerTime(timerId: string, seconds: number): Promise<Timer | null> {
  const timer = await getTimer(timerId);
  if (!timer) return null;

  const updated = await updateTimer(timerId, {
    initialSeconds: seconds,
    currentSeconds: seconds,
    state: 'paused',
  });
  if (updated) {
    await broadcastTimerChange(timerId, updated);
  }
  return updated;
}

export async function restartTimer(timerId: string): Promise<Timer | null> {
  const timer = await getTimer(timerId);
  if (!timer) return null;

  stopCountdown(timerId);
  const updated = await updateTimer(timerId, {
    currentSeconds: timer.initialSeconds,
    state: 'running',
  });
  if (updated) {
    startCountdown(timerId);
    await broadcastTimerChange(timerId, updated);
  }
  return updated;
}

export function cleanupTimer(timerId: string) {
  stopCountdown(timerId);
  broadcastCallbacks.delete(timerId);
}
