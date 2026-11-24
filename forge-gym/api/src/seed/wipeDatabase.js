import { connectDb, disconnectDb } from '../db.js';
import { ensureDefaultLiveUsers } from './ensureUsers.js';

async function run() {
  try {
    console.log('[wipe] Connecting to database...');
    const source = await connectDb();
    console.log(`[wipe] Connected to: ${source}`);
    await ensureDefaultLiveUsers();
    console.log('[wipe] Database successfully wiped and synchronized to only clean records.');
  } catch (err) {
    console.error('[wipe] Error wiping database:', err);
  } finally {
    await disconnectDb().catch(() => {});
    process.exit(0);
  }
}

run();
