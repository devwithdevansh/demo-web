import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { stamp, time12 } from '@/lib/format';
import { useData, useSession } from '../session';
import { Async, Badge, Btn, Empty, Field, FormError, PageHead, Panel, Row, RowMain, SelectField, TextArea, useSubmit, useToast } from '../ui';
import type { Announcement, ClassSlot } from '../types';

// ---- Timetable (every role in the Performance demo) -----------------------

interface TimetableData {
  slots: ClassSlot[];
  days: string[];
  today: string;
}
const DAY_NAME: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' };

export function Timetable() {
  const { api, role, session } = useSession();
  const toast = useToast();
  const table = useData<TimetableData>('/coach/timetable');
  const trainers = useData<{ trainers: { id: string; name: string }[] }>(role === 'owner' ? '/coach/assignments' : null);
  const [day, setDay] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', time: '18:00', trainerId: '' });
  const { busy, fields, message, run } = useSubmit();
  const [error, setError] = useState<string | null>(null);
  const owner = role === 'owner';

  const add = async (e: FormEvent, forDay: string) => {
    e.preventDefault();
    const ok = await run(() => api('/coach/timetable', { method: 'POST', body: { day: forDay, name: form.name, time: form.time, trainerId: form.trainerId || null } }));
    if (ok) {
      toast(`${form.name} added on ${DAY_NAME[forDay]}.`);
      setForm((f) => ({ ...f, name: '' }));
      table.reload();
    }
  };

  const remove = async (slot: ClassSlot) => {
    setError(null);
    try {
      await api(`/coach/timetable/${slot.id}`, { method: 'DELETE' });
      toast(`${slot.name} removed from ${DAY_NAME[slot.day]}.`);
      table.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove that class.');
    }
  };

  return (
    <>
      <PageHead title="Timetable" sub={owner ? 'The weekly class schedule. Members and trainers see changes straight away.' : 'The weekly class schedule.'} />
      <div className="mb-4">
        <FormError message={error} />
      </div>
      <Async state={table} label="Loading timetable">
        {({ slots, days, today }) => {
          const current = day ?? today;
          const list = slots.filter((s) => s.day === current);
          return (
            <div className="space-y-5">
              <div className="scroll-x flex gap-1" role="tablist" aria-label="Day of the week">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={d === current}
                    onClick={() => setDay(d)}
                    className={`shrink-0 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      d === current ? 'bg-bone text-ink' : 'border border-line text-mute hover:text-bone'
                    }`}
                  >
                    {d}
                    {d === today && <span className="sr-only"> (today)</span>}
                    {d === today && <span aria-hidden> ·</span>}
                  </button>
                ))}
              </div>

              <Panel title={`${DAY_NAME[current]}${current === today ? ' · today' : ''}`}>
                {list.length === 0 ? (
                  <Empty title="No classes">Nothing is scheduled on {DAY_NAME[current]}.</Empty>
                ) : (
                  list.map((s) => (
                    <Row key={s.id}>
                      <RowMain title={s.name} meta={`${time12(s.time)} · ${s.durationMin} min${s.trainerName ? ` · ${s.trainerName}` : ''}`} />
                      <div className="flex items-center gap-2">
                        {s.trainerId === session.user.id && <Badge tone="info">Your class</Badge>}
                        {owner && (
                          <Btn variant="quiet" size="sm" onClick={() => remove(s)} aria-label={`Remove ${s.name} at ${time12(s.time)}`}>
                            Remove
                          </Btn>
                        )}
                      </div>
                    </Row>
                  ))
                )}
              </Panel>

              {owner && (
                <Panel title={`Add a class on ${DAY_NAME[current]}`}>
                  <form onSubmit={(e) => add(e, current)} className="grid gap-4 p-4 sm:grid-cols-[1.4fr_0.8fr_1fr_auto] sm:items-end sm:p-5" noValidate>
                    <Field label="Class name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={fields.name} placeholder="e.g. Zumba" />
                    <Field label="Start time" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} error={fields.time} />
                    <SelectField label="Trainer" value={form.trainerId} onChange={(e) => setForm((f) => ({ ...f, trainerId: e.target.value }))}>
                      <option value="">Not set</option>
                      {trainers.data?.trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </SelectField>
                    <Btn type="submit" busy={busy}>
                      Add class
                    </Btn>
                    {message && !Object.keys(fields).length && (
                      <div className="sm:col-span-4">
                        <FormError message={message} />
                      </div>
                    )}
                  </form>
                </Panel>
              )}
            </div>
          );
        }}
      </Async>
    </>
  );
}

// ---- Notices (owner and front desk post; members read them) ---------------

export function Notices() {
  const { api } = useSession();
  const toast = useToast();
  const notices = useData<{ announcements: Announcement[] }>('/coach/announcements');
  const { busy, fields, message, run } = useSubmit();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const post = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await run(() => api('/coach/announcements', { method: 'POST', body: { title, body: text } }));
    if (ok) {
      toast('Notice posted. Members see it on their home screen.');
      setTitle('');
      setText('');
      notices.reload();
    }
  };

  const remove = async (a: Announcement) => {
    setError(null);
    try {
      await api(`/coach/announcements/${a.id}`, { method: 'DELETE' });
      toast('Notice removed.');
      notices.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove that notice.');
    }
  };

  return (
    <>
      <PageHead title="Notices" sub="Short announcements that appear on every member's home screen." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Post a notice">
          <form onSubmit={post} className="space-y-4 p-4 sm:p-5" noValidate>
            <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={fields.title} placeholder="e.g. Holiday timings" required />
            <TextArea label="Details (optional)" value={text} onChange={(e) => setText(e.target.value)} error={fields.body} />
            <FormError message={message} />
            <Btn type="submit" busy={busy}>
              Post notice
            </Btn>
          </form>
        </Panel>

        <Panel title="Posted notices">
          <FormError message={error} />
          <Async state={notices} label="Loading notices">
            {({ announcements }) =>
              announcements.length === 0 ? (
                <Empty title="No notices posted">Post one and it shows up for members straight away.</Empty>
              ) : (
                announcements.map((a) => (
                  <Row key={a.id} className="items-start">
                    <RowMain
                      title={a.title}
                      meta={
                        <>
                          {a.body && <span className="block text-bone-dim">{a.body}</span>}
                          <span className="mt-1 block">
                            {stamp(a.createdAt)}
                            {a.postedBy ? ` · ${a.postedBy}` : ''}
                          </span>
                        </>
                      }
                    />
                    <Btn variant="quiet" size="sm" onClick={() => remove(a)} aria-label={`Remove notice: ${a.title}`}>
                      Remove
                    </Btn>
                  </Row>
                ))
              )
            }
          </Async>
        </Panel>
      </div>
    </>
  );
}
