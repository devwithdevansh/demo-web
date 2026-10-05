import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { createApp } from './app.js';
import { sweepSandboxes } from './seed/demoGym.js';

try {
  const source = await connectDb();
  console.log(`[api] database: ${source}`);
} catch (err) {
  // Deliberately terse: connection errors can echo parts of the connection string.
  console.error(`[api] could not connect to the database (${err?.name ?? 'Error'}). Check MONGODB_URI and network access.`);
  process.exit(1);
}

const server = createApp().listen(config.port, () => console.log(`[api] listening on http://localhost:${config.port}`));

const sweep = setInterval(() => sweepSandboxes().catch(() => {}), 60 * 60 * 1000);
sweep.unref();

async function shutdown() {
  clearInterval(sweep);
  server.close();
  await disconnectDb().catch(() => {});
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
