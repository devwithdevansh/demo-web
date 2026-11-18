import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/lib/api';
import { useData, useSession } from '../session';
import { Async, Empty, FormError, PageHead, Panel, Stat, StatusBadge, useToast } from '../ui';
import type { Member } from '../types';

interface Assignments {
  members: Member[];
  trainers: { id: string; name: string; title: string }[];
  categories: string[];
}

const SELECT = 'w-full border border-line bg-ink px-2 py-2 text-sm text-bone';

/** Owner view: who trains whom, each member's category, and PT packs. */
export default function Coaching() {
  const { api } = useSession();
  const toast = useToast();
  const data = useData<Assignments>('/coach/assignments');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const save = async (m: Member, body: { trainerId?: string | null; category?: string; ptTotal?: number }, done: string) => {
    setError(null);
    try {
      await api(`/coach/members/${m.id}/assignment`, { method: 'PATCH', body });
      toast(done);
      data.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save that change.');
    }
  };

  const rows = useMemo(() => {
    const all = data.data?.members ?? [];
    if (filter === 'all') return all;
    return all.filter((m) => (filter === 'none' ? !m.trainerId : m.trainerId === filter));
  }, [data.data, filter]);

  return (
    <>
      <PageHead title="Coaching" sub="Assign members to trainers, set their category and manage personal-training packs." />
      <div className="mb-4">
        <FormError message={error} />
      </div>
      <Async state={data} label="Loading coaching">
        {({ members, trainers, categories }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {trainers.slice(0, 4).map((t) => (
                <Stat key={t.id} label={t.name} value={members.filter((m) => m.trainerId === t.id).length} note={`${t.title || 'Trainer'} · assigned members`} />
              ))}
            </div>

            <Panel
              title={`Members (${rows.length})`}
              actions={
                <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                  Show
                  <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-line bg-ink px-2 py-1.5 text-xs normal-case tracking-normal text-bone">
                    <option value="all">Everyone</option>
                    <option value="none">No trainer yet</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              }
            >
              {rows.length === 0 ? (
                <Empty title="No members here">Nobody matches this filter.</Empty>
              ) : (
                rows.map((m) => (
                  <div key={m.id} className="grid gap-3 border-b border-line px-4 py-4 last:border-b-0 sm:px-5 md:grid-cols-[minmax(0,1.3fr)_1fr_1fr_7rem_auto] md:items-end">
                    <div className="min-w-0 md:self-center">
                      <p className="truncate text-sm font-medium text-bone">{m.name}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-mute">
                        {m.planName} <StatusBadge status={m.status} />
                      </p>
                    </div>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Trainer</span>
                      <select
                        value={m.trainerId ?? ''}
                        onChange={(e) => {
                          const trainer = trainers.find((t) => t.id === e.target.value);
                          void save(m, { trainerId: e.target.value || null }, trainer ? `${m.name} assigned to ${trainer.name}.` : `${m.name} no longer has a trainer.`);
                        }}
                        className={SELECT}
                      >
                        <option value="">No trainer</option>
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Category</span>
                      <select value={m.category} onChange={(e) => save(m, { category: e.target.value }, `${m.name} moved to ${e.target.value}.`)} className={SELECT}>
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">PT pack · {m.pt.used} used</span>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        defaultValue={m.pt.total}
                        key={m.pt.total}
                        onBlur={(e) => {
                          const total = Number(e.target.value);
                          if (Number.isInteger(total) && total >= 0 && total !== m.pt.total) void save(m, { ptTotal: total }, `${m.name}'s PT pack set to ${total} sessions.`);
                          else e.target.value = String(m.pt.total);
                        }}
                        className={SELECT}
                        aria-label={`PT sessions in ${m.name}'s pack`}
                      />
                    </label>
                    <Link
                      to={m.id}
                      className="justify-self-start border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone md:justify-self-end"
                      aria-label={`Open coaching record for ${m.name}`}
                    >
                      Open record
                    </Link>
                  </div>
                ))
              )}
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
