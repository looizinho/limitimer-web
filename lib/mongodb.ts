import { MongoClient, Db, Collection } from 'mongodb';
import { TimerRecord } from '@/types/timer';

let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL environment variable is not set');
  }

  const client = new MongoClient(mongoUrl);
  await client.connect();

  const db = client.db('limitimer');
  cachedDb = db;

  return db;
}

export async function getTimersCollection(): Promise<Collection<TimerRecord>> {
  const db = await connectToDatabase();
  return db.collection<TimerRecord>('timers');
}
