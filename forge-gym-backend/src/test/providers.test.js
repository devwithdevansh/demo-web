// Checks the Razorpay and WhatsApp integrations against stand-in providers:
// the outbound calls are intercepted, so nothing is sent and no keys are needed.
// Run with: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

// Settings are read when the server modules load, so they are set first and
// the modules are imported afterwards.
const KEY_SECRET = 'stand-in-razorpay-secret';
const APP_SECRET = 'stand-in-app-secret';
Object.assign(process.env, {
  RAZORPAY_KEY_ID: 'rzp_test_standin',
  RAZORPAY_KEY_SECRET: KEY_SECRET,
  WHATSAPP_TOKEN: 'stand-in-token',
  WHATSAPP_PHONE_NUMBER_ID: '1234567890',
  WHATSAPP_DEMO_RECIPIENTS: '+91 98765 43210',
  WHATSAPP_APP_SECRET: APP_SECRET,
  WHATSAPP_VERIFY_TOKEN: 'stand-in-verify',
  WHATSAPP_APP_ID: '900100200300',
  WHATSAPP_CONFIG_ID: '700100200300',
  ADMIN_KEY: 'stand-in-admin-key-0001',
});
const { connectDb, disconnectDb } = await import('../db.js');
const { createApp } = await import('../app.js');
const { ActionLog, WhatsAppLink } = await import('../models/index.js');

let server, base;
const outbound = [];
const realFetch = globalThis.fetch;

before(async () => {
  await connectDb({ ephemeral: true });
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;

  // Stand-ins for the two providers. Anything else goes to the real network stack (the local test server).
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
    if (target.startsWith('https://api.razorpay.com/')) {
      outbound.push({ target, options });
      if (target.endsWith('/orders')) return json(200, { id: 'order_standin1', status: 'created', amount: JSON.parse(options.body).amount });
      if (target.includes('/payments/')) return json(200, { id: 'pay_standin1', method: 'card', status: 'captured' });
      return json(404, { error: { description: 'not found' } });
    }
    if (target.startsWith('https://graph.facebook.com/')) {
      outbound.push({ target, options });
      const path = new URL(target).pathname;
      if (path.endsWith('/oauth/access_token')) {
        return new URL(target).searchParams.get('code') === 'expired-code' ? json(400, { error: { code: 100, message: 'This authorization code has expired.' } }) : json(200, { access_token: 'biz-token-standin' });
      }
      if (path.endsWith('/debug_token')) return json(200, { data: { granular_scopes: [{ scope: 'whatsapp_business_management', target_ids: ['880011'] }] } });
      if (path.endsWith('/phone_numbers')) return json(200, { data: [{ id: '555000111', display_phone_number: '+91 94088 57184', verified_name: 'Stand-in Gym Co', is_on_biz_app: true, platform_type: 'CLOUD_API' }] });
      if (path.endsWith('/subscribed_apps') || path.endsWith('/smb_app_data')) return json(200, { success: true });
      return json(200, { messaging_product: 'whatsapp', messages: [{ id: `wamid.standin${outbound.filter((c) => c.target.endsWith('/messages')).length}` }] });
    }
    return realFetch(url, options);
  };
});
after(async () => {
  globalThis.fetch = realFetch;
  server.close();
  await disconnectDb();
});

async function call(path, { token, method = 'GET', body, headers = {}, raw } = {}) {
  const res = await realFetch(base + path, {
    method,
    headers: { ...(body || raw ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}
const enter = async (role) => (await call('/demo/session', { method: 'POST', body: { tier: 'performance', role } })).data;

test('payment link: Razorpay test-mode order, signature check, payment recorded once', async () => {
  const owner = await enter('owner');
  const o = { token: owner.token };
  assert.equal((await call('/addons', o)).data.providers.payments, 'razorpay_test');

  const member = (await call('/members?q=Meera', o)).data.members[0];
  const link = (await call('/addons/upi-link', { ...o, method: 'POST', body: { memberId: member.id, amount: 400 } })).data;
  assert.equal(link.gateway, 'razorpay_test');
  assert.equal(link.simulated, false);

  const pay = `/public/pay/${link.token}`;
  assert.equal((await call(pay)).data.gateway, 'razorpay_test');
  assert.equal((await call(pay, { method: 'POST', body: { outcome: 'success' } })).status, 409, 'a gateway link cannot be marked paid by the practice buttons');

  const order = (await call(`${pay}/order`, { method: 'POST' })).data;
  assert.deepEqual([order.keyId, order.orderId, order.amount, order.currency], ['rzp_test_standin', 'order_standin1', 40000, 'INR']);
  assert.equal(JSON.stringify(order).includes(KEY_SECRET), false, 'the key secret never reaches the pay page');
  const sent = outbound.find((c) => c.target.endsWith('/orders'));
  assert.equal(JSON.parse(sent.options.body).amount, 40000, 'rupees are sent to Razorpay as paise');
  assert.match(sent.options.headers.Authorization, /^Basic /);
  await call(`${pay}/order`, { method: 'POST' });
  assert.equal(outbound.filter((c) => c.target.endsWith('/orders')).length, 1, 'the order is created once and reused');

  // A forged or mismatched result is refused and records nothing.
  const forged = { razorpay_order_id: 'order_standin1', razorpay_payment_id: 'pay_standin1', razorpay_signature: 'f'.repeat(64) };
  assert.equal((await call(`${pay}/verify`, { method: 'POST', body: forged })).status, 400);
  const otherOrder = { razorpay_order_id: 'order_other', razorpay_payment_id: 'pay_standin1' };
  otherOrder.razorpay_signature = createHmac('sha256', KEY_SECRET).update('order_other|pay_standin1').digest('hex');
  assert.equal((await call(`${pay}/verify`, { method: 'POST', body: otherOrder })).status, 400);
  assert.equal((await call(`/members/${member.id}`, o)).data.member.feeDue, member.feeDue);

  // The genuine signature settles it.
  const good = { razorpay_order_id: 'order_standin1', razorpay_payment_id: 'pay_standin1' };
  good.razorpay_signature = createHmac('sha256', KEY_SECRET).update('order_standin1|pay_standin1').digest('hex');
  const [first, second] = await Promise.all([call(`${pay}/verify`, { method: 'POST', body: good }), call(`${pay}/verify`, { method: 'POST', body: good })]);
  assert.equal(first.data.status, 'paid');
  assert.equal(second.data.status, 'paid');

  const after = (await call(`/members/${member.id}`, o)).data;
  assert.equal(after.member.feeDue, member.feeDue - 400);
  const recorded = after.payments.filter((p) => p.gateway === 'razorpay_test');
  assert.equal(recorded.length, 1, 'two simultaneous confirmations record one payment');
  assert.equal(recorded[0].method, 'card');
  assert.equal(recorded[0].simulated, false);
  assert.equal((await call(`${pay}/order`, { method: 'POST' })).status, 409, 'a paid link cannot be paid again');
});

test('whatsapp: goes to the demo phone only, and delivery comes from the signed webhook', async () => {
  const owner = await enter('owner');
  const o = { token: owner.token };
  const providers = (await call('/addons', o)).data.providers;
  assert.equal(providers.whatsapp, 'cloud_api');
  assert.equal(providers.whatsappTracking, true);

  const member = (await call('/members?q=Diya', o)).data.members[0];
  const draft = (await call('/addons/message', { ...o, method: 'POST', body: { template: 'renewal', memberId: member.id } })).data;
  assert.equal(draft.live, true);
  assert.match(draft.to, /demo phone ending 3210/);
  assert.equal(outbound.some((c) => c.target.includes('graph.facebook.com')), false, 'a draft sends nothing');

  const sent = (await call('/addons/message', { ...o, method: 'POST', body: { template: 'renewal', memberId: member.id, send: true } })).data;
  assert.equal(sent.status, 'accepted');
  assert.equal(sent.delivered, false, 'accepted by WhatsApp is not reported as delivered');
  const outboundCall = outbound.find((c) => c.target.includes('graph.facebook.com'));
  assert.match(outboundCall.target, /\/v[\d.]+\/1234567890\/messages$/);
  const payload = JSON.parse(outboundCall.options.body);
  assert.equal(payload.to, '+919876543210', 'sent to the approved demo phone');
  assert.notEqual(payload.to.replace(/\D/g, '').slice(-10), member.phone.replace(/\D/g, '').slice(-10), 'never to the sample member number');
  assert.ok(payload.text.body.includes('Diya'));

  // Webhook handshake and signature.
  const hook = '/webhooks/whatsapp';
  assert.equal((await call(`${hook}?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=42`)).status, 403);
  const shake = await call(`${hook}?hub.mode=subscribe&hub.verify_token=stand-in-verify&hub.challenge=42`);
  assert.deepEqual([shake.status, shake.data], [200, 42]);

  const update = (status, extra = {}) => JSON.stringify({ entry: [{ changes: [{ value: { statuses: [{ id: 'wamid.standin1', status, ...extra }] } }] }] });
  const signed = (rawBody) => ({ 'x-hub-signature-256': `sha256=${createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}` });
  const delivered = update('delivered');
  assert.equal((await call(hook, { method: 'POST', raw: delivered, headers: { 'x-hub-signature-256': 'sha256=bad' } })).status, 403);
  assert.equal((await call(hook, { method: 'POST', raw: delivered })).status, 403, 'unsigned updates are refused');
  assert.equal((await call(`/addons/message/${sent.logId}`, o)).data.status, 'accepted');

  assert.equal((await call(hook, { method: 'POST', raw: delivered, headers: signed(delivered) })).status, 200);
  assert.equal((await call(`/addons/message/${sent.logId}`, o)).data.status, 'delivered');
  const stale = update('sent');
  await call(hook, { method: 'POST', raw: stale, headers: signed(stale) });
  assert.equal((await call(`/addons/message/${sent.logId}`, o)).data.status, 'delivered', 'an older update never moves a message backwards');

  // Another gym cannot read this message's status.
  const stranger = await enter('owner');
  assert.equal((await call(`/addons/message/${sent.logId}`, { token: stranger.token })).status, 404);

  // A failure reported by WhatsApp is shown with its reason.
  await ActionLog.updateOne({ _id: sent.logId }, { status: 'accepted' });
  const failed = update('failed', { errors: [{ code: 131047, title: 'Re-engagement message', error_data: { details: 'More than 24 hours have passed since the recipient last replied.' } }] });
  await call(hook, { method: 'POST', raw: failed, headers: signed(failed) });
  const state = (await call(`/addons/message/${sent.logId}`, o)).data;
  assert.equal(state.status, 'failed');
  assert.match(state.reason, /131047/);
});

test('connecting a Business-app number: admin only, token kept encrypted, sync requested, used for sending', async () => {
  const admin = { headers: { 'x-admin-key': 'stand-in-admin-key-0001' } };
  assert.equal((await call('/admin/whatsapp')).status, 401, 'no key, no access');
  assert.equal((await call('/admin/whatsapp', { headers: { 'x-admin-key': 'wrong-key-wrong-key-00' } })).status, 401);
  const owner = await enter('owner');
  assert.equal((await call('/admin/whatsapp', { token: owner.token })).status, 401, 'a demo session is not an admin key');

  const before = (await call('/admin/whatsapp', admin)).data;
  assert.deepEqual(before.signup, { appId: '900100200300', configId: '700100200300', graphVersion: 'v25.0' });
  assert.equal(before.connection, null);
  assert.equal(before.sendingFrom.source, 'settings', 'falls back to the test sender until a number is connected');
  assert.equal(JSON.stringify(before).includes(APP_SECRET), false, 'the app secret is never sent to the browser');

  const expired = await call('/admin/whatsapp/connect', { ...admin, method: 'POST', body: { code: 'expired-code', wabaId: '880011' } });
  assert.equal(expired.status, 502);
  assert.equal(await WhatsAppLink.countDocuments(), 0, 'a failed sign-up stores nothing');

  outbound.length = 0;
  const done = await call('/admin/whatsapp/connect', { ...admin, method: 'POST', body: { code: 'fresh-signup-code', event: 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' } });
  assert.equal(done.status, 201);
  assert.deepEqual([done.data.connection.phone, done.data.connection.onBusinessApp, done.data.connection.status], ['+91 94088 57184', true, 'connected']);
  assert.deepEqual([done.data.connection.sync.contacts, done.data.connection.sync.history], ['requested', 'requested']);
  assert.equal(done.data.sendingFrom.source, 'connected');

  // The steps Meta requires, in order: code exchange first, then account lookup, subscribe, both syncs.
  const steps = outbound.map((c) => new URL(c.target).pathname.split('/').slice(2).join('/'));
  assert.deepEqual(steps, ['oauth/access_token', 'debug_token', '880011/phone_numbers', '880011/subscribed_apps', '555000111/smb_app_data', '555000111/smb_app_data']);
  assert.deepEqual(outbound.filter((c) => c.target.endsWith('/smb_app_data')).map((c) => JSON.parse(c.options.body).sync_type), ['smb_app_state_sync', 'history']);

  const stored = await WhatsAppLink.findOne({ scope: 'demo' });
  assert.ok(stored.tokenSealed && !stored.tokenSealed.includes('biz-token-standin'), 'the access token is stored encrypted');
  assert.equal(JSON.stringify(done.data).includes('biz-token-standin'), false, 'and never returned');

  // Demo reminders now go out from the connected number, still only to the demo phone.
  const member = (await call('/members?q=Diya', { token: owner.token })).data.members[0];
  outbound.length = 0;
  const sent = (await call('/addons/message', { token: owner.token, method: 'POST', body: { template: 'renewal', memberId: member.id, send: true } })).data;
  assert.equal(sent.status, 'accepted');
  assert.match(outbound[0].target, /\/555000111\/messages$/);
  assert.equal(outbound[0].options.headers.Authorization, 'Bearer biz-token-standin');
  assert.equal(JSON.parse(outbound[0].options.body).to, '+919876543210');

  // A large chat-history batch from Meta is accepted, and none of it is kept.
  const sign = (rawBody) => ({ 'x-hub-signature-256': `sha256=${createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}` });
  const history = JSON.stringify({ entry: [{ id: '880011', changes: [{ field: 'history', value: { history: [{ threads: [{ id: '919000000001', messages: Array.from({ length: 900 }, (_, i) => ({ id: `m${i}`, text: { body: 'private chat line '.repeat(8) } })) }] }] } }] }] });
  assert.ok(history.length > 100000);
  assert.equal((await call('/webhooks/whatsapp', { method: 'POST', raw: history, headers: sign(history) })).status, 200);
  assert.equal(JSON.stringify(await WhatsAppLink.find().lean()).includes('private chat line'), false);
  assert.equal(await ActionLog.countDocuments({ detail: /private chat line/ }), 0);

  // If the business disconnects in the WhatsApp Business app, sending falls back and the admin page says why.
  const gone = JSON.stringify({ entry: [{ id: '880011', changes: [{ field: 'account_update', value: { event: 'PARTNER_REMOVED', disconnection_info: { reason: 'ACCOUNT_DISCONNECTED', initiated_by: 'USER' } } }] }] });
  await call('/webhooks/whatsapp', { method: 'POST', raw: gone, headers: sign(gone) });
  const after = (await call('/admin/whatsapp', admin)).data;
  assert.deepEqual([after.connection.status, after.connection.statusReason, after.sendingFrom.source], ['disconnected', 'ACCOUNT_DISCONNECTED', 'settings']);

  assert.equal((await call('/admin/whatsapp', { ...admin, method: 'DELETE' })).data.connection, null);
});
