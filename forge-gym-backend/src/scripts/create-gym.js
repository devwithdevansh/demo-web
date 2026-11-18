// Creates a live (non-demo) gym and its owner account.
// Usage: npm run gym:create -- --name "Gym name" --owner "Owner name" --email owner@example.com --package growth
// The password is read from OWNER_PASSWORD or asked for interactively; it is never passed as an argument.
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../db.js';
import { Gym, User, PACKAGES } from '../models/index.js';

const { values } = parseArgs({
  options: { name: { type: 'string' }, owner: { type: 'string' }, email: { type: 'string' }, package: { type: 'string', default: 'growth' } },
});
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!values.name || !values.owner || !values.email) fail('Required: --name, --owner and --email.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) fail('That email address does not look right.');
if (!PACKAGES.includes(values.package)) fail(`--package must be one of: ${PACKAGES.join(', ')}.`);

let password = process.env.OWNER_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question('Owner password (min 10 characters): ');
  rl.close();
}
if (!password || password.length < 10) fail('Use a password of at least 10 characters.');

await connectDb();
if (await User.exists({ email: values.email.toLowerCase() })) {
  await disconnectDb();
  fail('An account with that email already exists.');
}
const gym = await Gym.create({ name: values.name, isDemo: false, package: values.package });
await User.create({
  gymId: gym._id, name: values.owner, email: values.email, role: 'owner', title: 'Owner',
  passwordHash: await bcrypt.hash(password, 12), isDemo: false,
});
console.log(`Created "${gym.name}" on the ${gym.package} package with owner ${values.email}.`);
await disconnectDb();
