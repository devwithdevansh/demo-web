import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { prettyDay } from '@/lib/format';
import { useData, useSession } from '../session';
import { AddonTag, Async, Badge, Btn, Empty, Field, FormError, Modal, PageHead, Panel, Row, RowMain, SelectField, TextArea, useSubmit, useToast } from '../ui';
import { MemberForm, MessageModal } from '../shared';
import type { Lead } from '../types';

interface LeadList {
  leads: Lead[];
  today: string;
  sources: string[];
  statuses: string[];
}

const STATUS_LABEL: Record<string, string> = { new: 'New', contacted: 'Contacted', trial: 'Trial booked', joined: 'Joined', lost: 'Not joining' };
const SOURCE_LABEL: Record<string, string> = { website: 'Website', 'walk-in': 'Walk-in', referral: 'Referral', instagram: 'Instagram', phone: 'Phone call' };
const OPEN = ['new', 'contacted', 'trial'];

function LeadForm({ lead, list, onClose, onSaved }: { lead?: Lead; list: LeadList; onClose: () => void; onSaved: () => void }) {
  const { api } = useSession();
  const toast = useToast();
  const { busy, fields, message, run } = useSubmit();
  const [form, setForm] = useState({
    name: lead?.name ?? '',
    phone: lead?.phone ?? '',
    interest: lead?.interest ?? '',
    source: lead?.source ?? 'walk-in',
    status: lead?.status ?? 'new',
    followUpOn: lead?.followUpOn ?? list.today,
    notes: lead?.notes ?? '',
  });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await run(() => api(lead ? `/leads/${lead.id}` : '/leads', { method: lead ? 'PATCH' : 'POST', body: form }));
    if (ok) {
      toast(lead ? 'Enquiry updated.' : `Enquiry from ${form.name} added.`);
      onSaved();
    }
  };

  return (
    <Modal title={lead ? 'Edit enquiry' : 'Add enquiry'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={set('name')} error={fields.name} autoComplete="off" required />
          <Field label="Phone" type="tel" value={form.phone} onChange={set('phone')} error={fields.phone} placeholder="00000 00000" autoComplete="off" required />
        </div>
        <Field label="Interested in" value={form.interest} onChange={set('interest')} error={fields.interest} placeholder="e.g. Pro plan, personal training" />
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Came from" value={form.source} onChange={set('source')}>
            {list.sources.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABEL[s] ?? s}
              </option>
            ))}
          </SelectField>
          <SelectField label="Status" value={form.status} onChange={set('status')}>
            {list.statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s] ?? s}
              </option>
            ))}
          </SelectField>
          <Field label="Follow up on" type="date" value={form.followUpOn} onChange={set('followUpOn')} error={fields.followUpOn} />
        </div>
        <TextArea label="Notes" value={form.notes} onChange={set('notes')} error={fields.notes} />
        <FormError message={message} />
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" busy={busy}>
            {lead ? 'Save changes' : 'Add enquiry'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

export default function Leads() {
  const { api, session } = useSession();
  const { addons } = session.gym;
  const toast = useToast();
  const list = useData<LeadList>('/leads');
  const [showClosed, setShowClosed] = useState(false);
  const [editing, setEditing] = useState<Lead | 'new' | null>(null);
  const [drafting, setDrafting] = useState<Lead | null>(null);
  const [converting, setConverting] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = async (lead: Lead, body: Partial<Lead>, done: string) => {
    setError(null);
    try {
      await api(`/leads/${lead.id}`, { method: 'PATCH', body });
      toast(done);
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update that enquiry.');
    }
  };

  const leadRow = (l: Lead, today: string, statuses: string[]) => {
    const overdue = !!l.followUpOn && l.followUpOn < today;
    const dueToday = l.followUpOn === today;
    const open = OPEN.includes(l.status);
    return (
      <Row key={l.id}>
        <RowMain
          title={l.name}
          meta={
            <>
              {[l.phone, l.interest, SOURCE_LABEL[l.source] ?? l.source].filter(Boolean).join(' · ')}
              {l.notes && <span className="mt-0.5 block text-bone-dim">{l.notes}</span>}
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          {open && l.followUpOn && <Badge tone={overdue ? 'bad' : dueToday ? 'warn' : 'mute'}>{overdue ? `Overdue · ${prettyDay(l.followUpOn)}` : dueToday ? 'Follow up today' : `Follow up ${prettyDay(l.followUpOn)}`}</Badge>}
          <label>
            <span className="sr-only">Status for {l.name}</span>
            <select
              value={l.status}
              onChange={(e) => patch(l, { status: e.target.value }, `${l.name} marked as ${STATUS_LABEL[e.target.value]?.toLowerCase()}.`)}
              className="border border-line bg-ink px-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bone"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s] ?? s}
                </option>
              ))}
            </select>
          </label>
          {open && addons.leadFollowup && (
            <Btn size="sm" variant="ghost" onClick={() => setDrafting(l)} aria-label={`Draft a message to ${l.name}`}>
              Draft message
            </Btn>
          )}
          {open && (
            <Btn size="sm" variant="ghost" onClick={() => setConverting(l)} aria-label={`Convert ${l.name} to a member`}>
              Make member
            </Btn>
          )}
          <Btn size="sm" variant="quiet" onClick={() => setEditing(l)} aria-label={`Edit enquiry from ${l.name}`}>
            Edit
          </Btn>
        </div>
      </Row>
    );
  };

  return (
    <>
      <PageHead
        title="Leads"
        sub="Enquiries from the website, walk-ins and calls, each with a follow-up date."
        actions={
          <Btn onClick={() => setEditing('new')}>
            <Plus size={14} aria-hidden /> Add enquiry
          </Btn>
        }
      />
      <div className="mb-4">
        <FormError message={error} />
      </div>
      <Async state={list} label="Loading enquiries">
        {({ leads, today, statuses }) => {
          const open = leads.filter((l) => OPEN.includes(l.status));
          const due = open.filter((l) => l.followUpOn && l.followUpOn <= today).sort((a, b) => a.followUpOn!.localeCompare(b.followUpOn!));
          const later = open.filter((l) => !due.includes(l));
          const closed = leads.filter((l) => !OPEN.includes(l.status));
          return (
            <div className="space-y-6">
              {addons.leadFollowup && (
                <Panel title={`Follow-up queue (${due.length})`} hint="Enquiries due today or overdue, oldest first." actions={<AddonTag />}>
                  {due.length === 0 ? <Empty title="Queue is clear">No follow-ups are due today.</Empty> : due.map((l) => leadRow(l, today, statuses))}
                </Panel>
              )}
              <Panel title={addons.leadFollowup ? `Upcoming (${later.length})` : `Open enquiries (${open.length})`}>
                {(addons.leadFollowup ? later : open).length === 0 ? (
                  <Empty title="No open enquiries" action={<Btn onClick={() => setEditing('new')}>Add an enquiry</Btn>}>
                    Enquiries from your website form land here automatically.
                  </Empty>
                ) : (
                  (addons.leadFollowup ? later : open).map((l) => leadRow(l, today, statuses))
                )}
              </Panel>
              <Panel
                title={`Closed (${closed.length})`}
                actions={
                  closed.length > 0 ? (
                    <Btn variant="quiet" size="sm" onClick={() => setShowClosed((v) => !v)} aria-expanded={showClosed}>
                      {showClosed ? 'Hide' : 'Show'}
                    </Btn>
                  ) : undefined
                }
              >
                {closed.length === 0 ? <Empty title="Nothing closed yet" /> : showClosed ? closed.map((l) => leadRow(l, today, statuses)) : <p className="px-4 py-4 text-sm text-mute sm:px-5">Joined and not-joining enquiries are kept here.</p>}
              </Panel>
            </div>
          );
        }}
      </Async>

      {editing && list.data && (
        <LeadForm
          lead={editing === 'new' ? undefined : editing}
          list={list.data}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            list.reload();
          }}
        />
      )}
      {drafting && <MessageModal template="lead_followup" leadId={drafting.id} onClose={() => setDrafting(null)} />}
      {converting && (
        <MemberForm
          prefill={{ name: converting.name, phone: converting.phone, notes: converting.interest ? `Enquired about: ${converting.interest}` : '' }}
          onClose={() => setConverting(null)}
          onSaved={(member) => {
            const lead = converting;
            setConverting(null);
            void patch(lead, { status: 'joined' }, `${member.name} is now a member. Enquiry marked as joined.`);
          }}
        />
      )}
    </>
  );
}
