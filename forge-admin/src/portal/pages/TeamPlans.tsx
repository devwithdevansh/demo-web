import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { inr } from '@/lib/format';
import { useData, useSession } from '../session';
import { Async, Badge, Btn, Empty, Field, FormError, Modal, PageHead, Panel, Row, RowMain, SelectField, useSubmit, useToast } from '../ui';
import type { Plan } from '../types';

// ---- Team -----------------------------------------------------------------

interface TeamMember {
  id: string;
  name: string;
  role: 'owner' | 'staff' | 'trainer';
  title: string;
  phone: string;
  active: boolean;
  members: number;
}
const ROLE_NAME: Record<TeamMember['role'], string> = { owner: 'Owner', staff: 'Front desk', trainer: 'Trainer' };

function TeamForm({ person, onClose, onSaved }: { person?: TeamMember; onClose: () => void; onSaved: () => void }) {
  const { api } = useSession();
  const toast = useToast();
  const { busy, fields, message, run } = useSubmit();
  const [form, setForm] = useState({ name: person?.name ?? '', role: person?.role === 'staff' ? 'staff' : 'trainer', title: person?.title ?? '', phone: person?.phone ?? '' });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { role, ...rest } = form;
    const ok = await run(() => (person ? api(`/team/${person.id}`, { method: 'PATCH', body: rest }) : api('/team', { method: 'POST', body: { ...rest, role } })));
    if (ok) {
      toast(person ? `${form.name} updated.` : `${form.name} added to the team.`);
      onSaved();
    }
  };

  return (
    <Modal title={person ? 'Edit team member' : 'Add team member'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" value={form.name} onChange={set('name')} error={fields.name} autoComplete="off" required />
        <div className="grid gap-4 sm:grid-cols-2">
          {!person && (
            <SelectField label="Role" value={form.role} onChange={set('role')}>
              <option value="trainer">Trainer</option>
              <option value="staff">Front desk</option>
            </SelectField>
          )}
          <Field label="Job title" value={form.title} onChange={set('title')} error={fields.title} placeholder="e.g. Strength Coach" />
        </div>
        <Field label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} error={fields.phone} autoComplete="off" />
        <FormError message={message} />
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" busy={busy}>
            {person ? 'Save changes' : 'Add to team'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

export function Team() {
  const { role, tier } = useSession();
  const team = useData<{ team: TeamMember[] }>('/team');
  const [editing, setEditing] = useState<TeamMember | 'new' | null>(null);
  const owner = role === 'owner';

  return (
    <>
      <PageHead
        title="Team"
        sub={owner ? 'Trainers and front-desk staff at the gym.' : 'Trainers and front-desk staff. Only the owner can make changes here.'}
        actions={
          owner ? (
            <Btn onClick={() => setEditing('new')}>
              <Plus size={14} aria-hidden /> Add team member
            </Btn>
          ) : undefined
        }
      />
      <Panel>
        <Async state={team} label="Loading team">
          {({ team: people }) =>
            people.length === 0 ? (
              <Empty title="No team members yet" />
            ) : (
              people.map((p) => (
                <Row key={p.id}>
                  <RowMain title={p.name} meta={[p.title, p.phone].filter(Boolean).join(' · ')} />
                  <div className="flex flex-wrap items-center gap-2">
                    {p.role === 'trainer' && tier === 'performance' && <span className="text-xs text-mute">{p.members} assigned</span>}
                    <Badge tone={p.role === 'owner' ? 'info' : 'mute'}>{ROLE_NAME[p.role]}</Badge>
                    {owner && p.role !== 'owner' && (
                      <Btn size="sm" variant="quiet" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                        Edit
                      </Btn>
                    )}
                  </div>
                </Row>
              ))
            )
          }
        </Async>
      </Panel>
      {editing && (
        <TeamForm
          person={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            team.reload();
          }}
        />
      )}
    </>
  );
}

// ---- Plans ----------------------------------------------------------------

function PlanForm({ plan, onClose, onSaved }: { plan?: Plan; onClose: () => void; onSaved: () => void }) {
  const { api } = useSession();
  const toast = useToast();
  const { busy, fields, message, run } = useSubmit();
  const [name, setName] = useState(plan?.name ?? '');
  const [price, setPrice] = useState(plan ? String(plan.price) : '');
  const [months, setMonths] = useState(String(plan?.durationMonths ?? 1));
  const [active, setActive] = useState(plan?.active ?? true);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = { name, price: price === '' ? NaN : Number(price), durationMonths: Number(months), active };
    const ok = await run(() => api(plan ? `/plans/${plan.id}` : '/plans', { method: plan ? 'PATCH' : 'POST', body }));
    if (ok) {
      toast(plan ? `${name} updated.` : `${name} plan created.`);
      onSaved();
    }
  };

  return (
    <Modal title={plan ? 'Edit plan' : 'New plan'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Plan name" value={name} onChange={(e) => setName(e.target.value)} error={fields.name} placeholder="e.g. Pro Half-Yearly" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fee (rupees)" type="number" inputMode="numeric" min={0} value={price} onChange={(e) => setPrice(e.target.value)} error={fields.price} required />
          <SelectField label="Length" value={months} onChange={(e) => setMonths(e.target.value)} error={fields.durationMonths}>
            {[1, 3, 6, 12].map((m) => (
              <option key={m} value={m}>
                {m === 12 ? '1 year' : `${m} month${m === 1 ? '' : 's'}`}
              </option>
            ))}
          </SelectField>
        </div>
        {plan && (
          <label className="flex items-center gap-3 text-sm text-bone-dim">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[var(--color-red)]" />
            Offer this plan to new members
          </label>
        )}
        <FormError message={message} />
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" busy={busy}>
            {plan ? 'Save changes' : 'Create plan'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

export function Plans() {
  const { role } = useSession();
  const plans = useData<{ plans: Plan[] }>('/plans');
  const [editing, setEditing] = useState<Plan | 'new' | null>(null);
  const owner = role === 'owner';

  return (
    <>
      <PageHead
        title="Plans"
        sub={owner ? 'The membership plans you sell. Fees here are used for renewals and dues.' : 'The membership plans on offer. Only the owner can change fees.'}
        actions={
          owner ? (
            <Btn onClick={() => setEditing('new')}>
              <Plus size={14} aria-hidden /> New plan
            </Btn>
          ) : undefined
        }
      />
      <Panel>
        <Async state={plans} label="Loading plans">
          {({ plans: all }) =>
            all.length === 0 ? (
              <Empty title="No plans yet" action={owner ? <Btn onClick={() => setEditing('new')}>Create a plan</Btn> : undefined}>
                Create a plan before adding members.
              </Empty>
            ) : (
              all.map((p) => (
                <Row key={p.id}>
                  <RowMain title={p.name} meta={p.durationMonths === 12 ? '1 year' : `${p.durationMonths} month${p.durationMonths === 1 ? '' : 's'}`} />
                  <div className="flex flex-wrap items-center gap-3">
                    {!p.active && <Badge>Not offered</Badge>}
                    <span className="text-sm text-bone">{inr(p.price)}</span>
                    {owner && (
                      <Btn size="sm" variant="quiet" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                        Edit
                      </Btn>
                    )}
                  </div>
                </Row>
              ))
            )
          }
        </Async>
      </Panel>
      {editing && (
        <PlanForm
          plan={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            plans.reload();
          }}
        />
      )}
    </>
  );
}
