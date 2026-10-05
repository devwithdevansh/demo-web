import path from 'node:path';
import { mkdirSync, rmSync } from 'node:fs';
import mongoose from 'mongoose';
import { config, rootDir } from './config.js';

let localServer = null;

/**
 * Connects to MongoDB Atlas via MONGODB_URI. When the variable is absent in
 * local development, a private MongoDB instance is started on this machine so
 * the demo runs without any account; its files live in .data/ in this folder.
 */
export async function connectDb({ ephemeral = false } = {}) {
  mongoose.set('strictQuery', true);

  if (config.mongoUri && !ephemeral) {
    await mongoose.connect(config.mongoUri, { dbName: config.mongoDb, serverSelectionTimeoutMS: 10000 });
    return `MONGODB_URI (database "${config.mongoDb}")`;
  }
  if (config.isProd) throw new Error('MONGODB_URI must be set in production.');

  // The -core package fetches its database binary on first use, not during npm install,
  // so installing on a host never triggers a large download.
  const { MongoMemoryServer } = await import('mongodb-memory-server-core');
  if (ephemeral) {
    localServer = await MongoMemoryServer.create();
  } else {
    const dbPath = path.join(rootDir, '.data');
    const start = () => {
      mkdirSync(dbPath, { recursive: true });
      return MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
    };
    try {
      localServer = await start();
    } catch {
      // A hard stop can leave the local data files unusable; demo data is disposable, so start clean.
      rmSync(dbPath, { recursive: true, force: true });
      localServer = await start();
    }
  }
  await mongoose.connect(localServer.getUri(), { dbName: config.mongoDb });
  return ephemeral ? 'temporary local database' : 'local development database (.data)';
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (localServer) {
    await localServer.stop({ doCleanup: false });
    localServer = null;
  }
}
