import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { Timer, TimerState } from '@/types/timer';

const TIMERS_DIR = path.join(process.cwd(), '.timers');

const inMemoryCache = new Map<string, Timer>();

async function ensureTimersDir() {
  try {
    await fs.mkdir(TIMERS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create timers directory:', error);
  }
}

function generateId(): string {
  return randomBytes(8).toString('hex');
}

export async function createTimer(initialSeconds: number): Promise<string> {
  await ensureTimersDir();

  const id = generateId();
  const now = Date.now();

  const timer: Timer = {
    id,
    initialSeconds,
    currentSeconds: initialSeconds,
    state: 'paused',
    createdAt: now,
    updatedAt: now,
  };

  inMemoryCache.set(id, timer);

  const filePath = path.join(TIMERS_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(timer, null, 2));

  return id;
}

export async function getTimer(id: string): Promise<Timer | null> {
  if (inMemoryCache.has(id)) {
    return inMemoryCache.get(id) || null;
  }

  try {
    const filePath = path.join(TIMERS_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const timer = JSON.parse(data) as Timer;
    inMemoryCache.set(id, timer);
    return timer;
  } catch (error) {
    return null;
  }
}

export async function updateTimer(id: string, updates: Partial<Timer>): Promise<Timer | null> {
  const timer = await getTimer(id);
  if (!timer) return null;

  const updated: Timer = {
    ...timer,
    ...updates,
    updatedAt: Date.now(),
  };

  inMemoryCache.set(id, updated);

  const filePath = path.join(TIMERS_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(updated, null, 2));

  return updated;
}

export async function deleteTimer(id: string): Promise<void> {
  inMemoryCache.delete(id);
  try {
    const filePath = path.join(TIMERS_DIR, `${id}.json`);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete timer ${id}:`, error);
  }
}

export async function getAllTimers(): Promise<Timer[]> {
  await ensureTimersDir();
  try {
    const files = await fs.readdir(TIMERS_DIR);
    const timers: Timer[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const id = file.replace('.json', '');
        const timer = await getTimer(id);
        if (timer) timers.push(timer);
      }
    }

    return timers;
  } catch (error) {
    console.error('Failed to read timers directory:', error);
    return [];
  }
}

export async function cleanupInactiveTimers(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const now = Date.now();
  const timers = await getAllTimers();

  for (const timer of timers) {
    if (now - timer.updatedAt > maxAgeMs) {
      await deleteTimer(timer.id);
    }
  }
}
