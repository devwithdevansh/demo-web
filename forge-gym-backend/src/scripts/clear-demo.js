// Removes every demo sandbox and its sample records. Live gyms are never touched.
// Usage: npm run demo:clear
import { connectDb, disconnectDb } from '../db.js';
import { Gym } from '../models/index.js';
import { purgeGym } from '../seed/demoGym.js';

await connectDb();
const sandboxes = await Gym.find({ isDemo: true }).select('_id');
for (const { _id } of sandboxes) {
  await purgeGym(_id);
  await Gym.deleteOne({ _id, isDemo: true });
}
console.log(`Removed ${sandboxes.length} demo sandbox(es). A fresh one is created the next time someone opens a demo.`);
await disconnectDb();
