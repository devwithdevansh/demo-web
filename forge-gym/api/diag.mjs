import { connectDb, disconnectDb } from './src/db.js';
import { createApp } from './src/app.js';
import { User } from './src/models/index.js';

await connectDb({ ephemeral: true });
await User.syncIndexes();
console.log('indexes', (await User.collection.indexes()).map((i) => i.name));
const server = createApp().listen(0);
const base = `http://127.0.0.1:${server.address().port}/api`;
const call = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
};
const a = await call('/demo/session', { method: 'POST', body: { tier: 'performance', role: 'owner' } });
console.log('first', a.status, a.data?.user, a.data?.error);
const b = await call('/demo/session', { method: 'POST', body: { tier: 'performance', role: 'owner' } });
console.log('second', b.status, b.data?.user, b.data?.error);
const r = await call('/reports', { token: b.data?.token });
console.log('reports', r.status, r.data?.error);
server.close();
await disconnectDb();
