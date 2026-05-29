import { randomBytes } from 'crypto';
import bcryptjs from 'bcryptjs';
import { UserRecord, User } from '@/types/user';
import { connectToDatabase } from './mongodb';
import { Collection } from 'mongodb';

async function getUsersCollection(): Promise<Collection<UserRecord>> {
  const db = await connectToDatabase();
  return db.collection<UserRecord>('users');
}

export function validateUsername(username: string): boolean {
  return /^[a-z]{3,20}$/.test(username);
}

export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

async function hashPin(pin: string): Promise<string> {
  return bcryptjs.hash(pin, 10);
}

async function verifyPin(hash: string, pin: string): Promise<boolean> {
  return bcryptjs.compare(pin, hash);
}

export async function createUser(username: string, pin: string): Promise<User> {
  if (!validateUsername(username)) {
    throw new Error('Invalid username format');
  }

  if (!validatePin(pin)) {
    throw new Error('Invalid PIN format');
  }

  const collection = await getUsersCollection();

  // Check if username already exists
  const existing = await collection.findOne({ username });
  if (existing) {
    throw new Error('Username already taken');
  }

  const id = randomBytes(8).toString('hex');
  const now = Date.now();
  const pinHash = await hashPin(pin);

  const record: UserRecord = {
    id,
    username,
    pinHash,
    createdAt: now,
    lastLoginAt: now,
  };

  await collection.insertOne(record as any);

  return { userId: id, username };
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ username });
  return user ? (user as UserRecord) : null;
}

export async function loginUser(username: string, pin: string): Promise<User | null> {
  if (!validateUsername(username)) {
    throw new Error('Invalid username format');
  }

  if (!validatePin(pin)) {
    throw new Error('Invalid PIN format');
  }

  const user = await getUserByUsername(username);
  if (!user) {
    return null;
  }

  const pinValid = await verifyPin(user.pinHash, pin);
  if (!pinValid) {
    return null;
  }

  // Update last login
  const collection = await getUsersCollection();
  await collection.updateOne({ id: user.id }, { $set: { lastLoginAt: Date.now() } });

  return { userId: user.id, username: user.username };
}
