import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ADDONS, FEES_NOTE, packageByKey } from '@/config/forge';
import type { ForgeAddon } from '@/config/forge';
import { ApiError } from '@/lib/api';
import type { Addons as AddonState } from '@/lib/api';
import { inr, stamp } from '@/lib/format';
import { useData, useSession } from '../session';
import { Async, Badge, DemoNote, Empty, FormError, PageHead, Panel, Row, RowMain, useToast } from '../ui';
import type { ActionLog } from '../types';

interface AddonData {
  addons: AddonState;
  providers: { whatsapp: string | false; whatsappFrom: string | null; whatsappTracking: boolean; payments: string | false };
  activity: ActionLog[];
}

const READINESS_TONE = { 'Available in demo': 'ok', Preview: 'warn', 'Coming soon': 'mute' } as const;
const LOG_STATUS: Record<string, string> = {
  simulated: 'Simulated', pending: 'Link not used yet', paid: 'Paid (simulated)', failed: 'Failed',
  accepted: 'Handed to WhatsApp', sent: 'Sent', delivered: 'Delivered', read: 'Read',
};
const logLabel = (a: ActionLog) => (a.status === 'paid' && a.gateway ? 'Paid (test mode)' : (LOG_STATUS[a.status] ?? a.status));

export default function Addons() {
  const { api, role, tier, setAddons } = useSession();
  const toast = useToast();
  const data = useData<AddonData>('/addons');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const base = `/demo/${tier}/${role}`;
  const owner = role === 'owner';

  // Where each add-on can be tried in this demo.
  const tryAt: Partial<Record<ForgeAddon['key'], { to: string; label: string } | { note: string }>> = {
    whatsapp: { to: `${base}/renewals`, label: 'Try it in Renewals' },
    upiLinks: { to: `${base}/payments`, label: 'Try it in Payments' },
    autopay: tier === 'performance' ? { to: '/demo/performance/member/autopay', label: 'Approve as the member' } : { to: `${base}/renewals`, label: 'Request it in Renewals' },
    leadFollowup: { to: `${base}/leads`, label: 'Try it in Leads' },
    trainerPlus: tier === 'performance' ? { to: '/demo/performance/trainer', label: 'Open the trainer view' } : { note: 'Shown in the Performance demo.' },
  };

  const toggle = async (key: keyof AddonState, enabled: boolean) => {
    setBusyKey(key);
    setError(null);
    try {
      const res = await api<{ addons: AddonState }>('/addons', { method: 'PATCH', body: { key, enabled } });
      setAddons(res.addons);
      data.reload();
      toast(`${ADDONS.find((a) => a.key === key)?.name} switched ${enabled ? 'on' : 'off'} for this demo.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change that add-on.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <>
      <PageHead title="Add-ons" sub="Optional extras that sit on top of a package. Switch them on or off to see what changes in this demo." />
      <div className="mb-5 space-y-3">
        <FormError message={error} />
        {data.data && (
          <DemoNote>
            {data.data.providers.payments
              ? 'Payments are connected to Razorpay in test mode: payment links take a real test payment, and no real money moves. '
              : 'No payment provider is connected: payment links open a practice page where no money moves. '}
            {data.data.providers.whatsapp
              ? `WhatsApp is connected and sends from ${data.data.providers.whatsappFrom ?? 'the connected number'}: demo messages are delivered to the demo phone only, never to the sample members. `
              : 'No WhatsApp provider is connected: messages are drafted and logged as simulated. '}
            {FEES_NOTE}
          </DemoNote>
        )}
      </div>

      <Async state={data} label="Loading add-ons">
        {({ addons, activity }) => (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {ADDONS.map((addon) => {
                const stateKey = addon.key === 'multiBranch' ? null : addon.key;
                const enabled = stateKey ? addons[stateKey] : false;
                const applies = addon.extends.includes(tier);
                const spot = tryAt[addon.key];
                return (
                  <section key={addon.key} className="flex flex-col border border-line bg-ink-2 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="font-display text-2xl leading-none text-bone">{addon.name}</h2>
                      <Badge tone={READINESS_TONE[addon.readiness]}>{addon.readiness}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-bone-dim">{addon.does}</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Extends {addon.extends.map((k) => packageByKey(k).name).join(' and ')}</p>
                    <p className="mt-3 text-xs leading-relaxed text-mute">{addon.demoNote}</p>
                    {addon.thirdParty && <p className="mt-2 text-xs leading-relaxed text-mute">{addon.thirdParty} Billed separately from FORGE.</p>}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                      {stateKey ? (
                        <label className={`flex items-center gap-3 text-sm ${owner && applies ? 'text-bone' : 'text-mute'}`}>
                          <input
                            type="checkbox"
                            role="switch"
                            checked={enabled}
                            disabled={!owner || !applies || busyKey === stateKey}
                            onChange={(e) => toggle(stateKey, e.target.checked)}
                            className="h-4 w-4 accent-[var(--color-red)]"
                          />
                          {enabled ? 'On in this demo' : 'Off in this demo'}
                        </label>
                      ) : (
                        <span className="text-sm text-mute">Not available yet</span>
                      )}
                      {stateKey && enabled && spot && 'to' in spot && (
                        <Link to={spot.to} className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim underline decoration-line underline-offset-4 hover:text-bone">
                          {spot.label}
                        </Link>
                      )}
                      {spot && 'note' in spot && <span className="text-xs text-mute">{spot.note}</span>}
                    </div>
                  </section>
                );
              })}
            </div>
            {!owner && <p className="text-xs text-mute">Only the owner can switch add-ons on or off.</p>}

            <Panel title="Add-on activity" hint="Every message and payment step taken in this demo, with what actually happened.">
              {activity.length === 0 ? (
                <Empty title="No add-on activity yet">Draft a reminder or create a payment link and it is recorded here.</Empty>
              ) : (
                activity.map((a) => (
                  <Row key={a.id}>
                    <RowMain
                      title={a.title}
                      meta={
                        <>
                          {stamp(a.createdAt)}
                          {a.amount ? ` · ${inr(a.amount)}` : ''}
                          {a.detail && <span className="mt-0.5 block whitespace-pre-line">{a.detail}</span>}
                          {a.reason && <span className="mt-0.5 block text-bone-dim">{a.reason}</span>}
                        </>
                      }
                    />
                    <Badge tone={a.status === 'delivered' || a.status === 'read' ? 'ok' : a.status === 'failed' ? 'bad' : 'mute'}>{logLabel(a)}</Badge>
                  </Row>
                ))
              )}
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
