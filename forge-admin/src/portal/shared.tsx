import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { inr, prettyDay, relDays } from '@/lib/format';
import { useData, useSession } from './session';
import { AddonTag, Async, Badge, Btn, DemoNote, Field, FormError, Modal, PaymentTag, SelectField, StatusBadge, TextArea, useSubmit, useToast } from './ui';
import { CATEGORIES, PAY_METHODS, methodLabel } from './types';
import type { Member, Payment, Plan } from './types';

const num = (value: string) => (value.trim() === '' ? undefined : Number(value));

/** Renders text as a QR code image. Used for member passes and demo payment links. */
export function QrImage({ text, label, size = 180 }: { text: string; label: string; size?: number }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(text, { margin: 1, width: size * 2, color: { dark: '#0a0a0a', light: '#f1efe8' } })
      .then((url) => live && setSrc(url))
      .catch(() => live && setSrc(''));
    return () => {
      live = false;
    };
  }, [text, size]);
  return src ? <img src={src} alt={label} width={size} height={size} className="block" /> : <div style={{ width: size, height: size }} className="bg-graphite" role="img" aria-label={label} />;
}

// ---- Member add / edit ----------------------------------------------------

interface MemberFormProps {
  member?: Member;
  prefill?: { name?: string; phone?: string; notes?: string };
  onClose: () => void;
  onSaved: (member: Member) => void;
}

export function MemberForm({ member, prefill, onClose, onSaved }: MemberFormProps) {
  const { api } = useSession();
  const toast = useToast();
  const plans = useData<{ plans: Plan[] }>('/plans');
  const { busy, fields, message, run } = useSubmit();
  const [form, setForm] = useState({
    name: member?.name ?? prefill?.name ?? '',
    phone: member?.phone ?? prefill?.phone ?? '',
    email: member?.email ?? '',
    category: member?.category ?? 'General fitness',
    planId: member?.planId ?? '',
    expiryDate: member?.expiryDate ?? '',
    notes: member?.notes ?? prefill?.notes ?? '',
    paidNow: '',
    method: 'cash',
  });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const activePlans = (plans.data?.plans ?? []).filter((p) => p.active || p.id === member?.planId);
  const planId = form.planId || activePlans[0]?.id || '';
  const plan = activePlans.find((p) => p.id === planId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const shared = { name: form.name, phone: form.phone, email: form.email, category: form.category, planId, notes: form.notes };
    await run(async () => {
      const res = member
        ? await api<{ member: Member }>(`/members/${member.id}`, { method: 'PATCH', body: { ...shared, expiryDate: form.expiryDate } })
        : await api<{ member: Member }>('/members', { method: 'POST', body: { ...shared, paidNow: num(form.paidNow) ?? 0, method: form.method } });
      toast(member ? `${res.member.name} updated.` : `${res.member.name} added as ${res.member.memberCode}.`);
      onSaved(res.member);
    });
  };

  return (
    <Modal title={member ? 'Edit member' : 'Add member'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.name} onChange={set('name')} error={fields.name} autoComplete="off" required />
          <Field label="Phone" type="tel" value={form.phone} onChange={set('phone')} error={fields.phone} placeholder="00000 00000" autoComplete="off" required />
        </div>
        <Field label="Email (optional)" type="email" value={form.email} onChange={set('email')} error={fields.email} autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Plan" value={planId} onChange={set('planId')} error={fields.planId}>
            {activePlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {inr(p.price)}
              </option>
            ))}
          </SelectField>
          <SelectField label="Category" value={form.category} onChange={set('category')} error={fields.category}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectField>
        </div>
        {member ? (
          <Field label="Membership valid until" type="date" value={form.expiryDate} onChange={set('expiryDate')} error={fields.expiryDate} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Paid now (optional)"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.paidNow}
              onChange={set('paidNow')}
              error={fields.paidNow}
              hint={plan ? `Plan fee is ${inr(plan.price)}. Anything unpaid is tracked as dues.` : undefined}
            />
            <SelectField label="Paid by" value={form.method} onChange={set('method')}>
              {PAY_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </SelectField>
          </div>
        )}
        <TextArea label="Notes for staff (optional)" value={form.notes} onChange={set('notes')} error={fields.notes} />
        <FormError message={message} />
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" busy={busy} disabled={!planId}>
            {member ? 'Save changes' : 'Add member'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ---- Record a payment -----------------------------------------------------

export function PaymentForm({ member, onClose, onSaved }: { member?: Member; onClose: () => void; onSaved: () => void }) {
  const { api } = useSession();
  const toast = useToast();
  const members = useData<{ members: Member[] }>(member ? null : '/members');
  const { busy, fields, message, run } = useSubmit();
  const [memberId, setMemberId] = useState(member?.id ?? '');
  const chosen = member ?? members.data?.members.find((m) => m.id === memberId);
  const [amount, setAmount] = useState(member?.feeDue ? String(member.feeDue) : '');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chosen) return;
    const ok = await run(() => api('/payments', { method: 'POST', body: { memberId: chosen.id, amount: num(amount) ?? 0, method, note } }));
    if (ok) {
      toast(`${inr(Number(amount))} recorded for ${chosen.name}.`);
      onSaved();
    }
  };

  return (
    <Modal title="Record payment" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {member ? (
          <p className="text-sm text-bone-dim">
            {member.name} · {member.planName} · {member.feeDue > 0 ? `${inr(member.feeDue)} due` : 'no dues'}
          </p>
        ) : (
          <SelectField
            label="Member"
            value={memberId}
            error={fields.memberId}
            onChange={(e) => {
              setMemberId(e.target.value);
              const picked = members.data?.members.find((m) => m.id === e.target.value);
              if (picked?.feeDue) setAmount(String(picked.feeDue));
            }}
          >
            <option value="">{members.loading ? 'Loading members…' : 'Choose a member'}</option>
            {members.data?.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.memberCode}){m.feeDue > 0 ? ` · ${inr(m.feeDue)} due` : ''}
              </option>
            ))}
          </SelectField>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount received" type="number" inputMode="numeric" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} error={fields.amount} required />
          <SelectField label="Paid by" value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAY_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SelectField>
        </div>
        <Field label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} error={fields.note} placeholder="e.g. October fee" />
        <FormError message={message} />
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" busy={busy} disabled={!chosen}>
            Record payment
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ---- Renew ----------------------------------------------------------------

export function RenewForm({ member, onClose, onSaved }: { member: Member; onClose: () => void; onSaved: () => void }) {
  const { api } = useSession();
  const toast = useToast();
  const plans = useData<{ plans: Plan[] }>('/plans');
  const { busy, fields, message, run } = useSubmit();
  const [planId, setPlanId] = useState(member.planId);
  const [paidNow, setPaidNow] = useState('');
  const [method, setMethod] = useState('cash');
  const options = (plans.data?.plans ?? []).filter((p) => p.active || p.id === member.planId);
  const plan = options.find((p) => p.id === planId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await run(async () => {
      const res = await api<{ member: Member }>(`/members/${member.id}/renew`, { method: 'POST', body: { planId, paidNow: num(paidNow) ?? 0, method } });
      toast(`${member.name} renewed until ${prettyDay(res.member.expiryDate)}.`);
      onSaved();
    });
  };

  return (
    <Modal title="Renew membership" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <p className="text-sm leading-relaxed text-bone-dim">
          {member.name}'s membership {member.daysLeft < 0 ? 'ended' : 'ends'} on {prettyDay(member.expiryDate)}. Renewing adds one plan period
          {member.daysLeft < 0 ? ' starting today' : ' after the current end date'}.
        </p>
        <SelectField label="Plan" value={planId} onChange={(e) => setPlanId(e.target.value)} error={fields.planId}>
          {options.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {inr(p.price)}
            </option>
          ))}
        </SelectField>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Paid now (optional)"
            type="number"
            inputMode="numeric"
            min={0}
            value={paidNow}
            onChange={(e) => setPaidNow(e.target.value)}
            error={fields.paidNow}
            hint={plan ? `Fee is ${inr(plan.price)}. Unpaid amounts go to dues.` : undefined}
          />
          <SelectField label="Paid by" value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAY_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SelectField>
        </div>
        <FormError message={message} />
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" busy={busy}>
            Renew membership
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ---- Add-on: WhatsApp message ---------------------------------------------

interface Draft {
  message: string;
  to: string;
  recipient: string;
  note: string;
  /** True when WhatsApp is connected and the message will really be sent (to the demo phone). */
  live: boolean;
  /** True when delivery updates are available for sent messages. */
  tracking: boolean;
}
interface SendResult {
  status: string;
  logId: string | null;
}
type Template = 'renewal' | 'dues' | 'welcome' | 'lead_followup';

const IN_FLIGHT = ['accepted', 'sent'];
const DELIVERY: Record<string, { label: string; tone: 'ok' | 'warn' | 'bad' | 'mute' }> = {
  accepted: { label: 'Handed to WhatsApp', tone: 'warn' },
  sent: { label: 'Sent', tone: 'warn' },
  delivered: { label: 'Delivered', tone: 'ok' },
  read: { label: 'Read', tone: 'ok' },
  failed: { label: 'Not delivered', tone: 'bad' },
};

export function MessageModal({ template, memberId, leadId, onClose }: { template: Template; memberId?: string; leadId?: string; onClose: () => void }) {
  const { api, session } = useSession();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [sent, setSent] = useState<SendResult | null>(null);
  const [delivery, setDelivery] = useState<{ status: string; reason: string | null } | null>(null);
  const { busy, message, run } = useSubmit();
  const canSend = session.gym.addons.whatsapp;

  useEffect(() => {
    void run(async () => setDraft(await api<Draft>('/addons/message', { method: 'POST', body: { template, memberId, leadId, send: false } })));
  }, [api, run, template, memberId, leadId]);

  // After a real send, follow the delivery status for a short while.
  const logId = sent?.logId;
  const follow = !!draft?.live && !!draft.tracking && !!logId;
  useEffect(() => {
    if (!follow) return;
    let tries = 0;
    const timer = window.setInterval(async () => {
      tries += 1;
      const latest = await api<{ status: string; reason: string | null }>(`/addons/message/${logId}`).catch(() => null);
      if (latest) setDelivery(latest);
      if (tries >= 20 || (latest && !IN_FLIGHT.includes(latest.status))) window.clearInterval(timer);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [api, follow, logId]);

  const send = () =>
    run(async () => {
      const res = await api<SendResult>('/addons/message', { method: 'POST', body: { template, memberId, leadId, send: true } });
      setSent(res);
      setDelivery({ status: res.status, reason: null });
      if (res.status === 'simulated') toast('Logged as a simulated send. No message was delivered.', 'warn');
      else toast('Handed to WhatsApp for the demo phone.');
    });

  const state = delivery ? DELIVERY[delivery.status] : null;
  const outsideWindow = delivery?.status === 'failed' && (delivery.reason ?? '').includes('131047');

  return (
    <Modal title="WhatsApp message" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <AddonTag />
          {draft && (draft.live ? <Badge tone="ok">WhatsApp connected</Badge> : <Badge>Demo simulation</Badge>)}
        </div>
        {draft ? (
          <>
            <p className="text-xs text-mute">
              For {draft.recipient} · {draft.live ? `delivered to the ${draft.to}` : draft.to}
            </p>
            <p className="whitespace-pre-wrap border-l-2 border-ok/60 bg-ink px-4 py-3 text-sm leading-relaxed text-bone">{draft.message}</p>
            <DemoNote>{draft.note}</DemoNote>
          </>
        ) : (
          !message && <p className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-mute">Preparing draft…</p>
        )}
        <FormError message={message} />

        {sent && sent.status === 'simulated' && <p className="text-sm text-bone-dim">Recorded in the add-on activity log as simulated. The member was not contacted.</p>}
        {sent && sent.status !== 'simulated' && state && (
          <div className="space-y-2 border border-line bg-ink px-4 py-3" role="status">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={state.tone}>{state.label}</Badge>
              <span className="text-sm text-bone-dim">
                {delivery!.status === 'failed'
                  ? delivery!.reason || 'WhatsApp could not deliver this message.'
                  : IN_FLIGHT.includes(delivery!.status)
                    ? draft?.tracking
                      ? 'Waiting for the phone to confirm it arrived…'
                      : 'Delivery confirmation is not set up, so check the demo phone.'
                    : `Confirmed by WhatsApp on the ${draft?.to}.`}
              </span>
            </div>
            {outsideWindow && (
              <p className="text-xs leading-relaxed text-mute">
                WhatsApp only delivers a free-text message to someone who messaged the business number in the last 24 hours. Send "hi" from the demo phone to the
                WhatsApp number, then send this again.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            {sent ? 'Done' : 'Close'}
          </Btn>
          {draft && canSend && (!sent || outsideWindow) && (
            <Btn busy={busy} onClick={send}>
              {draft.live ? (sent ? 'Send again' : 'Send on WhatsApp') : 'Simulate send'}
            </Btn>
          )}
          {draft && !sent && (
            <Btn
              variant="ghost"
              onClick={() => {
                void navigator.clipboard?.writeText(draft.message).then(() => toast('Message copied.'));
              }}
            >
              Copy text
            </Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ---- Add-on: UPI payment link ---------------------------------------------

interface CreatedLink {
  path: string;
  amount: number;
  /** Set when a payment provider handles the link, e.g. Razorpay in test mode. */
  gateway: string | null;
}

export function UpiLinkModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const { api } = useSession();
  const addonInfo = useData<{ providers: { payments: string | false } }>('/addons');
  const { busy, fields, message, run } = useSubmit();
  const [amount, setAmount] = useState(String(member.feeDue || member.planPrice));
  const [link, setLink] = useState<CreatedLink | null>(null);
  const gateway = link ? !!link.gateway : !!addonInfo.data?.providers.payments;

  const create = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => setLink(await api<CreatedLink>('/addons/upi-link', { method: 'POST', body: { memberId: member.id, amount: num(amount) ?? 0 } })));
  };
  const url = link ? `${window.location.origin}${link.path}` : '';

  return (
    <Modal title="UPI payment link" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <AddonTag />
          {gateway ? <Badge tone="ok">Razorpay test mode</Badge> : <Badge>Demo simulation</Badge>}
        </div>
        {link ? (
          <>
            <p className="text-sm leading-relaxed text-bone-dim">
              {gateway
                ? `Payment link for ${member.name}, ${inr(link.amount)}. Open it to pay as the member would. A successful test payment is verified by Razorpay and appears in the fee records by itself.`
                : `Demo link for ${member.name}, ${inr(link.amount)}. Open it to see what the member would see, then come back: a successful practice payment appears in the fee records.`}
            </p>
            <div className="flex flex-col items-center gap-4 border border-line bg-ink p-5 sm:flex-row sm:items-start">
              <QrImage text={url} label="QR code for the payment page" size={132} />
              <div className="min-w-0 flex-1 space-y-3">
                <p className="break-all font-mono text-[11px] leading-relaxed text-bone-dim">{url}</p>
                <Link to={link.path} target="_blank" className="inline-flex bg-bone px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-red hover:text-bone">
                  {gateway ? 'Open payment page' : 'Open demo pay page'}
                </Link>
              </div>
            </div>
            <DemoNote>
              {gateway
                ? 'Razorpay is in test mode here. The payment is real as far as the software can tell, but no real money moves.'
                : 'This link opens a practice page inside the demo. It is not a real UPI link, and no money can be paid through it.'}
            </DemoNote>
            <div className="flex justify-end">
              <Btn variant="ghost" onClick={onClose}>
                Done
              </Btn>
            </div>
          </>
        ) : (
          <form onSubmit={create} className="space-y-4" noValidate>
            <p className="text-sm text-bone-dim">
              {member.name} · {member.feeDue > 0 ? `${inr(member.feeDue)} due` : 'no dues at the moment'}
            </p>
            <Field label="Amount" type="number" inputMode="numeric" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} error={fields.amount} required />
            <FormError message={message} />
            <div className="flex flex-wrap justify-end gap-2">
              <Btn variant="ghost" onClick={onClose}>
                Cancel
              </Btn>
              <Btn type="submit" busy={busy}>
                {gateway ? 'Create payment link' : 'Create demo link'}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

// ---- Member detail --------------------------------------------------------

interface Detail {
  member: Member;
  payments: Payment[];
  visits: string[];
}

export function MemberDetail({ memberId, onClose, onChanged }: { memberId: string; onClose: () => void; onChanged: () => void }) {
  const { session } = useSession();
  const detail = useData<Detail>(`/members/${memberId}`);
  const [panel, setPanel] = useState<'edit' | 'pay' | 'renew' | 'message' | 'link' | null>(null);
  const { addons } = session.gym;
  const changed = () => {
    setPanel(null);
    detail.reload();
    onChanged();
  };

  return (
    <Modal title="Member" onClose={onClose} wide>
      <Async state={detail}>
        {({ member: m, payments, visits }) => (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-3xl leading-none text-bone">{m.name}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
                  {m.memberCode} · {m.category}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
              {[
                ['Plan', m.planName],
                ['Valid until', `${prettyDay(m.expiryDate)} (${relDays(m.daysLeft)})`],
                ['Dues', m.feeDue > 0 ? inr(m.feeDue) : 'None'],
                ['Visits, last 30 days', String(visits.length)],
                ['Phone', m.phone],
                ['Email', m.email || '—'],
                ['Joined', prettyDay(m.startDate)],
                ['Trainer', m.trainerName ?? 'Not assigned'],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{label}</dt>
                  <dd className="mt-1 break-words text-bone">{value}</dd>
                </div>
              ))}
            </dl>
            {m.notes && <p className="border-l border-line pl-3 text-sm leading-relaxed text-bone-dim">{m.notes}</p>}

            <div className="flex flex-wrap gap-2">
              <Btn size="sm" onClick={() => setPanel('pay')}>
                Record payment
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setPanel('renew')}>
                Renew
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setPanel('edit')}>
                Edit details
              </Btn>
              {addons.whatsapp && (
                <Btn size="sm" variant="ghost" onClick={() => setPanel('message')}>
                  WhatsApp reminder
                </Btn>
              )}
              {addons.upiLinks && (
                <Btn size="sm" variant="ghost" onClick={() => setPanel('link')}>
                  UPI link
                </Btn>
              )}
            </div>

            <div>
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">Recent payments</h3>
              {payments.length === 0 ? (
                <p className="text-sm text-mute">No payments recorded yet.</p>
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <span className="text-bone-dim">
                        {prettyDay(p.paidOn)} · {methodLabel(p.method)}
                        {p.note ? ` · ${p.note}` : ''}
                      </span>
                      <span className="flex items-center gap-2 text-bone">
                        <PaymentTag payment={p} />
                        {inr(p.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {panel === 'edit' && <MemberForm member={m} onClose={() => setPanel(null)} onSaved={changed} />}
            {panel === 'pay' && <PaymentForm member={m} onClose={() => setPanel(null)} onSaved={changed} />}
            {panel === 'renew' && <RenewForm member={m} onClose={() => setPanel(null)} onSaved={changed} />}
            {panel === 'message' && <MessageModal template={m.feeDue > 0 ? 'dues' : 'renewal'} memberId={m.id} onClose={() => setPanel(null)} />}
            {panel === 'link' && <UpiLinkModal member={m} onClose={changed} />}
          </div>
        )}
      </Async>
    </Modal>
  );
}
