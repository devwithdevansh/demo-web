import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { createApp } from './app.js';
import { sweepSandboxes } from './seed/demoGym.js';
import { demoSender, razorpayMode, signupReady, whatsappTracking } from './lib/providers.js';

// Kept inside a function (no top-level await) so hosts that load the entry
// file with require(), such as Passenger-based Node hosting, can start it too.
async function main() {
  try {
    const source = await connectDb();
    console.log(`[api] database: ${source}`);
  } catch (err) {
    // Deliberately terse: connection errors can echo parts of the connection string.
    console.error(`[api] could not connect to the database (${err?.name ?? 'Error'}). Check MONGODB_URI and network access.`);
    process.exit(1);
  }

  const gateway = razorpayMode();
  console.log(`[api] payments: ${gateway === 'test' ? 'Razorpay test mode' : gateway === 'live' ? 'LIVE Razorpay key found; the demo only uses test keys, so payments stay simulated' : 'simulated (no Razorpay keys)'}`);
  const sender = await demoSender();
  console.log(`[api] whatsapp: ${sender ? `sending from ${sender.source === 'connected' ? 'a connected number' : 'the test number'}, demo phones: ${config.whatsapp.demoRecipients.length}, delivery updates: ${whatsappTracking() ? 'on' : 'off'}` : 'simulated (no sender or no demo phones set)'}`);
  console.log(`[api] whatsapp sign-up: ${signupReady() ? 'ready' : 'off (needs WHATSAPP_APP_ID, WHATSAPP_APP_SECRET, WHATSAPP_CONFIG_ID)'}; admin page: ${config.adminKey.length >= 16 ? 'on' : 'off (needs ADMIN_KEY of 16+ characters)'}`);

  const server = createApp().listen(config.port, () => console.log(`[api] listening on port ${config.port}`));

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
}

main();
