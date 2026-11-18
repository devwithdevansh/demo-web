import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { prettyDay, time12 } from '@/lib/format';
import { useData } from '../session';
import { Async, Badge, Empty, PageHead, Panel, Row, RowMain, Stat, StatusBadge } from '../ui';
import type { ClassSlot, Member } from '../types';

interface CoachMemberRow extends Member {
  lastCheckin: string | null;
  sinceCheckin: number | null;
  hasWorkout: boolean;
}
interface Overview {
  today: string;
  trainer: { name: string; title: string };
  members: CoachMemberRow[];
  tasks: { id: string; kind: 'plan' | 'checkin' | 'pt' | 'renewal'; memberId: string; text: string }[];
  classesToday: ClassSlot[];
}

const TASK_LABEL: Record<string, string> = { plan: 'Workout plan', checkin: 'Check-in', pt: 'PT pack', renewal: 'Renewal' };

export default function TrainerToday() {
  const overview = useData<Overview>('/coach/overview');

  return (
    <>
      <PageHead
        title="Today"
        sub={overview.data ? `${prettyDay(overview.data.today)} · ${overview.data.trainer.name}, ${overview.data.trainer.title}. You only see members assigned to you.` : undefined}
      />
      <Async state={overview} label="Loading your day">
        {({ members, tasks, classesToday }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <Stat label="My members" value={members.length} />
              <Stat label="Tasks today" value={tasks.length} />
              <Stat label="Classes today" value={classesToday.length} note={classesToday.map((c) => `${time12(c.time)} ${c.name}`).join(' · ') || 'None scheduled'} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Today's tasks" hint="Worked out from check-in dates, PT packs and membership dates.">
                {tasks.length === 0 ? (
                  <Empty title="All caught up">No check-ins, plans or PT packs need attention today.</Empty>
                ) : (
                  tasks.map((t) => (
                    <Link key={t.id} to={`member/${t.memberId}`} className="group flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 transition-colors last:border-b-0 hover:bg-graphite sm:px-5">
                      <span className="min-w-0 text-sm text-bone">{t.text}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge tone={t.kind === 'renewal' ? 'warn' : 'mute'}>{TASK_LABEL[t.kind]}</Badge>
                        <ChevronRight size={16} className="text-mute transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </Link>
                  ))
                )}
              </Panel>

              <Panel title="My members">
                {members.length === 0 ? (
                  <Empty title="No members assigned">The owner assigns members to you from the Coaching screen.</Empty>
                ) : (
                  members.map((m) => (
                    <Row key={m.id}>
                      <RowMain
                        title={m.name}
                        meta={[
                          m.category,
                          m.pt.total > 0 ? `PT ${m.pt.used}/${m.pt.total}` : null,
                          m.sinceCheckin === null ? 'No check-in yet' : m.sinceCheckin === 0 ? 'Checked in today' : `Last check-in ${m.sinceCheckin} day${m.sinceCheckin === 1 ? '' : 's'} ago`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      />
                      <div className="flex items-center gap-2">
                        {!m.hasWorkout && <Badge tone="warn">No plan</Badge>}
                        {m.status !== 'active' && <StatusBadge status={m.status} />}
                        <Link
                          to={`member/${m.id}`}
                          className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone"
                          aria-label={`Open ${m.name}`}
                        >
                          Open
                        </Link>
                      </div>
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
