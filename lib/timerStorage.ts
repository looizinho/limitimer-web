import { randomBytes } from 'crypto';
import { TimerRecord, Timer } from '@/types/timer';

const store = new Map<string, TimerRecord>();

function generateId(): string {
  return randomBytes(8).toString('hex');
}

function computeCurrentSeconds(record: TimerRecord): number {
  if (record.state === 'finished') return 0;
  if (record.state === 'paused' || record.startedAt === null) {
    return record.secondsWhenPaused;
  }
  const elapsedSeconds = (Date.now() - record.startedAt) / 1000;
  return Math.max(0, record.secondsWhenPaused - elapsedSeconds);
}

function toTimer(record: TimerRecord): Timer {
  return {
    id: record.id,
    initialSeconds: record.initialSeconds,
    currentSeconds: Math.floor(computeCurrentSeconds(record)),
    state: record.state,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function createTimer(initialSeconds: number): string {
  const id = generateId();
  const now = Date.now();
  store.set(id, {
    id,
    initialSeconds,
    secondsWhenPaused: initialSeconds,
    startedAt: null,
    state: 'paused',
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export function getTimer(id: string): Timer | null {
  const record = store.get(id);
  if (!record) return null;

  const current = computeCurrentSeconds(record);
  if (record.state === 'running' && current <= 0) {
    const finished: TimerRecord = { ...record, state: 'finished', secondsWhenPaused: 0, startedAt: null, updatedAt: Date.now() };
    store.set(id, finished);
    return toTimer(finished);
  }

  return toTimer(record);
}

export function startTimer(id: string): Timer | null {
  const record = store.get(id);
  if (!record) return null;
  if (record.state === 'running') return toTimer(record);

  const current = computeCurrentSeconds(record);
  if (current <= 0) return toTimer(record);

  const updated: TimerRecord = {
    ...record,
    state: 'running',
    startedAt: Date.now(),
    secondsWhenPaused: current,
    updatedAt: Date.now(),
  };
  store.set(id, updated);
  return toTimer(updated);
}

export function pauseTimer(id: string): Timer | null {
  const record = store.get(id);
  if (!record) return null;

  const current = computeCurrentSeconds(record);
  const updated: TimerRecord = {
    ...record,
    state: 'paused',
    startedAt: null,
    secondsWhenPaused: current,
    updatedAt: Date.now(),
  };
  store.set(id, updated);
  return toTimer(updated);
}

export function resetTimer(id: string): Timer | null {
  const record = store.get(id);
  if (!record) return null;

  const updated: TimerRecord = {
    ...record,
    state: 'paused',
    startedAt: null,
    secondsWhenPaused: record.initialSeconds,
    updatedAt: Date.now(),
  };
  store.set(id, updated);
  return toTimer(updated);
}

export function setTimerTime(id: string, seconds: number): Timer | null {
  const record = store.get(id);
  if (!record) return null;

  const updated: TimerRecord = {
    ...record,
    initialSeconds: seconds,
    secondsWhenPaused: seconds,
    startedAt: null,
    state: 'paused',
    updatedAt: Date.now(),
  };
  store.set(id, updated);
  return toTimer(updated);
}
