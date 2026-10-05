import { Link } from 'react-router-dom';
import { inr, prettyDay, relDays } from '@/lib/format';
import { useData, useSession } from '../session';
import { Async, Badge, Empty, PageHead, PaymentTag, Panel, Row, RowMain, Stat } from '../ui';
import { methodLabel } from '../types';
import type { Lead, Member, Payment } from '../types';

interface Dashboard {
  today: string;
  counts: {
    activeMembers: number;
    expiringSoon: number;
    lapsed: number;
    checkinsToday: number;
    collectedToday: number;
    collectedMonth: number | null;
    duesTotal: number;
    duesMembers: number;
    openLeads: number;
    followUpsDue: number;
  };
  checkins: { id: string; name: string; time: string; method: string }[];
  expiring: Member[];
  followUps: Lead[];
  payments: Payment[];
}

const LINK = 'font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim underline decoration-line underline-offset-4 hover:text-bone';
const ACTION = 'border border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone';

export default function Today() {
  const { tier, role, session } = useSession();
  const base = `/demo/${tier}/${role}`;
  const dash = useData<Dashboard>('/dashboard');

  return (
    <>
      <PageHead
        title="Today"
        sub={`${dash.data ? prettyDay(dash.data.today) : 'Loading'} · A simple view of the day at ${session.gym.name.replace(/\s*\(.*\)$/, '')}.`}
        actions={
          <>
            <Link to={`${base}/attendance`} className={`${ACTION} bg-bone !text-ink hover:bg-red hover:!text-bone`}>
              Check in a member
            </Link>
            <Link to={`${base}/members?add=1`} className={ACTION}>
              Add member
            </Link>
            <Link to={`${base}/payments?add=1`} className={ACTION}>
              Record payment
            </Link>
          </>
        }
      />
      <Async state={dash} label="Loading today">
        {({ counts, checkins, expiring, followUps, payments }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Checked in today" value={counts.checkinsToday} note={`${counts.activeMembers} active members`} />
              <Stat
                label="Collected today"
                value={inr(counts.collectedToday)}
                note={counts.collectedMonth === null ? 'Monthly total is shown to the owner' : `${inr(counts.collectedMonth)} this month`}
              />
              <Stat
                label="Dues pending"
                value={inr(counts.duesTotal)}
                note={`${counts.duesMembers} member${counts.duesMembers === 1 ? '' : 's'}`}
                badge={counts.duesMembers > 0 ? <Badge tone="warn">To collect</Badge> : undefined}
              />
              <Stat
                label="Memberships ending soon"
                value={counts.expiringSoon}
                note={`${counts.lapsed} lapsed recently`}
                badge={counts.expiringSoon > 0 ? <Badge tone="warn">Next 7 days</Badge> : undefined}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Recent check-ins" actions={<Link to={`${base}/attendance`} className={LINK}>Open attendance</Link>}>
                {checkins.length === 0 ? (
                  <Empty title="No check-ins yet">Check-ins made at the front desk today will show up here.</Empty>
                ) : (
                  checkins.map((c) => (
                    <Row key={c.id}>
                      <RowMain title={c.name} meta={c.time} />
                      <Badge>{c.method === 'qr' ? 'QR pass' : 'Front desk'}</Badge>
                    </Row>
                  ))
                )}
              </Panel>

              <Panel title="Ending soon" hint="Memberships that end in the next 7 days." actions={<Link to={`${base}/renewals`} className={LINK}>Open renewals</Link>}>
                {expiring.length === 0 ? (
                  <Empty title="Nothing ending this week" />
                ) : (
                  expiring.map((m) => (
                    <Row key={m.id}>
                      <RowMain title={m.name} meta={`${m.planName} · ends ${relDays(m.daysLeft)}`} />
                      <span className="text-sm text-bone-dim">{prettyDay(m.expiryDate)}</span>
                    </Row>
                  ))
                )}
              </Panel>

              <Panel title="Follow-ups due" hint={`${counts.openLeads} open enquiries in total.`} actions={<Link to={`${base}/leads`} className={LINK}>Open leads</Link>}>
                {followUps.length === 0 ? (
                  <Empty title="No follow-ups due">Enquiries with a follow-up date of today or earlier appear here.</Empty>
                ) : (
                  followUps.map((l) => (
                    <Row key={l.id}>
                      <RowMain title={l.name} meta={[l.interest, l.phone].filter(Boolean).join(' · ')} />
                      <Badge tone={l.followUpOn && l.followUpOn < dash.data!.today ? 'bad' : 'warn'}>{l.followUpOn && l.followUpOn < dash.data!.today ? 'Overdue' : 'Due today'}</Badge>
                    </Row>
                  ))
                )}
              </Panel>

              <Panel title="Payments today" actions={<Link to={`${base}/payments`} className={LINK}>Open payments</Link>}>
                {payments.length === 0 ? (
                  <Empty title="No payments yet today">Record a payment and it appears here and in the totals above.</Empty>
                ) : (
                  payments.map((p) => (
                    <Row key={p.id}>
                      <RowMain title={p.memberName} meta={`${methodLabel(p.method)}${p.note ? ` · ${p.note}` : ''}`} />
                      <span className="flex items-center gap-2 text-sm text-bone">
                        <PaymentTag payment={p} />
                        {inr(p.amount)}
                      </span>
                    </Row>
                  ))
                )}
              </Panel>
            </div>
          </div>
        )}
      </Async>
    </>
  );
}
