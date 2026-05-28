import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { TimerRecord, Timer } from '@/types/timer';

const TIMERS_DIR = path.join(process.cwd(), '.timers');

const inMemoryCache = new Map<string, TimerRecord>();

async function tryEnsureTimersDir(): Promise<boolean> {
  try {
    await fs.mkdir(TIMERS_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

async function tryWriteFile(filePath: string, data: string): Promise<void> {
  try {
    await fs.writeFile(filePath, data);
  } catch {
    // Filesystem is read-only (e.g. Vercel) — in-memory cache is the source of truth
  }
}

async function tryReadFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function generateId(): string {
  return randomBytes(8).toString('hex');
}

export function computeCurrentSeconds(record: TimerRecord): number {
  if (record.state === 'finished') return 0;
  if (record.state === 'paused' || record.startedAt === null) {
    return record.secondsWhenPaused;
  }
  const elapsedSeconds = (Date.now() - record.startedAt) / 1000;
  return Math.max(0, record.secondsWhenPaused - elapsedSeconds);
}

export function recordToTimer(record: TimerRecord): Timer {
  return {
    id: record.id,
    initialSeconds: record.initialSeconds,
    currentSeconds: Math.floor(computeCurrentSeconds(record)),
    state: record.state,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function createTimer(initialSeconds: number): Promise<string> {
  await tryEnsureTimersDir();

  const id = generateId();
  const now = Date.now();

  const record: TimerRecord = {
    id,
    initialSeconds,
    secondsWhenPaused: initialSeconds,
    startedAt: null,
    state: 'paused',
    createdAt: now,
    updatedAt: now,
  };

  inMemoryCache.set(id, record);

  const filePath = path.join(TIMERS_DIR, `${id}.json`);
  await tryWriteFile(filePath, JSON.stringify(record, null, 2));

  return id;
}

async function loadRecord(id: string): Promise<TimerRecord | null> {
  if (inMemoryCache.has(id)) {
    return inMemoryCache.get(id)!;
  }

  const filePath = path.join(TIMERS_DIR, `${id}.json`);
  const data = await tryReadFile(filePath);
  if (!data) return null;

  try {
    const record = JSON.parse(data) as TimerRecord;
    inMemoryCache.set(id, record);
    return record;
  } catch {
    return null;
  }
}

export async function getTimer(id: string): Promise<Timer | null> {
  const record = await loadRecord(id);
  if (!record) return null;

  const current = computeCurrentSeconds(record);
  if (record.state === 'running' && current <= 0) {
    const finished = await updateRecord(id, { state: 'finished', secondsWhenPaused: 0, startedAt: null });
    return finished ? recordToTimer(finished) : null;
  }

  return recordToTimer(record);
}

async function updateRecord(id: string, updates: Partial<TimerRecord>): Promise<TimerRecord | null> {
  const record = await loadRecord(id);
  if (!record) return null;

  const updated: TimerRecord = { ...record, ...updates, updatedAt: Date.now() };
  inMemoryCache.set(id, updated);

  const filePath = path.join(TIMERS_DIR, `${id}.json`);
  await tryWriteFile(filePath, JSON.stringify(updated, null, 2));

  return updated;
}

export async function startTimer(id: string): Promise<Timer | null> {
  const record = await loadRecord(id);
  if (!record) return null;
  if (record.state === 'running') return recordToTimer(record);

  const current = computeCurrentSeconds(record);
  if (current <= 0) return recordToTimer(record);

  const updated = await updateRecord(id, {
    state: 'running',
    startedAt: Date.now(),
    secondsWhenPaused: current,
  });
  return updated ? recordToTimer(updated) : null;
}

export async function pauseTimer(id: string): Promise<Timer | null> {
  const record = await loadRecord(id);
  if (!record) return null;

  const current = computeCurrentSeconds(record);
  const updated = await updateRecord(id, {
    state: 'paused',
    startedAt: null,
    secondsWhenPaused: current,
  });
  return updated ? recordToTimer(updated) : null;
}

export async function resetTimer(id: string): Promise<Timer | null> {
  const record = await loadRecord(id);
  if (!record) return null;

  const updated = await updateRecord(id, {
    state: 'paused',
    startedAt: null,
    secondsWhenPaused: record.initialSeconds,
  });
  return updated ? recordToTimer(updated) : null;
}

export async function setTimerTime(id: string, seconds: number): Promise<Timer | null> {
  const updated = await updateRecord(id, {
    initialSeconds: seconds,
    secondsWhenPaused: seconds,
    startedAt: null,
    state: 'paused',
  });
  return updated ? recordToTimer(updated) : null;
}
