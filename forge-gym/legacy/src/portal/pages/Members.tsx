import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { inr, prettyDay, relDays } from '@/lib/format';
import { useData } from '../session';
import { Async, Badge, Btn, Empty, PageHead, Panel, Row, RowMain, StatusBadge } from '../ui';
import { MemberDetail, MemberForm } from '../shared';
import type { Member } from '../types';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring', label: 'Ending soon' },
  { key: 'expired', label: 'Expired' },
  { key: 'dues', label: 'Has dues' },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

export default function Members() {
  const members = useData<{ members: Member[] }>('/members');
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [adding, setAdding] = useState(params.get('add') === '1');
  const [openId, setOpenId] = useState<string | null>(null);

  const closeAdd = () => {
    setAdding(false);
    if (params.has('add')) setParams({}, { replace: true });
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (members.data?.members ?? []).filter((m) => {
      if (filter === 'dues' ? m.feeDue <= 0 : filter !== 'all' && m.status !== filter) return false;
      return !q || [m.name, m.phone, m.memberCode].some((v) => v.toLowerCase().includes(q));
    });
  }, [members.data, query, filter]);

  return (
    <>
      <PageHead
        title="Members"
        sub="Everyone on a plan, with expiry dates and dues. Open a member to edit, renew or record a payment."
        actions={
          <Btn onClick={() => setAdding(true)}>
            <Plus size={14} aria-hidden /> Add member
          </Btn>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Search members</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone or member code"
            className="w-full border border-line bg-ink py-2.5 pl-9 pr-3 text-base text-bone outline-none placeholder:text-mute/60 focus:border-bone sm:text-sm"
          />
        </label>
        <div className="scroll-x flex gap-1" role="group" aria-label="Filter members">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                filter === f.key ? 'bg-bone text-ink' : 'border border-line text-mute hover:text-bone'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Panel>
        <Async state={members} label="Loading members">
          {({ members: all }) =>
            rows.length === 0 ? (
              all.length === 0 ? (
                <Empty title="No members yet" action={<Btn onClick={() => setAdding(true)}>Add your first member</Btn>}>
                  Add a member to start tracking their plan, attendance and payments.
                </Empty>
              ) : (
                <Empty
                  title="No members match"
                  action={
                    <Btn variant="ghost" size="sm" onClick={() => { setQuery(''); setFilter('all'); }}>
                      Clear search and filters
                    </Btn>
                  }
                >
                  Try a different name or filter.
                </Empty>
              )
            ) : (
              <>
                <p className="border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mute sm:px-5">
                  {rows.length} of {all.length} members
                </p>
                {rows.map((m) => (
                  <Row key={m.id}>
                    <RowMain title={m.name} meta={`${m.memberCode} · ${m.planName} · ${m.phone}`} />
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-xs text-bone-dim">
                        {m.daysLeft < 0 ? 'Ended' : 'Ends'} {prettyDay(m.expiryDate)} <span className="text-mute">({relDays(m.daysLeft)})</span>
                      </span>
                      {m.feeDue > 0 && <Badge tone="warn">{inr(m.feeDue)} due</Badge>}
                      <StatusBadge status={m.status} />
                      <Btn variant="ghost" size="sm" onClick={() => setOpenId(m.id)} aria-label={`Open ${m.name}`}>
                        Open
                      </Btn>
                    </div>
                  </Row>
                ))}
              </>
            )
          }
        </Async>
      </Panel>

      {adding && (
        <MemberForm
          onClose={closeAdd}
          onSaved={() => {
            closeAdd();
            members.reload();
          }}
        />
      )}
      {openId && <MemberDetail memberId={openId} onClose={() => setOpenId(null)} onChanged={members.reload} />}
    </>
  );
}
