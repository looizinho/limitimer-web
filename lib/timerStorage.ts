import { randomBytes } from 'crypto';
import { TimerRecord, Timer } from '@/types/timer';
import { getTimersCollection } from './mongodb';

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
    eventName: record.eventName,
    initialSeconds: record.initialSeconds,
    currentSeconds: Math.floor(computeCurrentSeconds(record)),
    state: record.state,
    qrCodeScanned: record.qrCodeScanned,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function createTimer(eventName: string, initialSeconds: number): Promise<string> {
  const id = generateId();
  const now = Date.now();

  const record: TimerRecord = {
    id,
    eventName,
    initialSeconds,
    secondsWhenPaused: initialSeconds,
    startedAt: null,
    state: 'paused',
    qrCodeScanned: false,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getTimersCollection();
  await collection.insertOne(record);

  return id;
}

export async function getTimer(id: string): Promise<Timer | null> {
  const collection = await getTimersCollection();
  const record = await collection.findOne({ id });

  if (!record) return null;

  const current = computeCurrentSeconds(record);
  if (record.state === 'running' && current <= 0) {
    const finished = { ...record, state: 'finished' as const, secondsWhenPaused: 0, startedAt: null, updatedAt: Date.now() };
    await collection.updateOne({ id }, { $set: finished });
    return toTimer(finished);
  }

  return toTimer(record);
}

export async function startTimer(id: string): Promise<Timer | null> {
  const collection = await getTimersCollection();
  const record = await collection.findOne({ id });

  if (!record) return null;
  if (record.state === 'running') return toTimer(record);

  const current = computeCurrentSeconds(record);
  if (current <= 0) return toTimer(record);

  const updated = {
    state: 'running' as const,
    startedAt: Date.now(),
    secondsWhenPaused: current,
    updatedAt: Date.now(),
  };

  await collection.updateOne({ id }, { $set: updated });
  const updatedRecord = await collection.findOne({ id });

  return updatedRecord ? toTimer(updatedRecord) : null;
}

export async function pauseTimer(id: string): Promise<Timer | null> {
  const collection = await getTimersCollection();
  const record = await collection.findOne({ id });

  if (!record) return null;

  const current = computeCurrentSeconds(record);
  const updated = {
    state: 'paused' as const,
    startedAt: null,
    secondsWhenPaused: current,
    updatedAt: Date.now(),
  };

  await collection.updateOne({ id }, { $set: updated });
  const updatedRecord = await collection.findOne({ id });

  return updatedRecord ? toTimer(updatedRecord) : null;
}

export async function resetTimer(id: string): Promise<Timer | null> {
  const collection = await getTimersCollection();
  const record = await collection.findOne({ id });

  if (!record) return null;

  const updated = {
    state: 'paused' as const,
    startedAt: null,
    secondsWhenPaused: record.initialSeconds,
    updatedAt: Date.now(),
  };

  await collection.updateOne({ id }, { $set: updated });
  const updatedRecord = await collection.findOne({ id });

  return updatedRecord ? toTimer(updatedRecord) : null;
}

export async function setTimerTime(id: string, seconds: number): Promise<Timer | null> {
  const collection = await getTimersCollection();
  const record = await collection.findOne({ id });

  if (!record) return null;

  const updated = {
    initialSeconds: seconds,
    secondsWhenPaused: seconds,
    startedAt: null,
    state: 'paused' as const,
    updatedAt: Date.now(),
  };

  await collection.updateOne({ id }, { $set: updated });
  const updatedRecord = await collection.findOne({ id });

  return updatedRecord ? toTimer(updatedRecord) : null;
}

export async function markQrCodeScanned(id: string): Promise<Timer | null> {
  const collection = await getTimersCollection();
  await collection.updateOne({ id }, { $set: { qrCodeScanned: true, updatedAt: Date.now() } });
  const updatedRecord = await collection.findOne({ id });

  return updatedRecord ? toTimer(updatedRecord) : null;
}
