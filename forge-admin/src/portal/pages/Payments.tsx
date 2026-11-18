import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { inr, prettyDay } from '@/lib/format';
import { useData, useSession } from '../session';
import { AddonTag, Async, Badge, Btn, Empty, PageHead, PaymentTag, Panel, Row, RowMain, Stat } from '../ui';
import { MessageModal, PaymentForm, UpiLinkModal } from '../shared';
import { methodLabel } from '../types';
import type { Member, Payment } from '../types';

interface Ledger {
  payments: Payment[];
  dues: Member[];
  totals: { today: number; month: number | null; dues: number };
}
type Open = { kind: 'pay'; member?: Member } | { kind: 'link' | 'message'; member: Member } | null;

export default function Payments() {
  const { session } = useSession();
  const { addons } = session.gym;
  const ledger = useData<Ledger>('/payments');
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState<Open>(params.get('add') === '1' ? { kind: 'pay' } : null);

  const close = () => {
    setOpen(null);
    if (params.has('add')) setParams({}, { replace: true });
    ledger.reload();
  };

  return (
    <>
      <PageHead
        title="Payments"
        sub="Record fees as they come in and see who still owes what."
        actions={
          <Btn onClick={() => setOpen({ kind: 'pay' })}>
            <Plus size={14} aria-hidden /> Record payment
          </Btn>
        }
      />
      <Async state={ledger} label="Loading payments">
        {({ payments, dues, totals }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <Stat label="Collected today" value={inr(totals.today)} />
              <Stat label="Collected this month" value={totals.month === null ? '—' : inr(totals.month)} note={totals.month === null ? 'Shown to the owner' : undefined} />
              <Stat label="Dues pending" value={inr(totals.dues)} note={`${dues.length} member${dues.length === 1 ? '' : 's'}`} />
            </div>

            <Panel title="Dues to collect" hint="Fees charged on a plan that have not been fully paid yet.">
              {dues.length === 0 ? (
                <Empty title="No dues pending">Every member is paid up.</Empty>
              ) : (
                dues.map((m) => (
                  <Row key={m.id}>
                    <RowMain title={m.name} meta={`${m.memberCode} · ${m.planName} · ${m.phone}`} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="warn">{inr(m.feeDue)} due</Badge>
                      <Btn size="sm" onClick={() => setOpen({ kind: 'pay', member: m })} aria-label={`Record payment for ${m.name}`}>
                        Record payment
                      </Btn>
                      {addons.upiLinks && (
                        <Btn size="sm" variant="ghost" onClick={() => setOpen({ kind: 'link', member: m })} aria-label={`Create UPI link for ${m.name}`}>
                          UPI link
                        </Btn>
                      )}
                      {addons.whatsapp && (
                        <Btn size="sm" variant="ghost" onClick={() => setOpen({ kind: 'message', member: m })} aria-label={`Send reminder to ${m.name}`}>
                          Reminder
                        </Btn>
                      )}
                    </div>
                  </Row>
                ))
              )}
              {(addons.upiLinks || addons.whatsapp) && dues.length > 0 && (
                <p className="flex items-center gap-2 border-t border-line px-4 py-3 text-xs text-mute sm:px-5">
                  <AddonTag /> UPI links and reminders come from add-ons. No real money moves in this demo.
                </p>
              )}
            </Panel>

            <Panel title="Recent payments">
              {payments.length === 0 ? (
                <Empty title="No payments recorded" action={<Btn onClick={() => setOpen({ kind: 'pay' })}>Record a payment</Btn>} />
              ) : (
                payments.map((p) => (
                  <Row key={p.id}>
                    <RowMain title={p.memberName} meta={`${prettyDay(p.paidOn)} · ${methodLabel(p.method)}${p.note ? ` · ${p.note}` : ''}`} />
                    <span className="flex items-center gap-2 text-sm text-bone">
                      <PaymentTag payment={p} />
                      {inr(p.amount)}
                    </span>
                  </Row>
                ))
              )}
            </Panel>
          </div>
        )}
      </Async>

      {open?.kind === 'pay' && <PaymentForm member={open.member} onClose={close} onSaved={close} />}
      {open?.kind === 'link' && <UpiLinkModal member={open.member} onClose={close} />}
      {open?.kind === 'message' && <MessageModal template="dues" memberId={open.member.id} onClose={close} />}
    </>
  );
}
