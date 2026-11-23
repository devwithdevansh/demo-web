import { Router } from 'express';
import { config } from '../config.js';
import { ActionLog, WhatsAppLink } from '../models/index.js';
import { validWebhookSignature } from '../lib/providers.js';

// Mounted at /api/webhooks. These are called by outside services, not by the site.
const router = Router();

// A message only ever moves forward through these states.
const PROGRESS = { accepted: 0, sent: 1, delivered: 2, read: 3 };

/** Meta calls this once, when the webhook address is saved in the app dashboard. */
router.get('/whatsapp', (req, res) => {
  const { verifyToken } = config.whatsapp;
  if (verifyToken && req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === verifyToken) {
    return res.status(200).type('text/plain').send(String(req.query['hub.challenge'] ?? ''));
  }
  res.sendStatus(403);
});

/** Delivery updates for messages this server sent: sent, delivered, read or failed. */
router.post('/whatsapp', async (req, res) => {
  if (!config.whatsapp.appSecret || !validWebhookSignature(req.rawBody, req.get('x-hub-signature-256'))) return res.sendStatus(403);

  // A connected business can withdraw access at any time, from the WhatsApp Business app or Meta's
  // side. When that happens the number is marked disconnected so nothing tries to send from it.
  for (const entry of req.body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const info = change?.value?.disconnection_info;
      const event = String(change?.value?.event ?? '');
      if (info || /PARTNER_REMOVED|OFFBOARD/i.test(`${change?.field} ${event}`)) {
        const wabaId = String(change?.value?.waba_info?.waba_id ?? entry?.id ?? '');
        await WhatsAppLink.updateMany({ wabaId }, { status: 'disconnected', statusReason: String(info?.reason ?? event ?? 'Disconnected').slice(0, 200) });
      }
      // "history", "smb_app_state_sync" and "smb_message_echoes" carry the business's own chats and
      // contacts. FORGE has no use for them, so they are acknowledged and deliberately not stored.
    }
  }

  const statuses = (req.body?.entry ?? []).flatMap((e) => e?.changes ?? []).flatMap((c) => c?.value?.statuses ?? []);
  for (const s of statuses) {
    if (typeof s?.id !== 'string') continue;
    const log = await ActionLog.findOne({ providerId: s.id, kind: 'whatsapp' });
    if (!log) continue;
    if (s.status === 'failed') {
      // A late "failed" never overrides a message WhatsApp already confirmed as delivered.
      if (log.status === 'delivered' || log.status === 'read') continue;
      const err = s.errors?.[0];
      log.status = 'failed';
      log.reason = `${err?.code ?? ''} ${err?.error_data?.details ?? err?.title ?? err?.message ?? 'WhatsApp could not deliver this message.'}`.trim().slice(0, 300);
    } else if (PROGRESS[s.status] > (PROGRESS[log.status] ?? -1)) {
      log.status = s.status;
    } else {
      continue;
    }
    await log.save();
  }
  res.sendStatus(200);
});

export default router;
