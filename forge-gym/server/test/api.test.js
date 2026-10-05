// End-to-end API checks against a throwaway local database.
// Run with: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../db.js';
import { createApp } from '../app.js';
import { Gym, User, Member, Plan } from '../models/index.js';

let server, base;

before(async () => {
  await connectDb({ ephemeral: true });
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  server.close();
  await disconnectDb();
});

async function call(path, { token, method = 'GET', body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}
const enter = async (tier, role, sandboxKey) => (await call('/demo/session', { method: 'POST', body: { tier, role, sandboxKey } })).data;

test('demo entry gives each role a session in one private sandbox', async () => {
  const owner = await enter('performance', 'owner');
  assert.ok(owner.token && owner.sandboxKey);
  assert.equal(owner.gym.isDemo, true);
  for (const role of ['staff', 'trainer', 'member']) {
    const s = await enter('performance', role, owner.sandboxKey);
    assert.equal(s.user.role, role);
    assert.equal(s.sandboxKey, owner.sandboxKey);
  }
  assert.equal((await Gym.countDocuments({ isDemo: true })), 1, 'roles share one sandbox');
  const bad = await call('/demo/session', { method: 'POST', body: { tier: 'growth', role: 'trainer' } });
  assert.equal(bad.status, 400, 'Growth has no trainer portal');
});

test('requests without a valid session are rejected', async () => {
  assert.equal((await call('/members')).status, 401);
  assert.equal((await call('/members', { token: 'not-a-token' })).status, 401);
  assert.equal((await call('/coach/overview')).status, 401);
  assert.equal((await call('/portal')).status, 401);
});

test('roles only reach what they should', async () => {
  const owner = await enter('performance', 'owner');
  const key = owner.sandboxKey;
  const staff = await enter('performance', 'staff', key);
  const trainer = await enter('performance', 'trainer', key);
  const member = await enter('performance', 'member', key);

  assert.equal((await call('/reports', { token: owner.token })).status, 200);
  assert.equal((await call('/reports', { token: staff.token })).status, 403);
  assert.equal((await call('/members', { token: staff.token })).status, 200);
  assert.equal((await call('/payments', { token: staff.token })).data.totals.month, null, 'staff do not see monthly revenue');
  for (const s of [trainer, member]) {
    for (const path of ['/members', '/dashboard', '/payments', '/leads', '/reports', '/addons']) {
      assert.equal((await call(path, { token: s.token })).status, 403, `${s.user.role} blocked from ${path}`);
    }
  }
  assert.equal((await call('/portal', { token: trainer.token })).status, 403);
  assert.equal((await call('/coach/overview', { token: member.token })).status, 403);
  assert.equal((await call('/plans', { token: staff.token, method: 'POST', body: { name: 'Sneaky', price: 1, durationMonths: 1 } })).status, 403);

  // A trainer sees only their own members.
  const overview = (await call('/coach/overview', { token: trainer.token })).data;
  assert.ok(overview.members.length > 0 && overview.tasks.length > 0);
  const all = (await call('/members', { token: owner.token })).data.members;
  const notMine = all.find((m) => m.trainerName && m.trainerName !== trainer.user.name);
  assert.equal((await call(`/coach/members/${notMine.id}`, { token: trainer.token })).status, 404);
  assert.equal((await call(`/coach/members/${overview.members[0].id}`, { token: trainer.token })).status, 200);

  // The member portal returns only that member's record.
  const portal = (await call('/portal', { token: member.token })).data;
  assert.equal(portal.member.name, member.user.name);
  assert.equal(portal.member.notes, undefined);
});

test('the Growth demo cannot use Performance features', async () => {
  const growth = await enter('growth', 'owner');
  assert.equal(growth.gym.package, 'growth');
  assert.equal((await call('/members', { token: growth.token })).status, 200);
  const blocked = await call('/coach/assignments', { token: growth.token });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.data.code, 'package_required');
});

test('one gym can never read or change another gym\'s records', async () => {
  const a = await enter('performance', 'owner');
  const b = await enter('performance', 'owner');
  assert.notEqual(a.sandboxKey, b.sandboxKey);

  const added = await call('/members', { token: a.token, method: 'POST', body: { name: 'Only In A', phone: '00000 12345', planId: (await call('/plans', { token: a.token })).data.plans[0].id } });
  assert.equal(added.status, 201);
  const id = added.data.member.id;

  const namesInB = (await call('/members', { token: b.token })).data.members.map((m) => m.name);
  assert.ok(!namesInB.includes('Only In A'));
  assert.equal((await call(`/members/${id}`, { token: b.token })).status, 404);
  assert.equal((await call(`/members/${id}`, { token: b.token, method: 'PATCH', body: { name: 'Hijacked' } })).status, 404);
  assert.equal((await call('/payments', { token: b.token, method: 'POST', body: { memberId: id, amount: 100, method: 'cash' } })).status, 404);
  assert.equal((await call('/attendance', { token: b.token, method: 'POST', body: { memberId: id } })).status, 404);
  assert.equal((await call(`/coach/members/${id}`, { token: b.token })).status, 404);
  // A plan id from another gym is not accepted either.
  const planB = (await call('/plans', { token: b.token })).data.plans[0].id;
  assert.equal((await call('/members', { token: a.token, method: 'POST', body: { name: 'Cross Plan', phone: '00000 12345', planId: planB } })).status, 404);
  assert.equal((await call(`/members/${id}`, { token: a.token })).data.member.name, 'Only In A');
});

test('front desk workflow: add member, check in, take payment, dashboard updates', async () => {
  const s = await enter('growth', 'owner');
  const t = { token: s.token };
  const before = (await call('/dashboard', t)).data.counts;
  const plan = (await call('/plans', t)).data.plans.find((p) => p.name === 'Pro Monthly');

  const invalid = await call('/members', { ...t, method: 'POST', body: { name: 'X', phone: 'abc', planId: plan.id } });
  assert.equal(invalid.status, 400);
  assert.ok(invalid.data.fields.name && invalid.data.fields.phone);

  const created = (await call('/members', { ...t, method: 'POST', body: { name: 'Test Visitor', phone: '00000 55555', planId: plan.id, paidNow: 1000, method: 'upi' } })).data.member;
  assert.equal(created.feeDue, plan.price - 1000);
  assert.equal(created.status, 'active');
  assert.match(created.memberCode, /^IP-\d+$/);

  const edited = await call(`/members/${created.id}`, { ...t, method: 'PATCH', body: { name: 'Test Visitor Edited', category: 'Strength' } });
  assert.equal(edited.data.member.name, 'Test Visitor Edited');

  const checkin = await call('/attendance', { ...t, method: 'POST', body: { memberCode: created.memberCode.toLowerCase(), method: 'qr' } });
  assert.equal(checkin.status, 201);
  assert.equal((await call('/attendance', { ...t, method: 'POST', body: { memberId: created.id } })).status, 409);

  const paid = await call('/payments', { ...t, method: 'POST', body: { memberId: created.id, amount: 999, method: 'cash' } });
  assert.equal(paid.data.feeDue, plan.price - 1999);

  const now = (await call('/dashboard', t)).data.counts;
  assert.equal(now.activeMembers, before.activeMembers + 1);
  assert.equal(now.checkinsToday, before.checkinsToday + 1);
  assert.equal(now.collectedToday, before.collectedToday + 1999);
  assert.equal(now.duesTotal, before.duesTotal + plan.price - 1999);

  const renewed = (await call(`/members/${created.id}/renew`, { ...t, method: 'POST', body: {} })).data.member;
  assert.ok(renewed.expiryDate > created.expiryDate);
  assert.equal(renewed.feeDue, plan.price - 1999 + plan.price);

  const lead = (await call('/leads', { ...t, method: 'POST', body: { name: 'New Lead', phone: '00000 77777', followUpOn: now.today ?? undefined } })).data.lead;
  const moved = await call(`/leads/${lead.id}`, { ...t, method: 'PATCH', body: { status: 'contacted' } });
  assert.equal(moved.data.lead.status, 'contacted');

  const reports = (await call('/reports', t)).data;
  assert.equal(reports.revenueByMonth.length, 6);
  assert.equal(reports.attendanceByDay.length, 14);
});

test('website enquiry lands as a lead in the same sandbox', async () => {
  const s = await enter('growth', 'owner');
  const sent = await call('/public/enquiry', { method: 'POST', body: { sandboxKey: s.sandboxKey, name: 'Website Visitor', phone: '00000 99999', interest: 'Pro plan' } });
  assert.equal(sent.status, 201);
  const lead = (await call('/leads', { token: s.token })).data.leads.find((l) => l.name === 'Website Visitor');
  assert.equal(lead.source, 'website');
  assert.equal((await call('/public/enquiry', { method: 'POST', body: { name: '', phone: '1' } })).status, 400);
});

test('trainer changes reach the member portal', async () => {
  const trainer = await enter('performance', 'trainer');
  const member = await enter('performance', 'member', trainer.sandboxKey);
  const mine = (await call('/coach/overview', { token: trainer.token })).data.members.find((m) => m.name === member.user.name);
  const path = `/coach/members/${mine.id}`;

  const workout = { title: 'Updated By Test', days: [{ day: 'Monday', focus: 'Push', exercises: [{ name: 'Bench Press', sets: '5', reps: '5', videoUrl: 'https://example.com/clip' }] }] };
  assert.equal((await call(`${path}/workout`, { token: trainer.token, method: 'PUT', body: workout })).status, 200);
  const badLink = { ...workout, days: [{ day: 'Mon', exercises: [{ name: 'Row', videoUrl: 'javascript:alert(1)' }] }] };
  assert.equal((await call(`${path}/workout`, { token: trainer.token, method: 'PUT', body: badLink })).status, 400);

  assert.equal((await call(`${path}/logs`, { token: trainer.token, method: 'POST', body: { type: 'checkin' } })).status, 400);
  await call(`${path}/logs`, { token: trainer.token, method: 'POST', body: { type: 'measurement', weightKg: 79.1, waistCm: 88 } });
  await call(`${path}/logs`, { token: trainer.token, method: 'POST', body: { type: 'checkin', note: 'Recorded in test' } });
  const session = await call(`${path}/pt-session`, { token: trainer.token, method: 'POST', body: {} });
  assert.equal(session.data.pt.used, mine.pt.used + 1);
  await call(`${path}/diet`, { token: trainer.token, method: 'PUT', body: { title: 'Guide', meals: [{ label: 'Lunch', items: 'Dal and rice' }] } });

  const portal = (await call('/portal', { token: member.token })).data;
  assert.equal(portal.member.workout.title, 'Updated By Test');
  assert.equal(portal.member.workout.updatedBy, trainer.user.name);
  assert.equal(portal.member.diet.meals[0].label, 'Lunch');
  assert.equal(portal.member.pt.used, mine.pt.used + 1);
  assert.ok(portal.logs.some((l) => l.type === 'measurement' && l.weightKg === 79.1));
  assert.ok(portal.logs.some((l) => l.note === 'Recorded in test'));

  // A member cannot write to coaching records.
  assert.equal((await call(`${path}/workout`, { token: member.token, method: 'PUT', body: workout })).status, 403);
});

test('add-ons are simulated, and Autopay needs the member\'s explicit approval', async () => {
  const owner = await enter('performance', 'owner');
  const member = await enter('performance', 'member', owner.sandboxKey);
  const o = { token: owner.token };
  const me = (await call('/members?q=Aarav', o)).data.members[0];

  const msg = await call('/addons/message', { ...o, method: 'POST', body: { template: 'renewal', memberId: me.id, send: true } });
  assert.equal(msg.data.delivered, false);
  assert.equal(msg.data.simulated, true);
  assert.ok(!msg.data.to.includes(me.phone.slice(4, 9)), 'phone is masked');

  // The gym can only request Autopay.
  assert.equal((await call('/addons/autopay/request', { ...o, method: 'POST', body: { memberId: me.id } })).data.autopay.status, 'requested');
  assert.equal((await call('/portal/autopay', { ...o, method: 'POST', body: { action: 'approve', consent: true } })).status, 403);
  assert.equal((await call('/portal/autopay', { token: member.token, method: 'POST', body: { action: 'approve' } })).status, 400);
  assert.equal((await call('/portal/autopay', { token: member.token, method: 'POST', body: { action: 'approve', consent: true } })).data.autopay.status, 'active');
  assert.equal((await call('/portal/autopay', { token: member.token, method: 'POST', body: { action: 'pause' } })).data.autopay.status, 'paused');
  assert.equal((await call('/portal/autopay', { token: member.token, method: 'POST', body: { action: 'cancel' } })).data.autopay.status, 'cancelled');

  // Payment link: only the demo pay page settles it, and only once.
  const due = (await call('/members?q=Meera', o)).data.members[0];
  const link = (await call('/addons/upi-link', { ...o, method: 'POST', body: { memberId: due.id, amount: 400 } })).data;
  assert.equal((await call(`/public/pay/${link.token}`)).data.status, 'pending');
  assert.equal((await call(`/public/pay/${link.token}`, { method: 'POST', body: { outcome: 'success' } })).data.status, 'paid');
  assert.equal((await call(`/public/pay/${link.token}`, { method: 'POST', body: { outcome: 'success' } })).status, 409);
  assert.equal((await call('/public/pay/does-not-exist')).status, 404);
  const after = (await call(`/members/${due.id}`, o)).data;
  assert.equal(after.member.feeDue, due.feeDue - 400);
  assert.equal(after.payments[0].simulated, true);

  // Switching an add-on off blocks it on the server, not just in the UI.
  await call('/addons', { ...o, method: 'PATCH', body: { key: 'upiLinks', enabled: false } });
  assert.equal((await call('/addons/upi-link', { ...o, method: 'POST', body: { memberId: due.id, amount: 100 } })).data.code, 'addon_off');
});

test('reset restores the sample data and leaves other sandboxes alone', async () => {
  const mine = await enter('growth', 'owner');
  const other = await enter('growth', 'owner');
  const plan = (await call('/plans', { token: mine.token })).data.plans[0];
  const original = (await call('/members', { token: mine.token })).data.members.length;
  await call('/members', { token: mine.token, method: 'POST', body: { name: 'Temporary', phone: '00000 11111', planId: plan.id } });
  await call('/members', { token: other.token, method: 'POST', body: { name: 'Keeps Existing', phone: '00000 22222', planId: (await call('/plans', { token: other.token })).data.plans[0].id } });

  const reset = await call('/demo/reset', { token: mine.token, method: 'POST' });
  assert.equal(reset.status, 200);
  assert.equal((await call('/members', { token: mine.token })).status, 401, 'old session ends with the old sample accounts');
  assert.equal((await call('/members', { token: reset.data.token })).data.members.length, original);
  assert.equal((await call('/members', { token: other.token })).data.members.length, original + 1);
});

test('live gyms are separate from the demo', async () => {
  const gym = await Gym.create({ name: 'Real Gym', isDemo: false, package: 'growth' });
  await User.create({ gymId: gym._id, name: 'Real Owner', email: 'owner@real-gym.test', role: 'owner', passwordHash: await bcrypt.hash('correct-horse-battery', 10) });
  const plan = await Plan.create({ gymId: gym._id, name: 'Real Plan', price: 2000, durationMonths: 1 });
  const realMember = await Member.create({ gymId: gym._id, memberCode: 'RG-1', name: 'Real Person', phone: '00000 33333', planId: plan._id, startDate: '2026-01-01', expiryDate: '2026-12-31' });

  assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'owner@real-gym.test', password: 'wrong-password' } })).status, 401);
  const login = await call('/auth/login', { method: 'POST', body: { email: 'owner@real-gym.test', password: 'correct-horse-battery' } });
  assert.equal(login.status, 200);
  assert.equal(login.data.token.includes('correct-horse'), false);
  const stored = await User.findOne({ email: 'owner@real-gym.test' });
  assert.notEqual(stored.passwordHash, 'correct-horse-battery');

  const real = { token: login.data.token };
  assert.deepEqual((await call('/members', real)).data.members.map((m) => m.name), ['Real Person']);
  assert.equal((await call('/demo/reset', { ...real, method: 'POST' })).status, 403, 'live data cannot be reset');
  assert.equal((await call('/coach/assignments', real)).status, 403, 'package is enforced for live gyms');
  assert.equal((await call('/addons/upi-link', { ...real, method: 'POST', body: { memberId: String(realMember._id), amount: 10 } })).status, 403);

  // Demo visitors cannot see or reach the live gym.
  const demo = await enter('performance', 'owner');
  assert.equal((await call(`/members/${realMember._id}`, { token: demo.token })).status, 404);
  assert.ok(!(await call('/members', { token: demo.token })).data.members.some((m) => m.name === 'Real Person'));
  // Demo accounts have no password and cannot use the live sign-in.
  assert.equal((await User.countDocuments({ isDemo: true, passwordHash: { $exists: true, $ne: null } })), 0);
  // Responses never expose internal fields.
  const json = JSON.stringify((await call('/team', { token: demo.token })).data) + JSON.stringify((await call('/members', { token: demo.token })).data);
  for (const leak of ['passwordHash', 'demoKeyHash', 'gymId', '__v']) assert.ok(!json.includes(leak), `${leak} is not exposed`);
});
