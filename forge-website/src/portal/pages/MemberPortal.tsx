import { useState } from 'react';
import { Link } from 'react-router-dom';
import { inr, prettyDay, relDays, shortDay, stamp, time12 } from '@/lib/format';
import { useData, useSession } from '../session';
import { AddonTag, Async, Badge, Btn, DemoNote, Empty, FormError, PageHead, Panel, Row, RowMain, Stat, StatusBadge, useSubmit, useToast } from '../ui';
import { LogList, WorkoutView } from '../coaching';
import { ChartCard, LineChart } from '../charts';
import { QrImage } from '../shared';
import type { Announcement, ClassSlot, CoachLog, Member } from '../types';

interface PortalData {
  today: string;
  weekday: string;
  gymName: string;
  member: Member & { trainerTitle: string | null };
  logs: CoachLog[];
  visits: string[];
  announcements: Announcement[];
  slots: ClassSlot[];
  addons: { autopay: boolean };
}

const usePortal = () => useData<PortalData>('/portal');
const LINK = 'font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim underline decoration-line underline-offset-4 hover:text-bone';

// ---- Home -----------------------------------------------------------------

export function MemberHome() {
  const portal = usePortal();
  return (
    <Async state={portal} label="Loading your membership">
      {({ member: m, announcements, slots, weekday, visits, today }) => {
        const classes = slots.filter((s) => s.day === weekday);
        return (
          <>
            <PageHead title={`Hi, ${m.name.split(' ')[0]}`} sub="Your membership, today's classes and the latest from the gym." />
            <div className="space-y-6">
              <section className="border border-line bg-ink-2 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Membership</p>
                    <p className="mt-2 font-display text-4xl leading-none text-bone">{m.planName}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
                  {[
                    ['Valid until', `${prettyDay(m.expiryDate)}`],
                    ['Time left', m.daysLeft < 0 ? `Ended ${relDays(m.daysLeft)}` : m.daysLeft === 0 ? 'Ends today' : `${m.daysLeft} days`],
                    ['Fees due', m.feeDue > 0 ? inr(m.feeDue) : 'Nothing due'],
                    ['Member code', m.memberCode],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{label}</dt>
                      <dd className="mt-1 text-bone">{value}</dd>
                    </div>
                  ))}
                </dl>
                {m.status !== 'active' && (
                  <p className="mt-5 border-l-2 border-warn/70 pl-3 text-sm leading-relaxed text-bone-dim">
                    {m.status === 'expired' ? 'Your membership has ended.' : 'Your membership ends soon.'} Speak to the front desk to renew.
                  </p>
                )}
              </section>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <Stat label="Visits, last 30 days" value={visits.length} note={visits.length ? `Last visit ${shortDay(visits[visits.length - 1])}` : 'No visits recorded yet'} />
                <Stat label="Your trainer" value={<span className="text-2xl sm:text-3xl">{m.trainerName ?? 'Not assigned'}</span>} note={m.trainerTitle ?? undefined} />
                <Stat label="PT sessions" value={m.pt.total > 0 ? `${m.pt.total - m.pt.used} left` : 'None'} note={m.pt.total > 0 ? `${m.pt.used} of ${m.pt.total} used` : 'No personal-training pack'} />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Panel title="Notices from the gym">
                  {announcements.length === 0 ? (
                    <Empty title="No notices">Announcements from the gym will appear here.</Empty>
                  ) : (
                    announcements.map((a) => (
                      <div key={a.id} className="border-b border-line px-4 py-4 last:border-b-0 sm:px-5">
                        <p className="text-sm font-medium text-bone">{a.title}</p>
                        {a.body && <p className="mt-1 text-sm leading-relaxed text-bone-dim">{a.body}</p>}
                        <p className="mt-2 text-xs text-mute">{stamp(a.createdAt)}</p>
                      </div>
                    ))
                  )}
                </Panel>

                <Panel title={`Classes today · ${prettyDay(today)}`} actions={<Link to="timetable" className={LINK}>Full timetable</Link>}>
                  {classes.length === 0 ? (
                    <Empty title="No classes today">Check the full timetable for the rest of the week.</Empty>
                  ) : (
                    classes.map((s) => (
                      <Row key={s.id}>
                        <RowMain title={s.name} meta={`${time12(s.time)} · ${s.durationMin} min${s.trainerName ? ` · ${s.trainerName}` : ''}`} />
                      </Row>
                    ))
                  )}
                </Panel>
              </div>
            </div>
          </>
        );
      }}
    </Async>
  );
}

// ---- Workout --------------------------------------------------------------

export function MemberWorkout() {
  const portal = usePortal();
  return (
    <>
      <PageHead title="Workout" sub="The plan your trainer has set for you." />
      <Async state={portal} label="Loading your plan">
        {({ member: m }) =>
          m.workout?.days?.length ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border border-line bg-ink-2 px-4 py-4 sm:px-5">
                <p className="font-display text-3xl leading-none text-bone">{m.workout.title}</p>
                <p className="text-xs text-mute">
                  {m.workout.updatedBy ? `Set by ${m.workout.updatedBy}` : 'Set by your trainer'}
                  {m.workout.updatedAt ? ` · updated ${stamp(m.workout.updatedAt)}` : ''}
                </p>
              </div>
              <WorkoutView workout={m.workout} />
            </div>
          ) : (
            <Panel>
              <Empty title="No plan yet">{m.trainerName ? `${m.trainerName} has not assigned a workout plan yet.` : 'A plan appears here once a trainer is assigned to you.'}</Empty>
            </Panel>
          )
        }
      </Async>
    </>
  );
}

// ---- Progress -------------------------------------------------------------

export function MemberProgress() {
  const portal = usePortal();
  const kg = (n: number) => `${+n.toFixed(1)} kg`;
  return (
    <>
      <PageHead title="Progress" sub="Check-ins, measurements and PT sessions recorded by your trainer." />
      <Async state={portal} label="Loading your progress">
        {({ logs }) => {
          const weights = logs.filter((l) => l.type === 'measurement' && l.weightKg !== undefined).reverse();
          const change = weights.length > 1 ? weights[weights.length - 1].weightKg! - weights[0].weightKg! : null;
          return (
            <div className="space-y-6">
              {weights.length > 1 && (
                <ChartCard
                  title="Weight"
                  hint={`${weights.length} readings since ${prettyDay(weights[0].day)}${change !== null ? ` · ${change > 0 ? '+' : ''}${change.toFixed(1)} kg overall` : ''}`}
                  columns={['Date', 'Weight']}
                  rows={weights.map((w) => [prettyDay(w.day), kg(w.weightKg!)])}
                >
                  <LineChart format={kg} data={weights.map((w) => ({ label: shortDay(w.day), full: prettyDay(w.day), value: w.weightKg! }))} />
                </ChartCard>
              )}
              <Panel title="History">
                {logs.length === 0 ? <Empty title="Nothing recorded yet">Your trainer's check-ins and measurements will appear here.</Empty> : <LogList logs={logs} />}
              </Panel>
            </div>
          );
        }}
      </Async>
    </>
  );
}

// ---- Diet guidance --------------------------------------------------------

export function MemberDiet() {
  const portal = usePortal();
  return (
    <>
      <PageHead title="Diet guide" sub="Guidance shared by your gym's team to support your training." />
      <Async state={portal} label="Loading your guide">
        {({ member: m, gymName }) => (
          <div className="space-y-5">
            <DemoNote>
              This is general guidance written by the staff at {gymName.replace(/\s*\(.*\)$/, '')}. It is not medical advice. If you have a health condition, allergies or
              specific dietary needs, speak to a doctor or a registered dietitian.
            </DemoNote>
            {m.diet?.meals?.length || m.diet?.note ? (
              <Panel title={m.diet.title || 'Eating guide'} hint={`${m.diet.updatedBy ? `From ${m.diet.updatedBy}` : 'From your gym'}${m.diet.updatedAt ? ` · updated ${stamp(m.diet.updatedAt)}` : ''}`}>
                {m.diet.note && <p className="border-b border-line px-4 py-4 text-sm leading-relaxed text-bone-dim sm:px-5">{m.diet.note}</p>}
                <dl>
                  {m.diet.meals.map((meal, i) => (
                    <div key={`${meal.label}-${i}`} className="grid gap-1 border-b border-line px-4 py-3.5 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:px-5">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute sm:pt-0.5">{meal.label}</dt>
                      <dd className="text-sm leading-relaxed text-bone">{meal.items}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            ) : (
              <Panel>
                <Empty title="No guide yet">Your gym has not shared any diet guidance with you.</Empty>
              </Panel>
            )}
          </div>
        )}
      </Async>
    </>
  );
}

// ---- Check-in pass --------------------------------------------------------

export function MemberPass() {
  const portal = usePortal();
  return (
    <>
      <PageHead title="My pass" sub="Show this at the front desk to check in." />
      <Async state={portal} label="Loading your pass">
        {({ member: m, gymName, visits, today }) => (
          <div className="mx-auto max-w-sm border border-line bg-ink-2 p-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">{gymName}</p>
            <div className="mt-5 flex justify-center">
              <QrImage text={m.memberCode} label={`Check-in code ${m.memberCode}`} size={208} />
            </div>
            <p className="mt-5 font-display text-3xl leading-none text-bone">{m.name}</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-bone-dim">{m.memberCode}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <StatusBadge status={m.status} />
              {visits.includes(today) && <Badge tone="ok">Checked in today</Badge>}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-mute">
              {m.planName} · valid until {prettyDay(m.expiryDate)}
            </p>
          </div>
        )}
      </Async>
    </>
  );
}

// ---- Autopay add-on -------------------------------------------------------

type AutopayAction = 'approve' | 'pause' | 'resume' | 'cancel';
const AUTOPAY_COPY: Record<string, { label: string; tone: 'ok' | 'warn' | 'mute'; text: string }> = {
  none: { label: 'Not set up', tone: 'mute', text: 'Autopay is off. Your fees are paid at the front desk as usual.' },
  requested: { label: 'Waiting for you', tone: 'warn', text: 'The gym has invited you to set up Autopay. Nothing happens unless you approve it below.' },
  active: { label: 'On', tone: 'ok', text: 'Autopay is on. You can pause or cancel it here at any time.' },
  paused: { label: 'Paused', tone: 'warn', text: 'Autopay is paused. Nothing is collected until you resume it.' },
  cancelled: { label: 'Cancelled', tone: 'mute', text: 'You cancelled Autopay. You can set it up again whenever you like.' },
};

export function MemberAutopay() {
  const { api } = useSession();
  const toast = useToast();
  const portal = usePortal();
  const { busy, message, run } = useSubmit();
  const [consent, setConsent] = useState(false);

  const act = async (action: AutopayAction, done: string) => {
    if (await run(() => api('/portal/autopay', { method: 'POST', body: { action, consent: action === 'approve' ? consent : undefined } }))) {
      toast(done);
      setConsent(false);
      portal.reload();
    }
  };

  return (
    <>
      <PageHead title="Autopay" sub="Pay your membership fee automatically each period, with your approval." actions={<AddonTag />} />
      <Async state={portal} label="Loading Autopay">
        {({ member: m, addons, gymName }) => {
          if (!addons.autopay) {
            return (
              <Panel>
                <Empty title="Autopay is not available">This gym has not switched on the Autopay add-on.</Empty>
              </Panel>
            );
          }
          const status = m.autopay?.status ?? 'none';
          const copy = AUTOPAY_COPY[status];
          const amount = m.autopay?.amount ?? m.planPrice;
          const canApprove = ['none', 'requested', 'cancelled'].includes(status);
          return (
            <div className="max-w-2xl space-y-5">
              <DemoNote>Practice screen. No bank or UPI app is contacted, no mandate is created and no money is collected in this demo.</DemoNote>

              <section className="border border-line bg-ink-2 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Autopay status</p>
                    <p className="mt-2 font-display text-4xl leading-none text-bone">{copy.label}</p>
                  </div>
                  <Badge tone={copy.tone}>{copy.label}</Badge>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-bone-dim">{copy.text}</p>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Plan</dt>
                    <dd className="mt-1 text-bone">{m.planName}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Amount each period</dt>
                    <dd className="mt-1 text-bone">{inr(amount)}</dd>
                  </div>
                </dl>

                <div className="mt-6 space-y-4 border-t border-line pt-5">
                  <FormError message={message} />
                  {canApprove && (
                    <>
                      <label className="flex items-start gap-3 text-sm leading-relaxed text-bone">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-red)]" />
                        <span>
                          I approve {gymName.replace(/\s*\(.*\)$/, '')} collecting {inr(amount)} for my {m.planName} membership each period. I can pause or cancel this at any time.
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Btn busy={busy} disabled={!consent} onClick={() => act('approve', 'Autopay approved (demo). Nothing will actually be charged.')}>
                          Approve Autopay
                        </Btn>
                        {status === 'requested' && (
                          <Btn variant="ghost" busy={busy} onClick={() => act('cancel', 'Request declined. Autopay stays off.')}>
                            No thanks
                          </Btn>
                        )}
                      </div>
                    </>
                  )}
                  {status === 'active' && (
                    <div className="flex flex-wrap gap-2">
                      <Btn variant="ghost" busy={busy} onClick={() => act('pause', 'Autopay paused.')}>
                        Pause Autopay
                      </Btn>
                      <Btn variant="ghost" busy={busy} onClick={() => act('cancel', 'Autopay cancelled.')}>
                        Cancel Autopay
                      </Btn>
                    </div>
                  )}
                  {status === 'paused' && (
                    <div className="flex flex-wrap gap-2">
                      <Btn busy={busy} onClick={() => act('resume', 'Autopay resumed.')}>
                        Resume Autopay
                      </Btn>
                      <Btn variant="ghost" busy={busy} onClick={() => act('cancel', 'Autopay cancelled.')}>
                        Cancel Autopay
                      </Btn>
                    </div>
                  )}
                </div>
              </section>
              <p className="text-xs leading-relaxed text-mute">The gym can invite you to use Autopay, but only you can switch it on. Payment provider charges, if any, are set by the provider.</p>
            </div>
          );
        }}
      </Async>
    </>
  );
}
