import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { prettyDay, relDays, stamp } from '@/lib/format';
import { useData, useSession } from '../session';
import { AddonTag, Async, Btn, DemoNote, Empty, Field, FormError, Panel, StatusBadge, TextArea, useSubmit, useToast } from '../ui';
import { LogList } from '../coaching';
import type { CoachLog, Diet, Exercise, Member, WorkoutDay } from '../types';

interface CoachRecord {
  member: Member;
  logs: CoachLog[];
}
interface Template {
  id: string;
  title: string;
  days: WorkoutDay[];
}

const CELL = 'w-full border border-line bg-ink px-2.5 py-2 text-base text-bone outline-none placeholder:text-mute/60 focus:border-bone sm:text-sm';
const blankExercise = (): Exercise => ({ name: '', sets: '', reps: '', note: '', videoUrl: '' });

// ---- Workout plan editor --------------------------------------------------

function WorkoutEditor({ member, onSaved }: { member: Member; onSaved: () => void }) {
  const { api, session } = useSession();
  const toast = useToast();
  const { busy, fields, message, run } = useSubmit();
  const templates = useData<{ templates: Template[] }>(session.gym.addons.trainerPlus ? '/coach/templates' : null);
  const [title, setTitle] = useState(member.workout?.title ?? '');
  const [days, setDays] = useState<WorkoutDay[]>(member.workout?.days ?? []);

  const editDay = (i: number, patch: Partial<WorkoutDay>) => setDays((list) => list.map((d, n) => (n === i ? { ...d, ...patch } : d)));
  const editExercise = (i: number, j: number, patch: Partial<Exercise>) =>
    editDay(i, { exercises: days[i].exercises.map((e, n) => (n === j ? { ...e, ...patch } : e)) });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    // Rows left completely blank are dropped rather than reported as errors.
    const body = { title, days: days.map((d) => ({ ...d, exercises: d.exercises.filter((x) => x.name.trim() || x.sets || x.reps) })) };
    const ok = await run(() => api(`/coach/members/${member.id}/workout`, { method: 'PUT', body }));
    if (ok) {
      toast(`Workout plan saved. ${member.name.split(' ')[0]} sees it in their portal now.`);
      onSaved();
    }
  };
  const fieldError = Object.entries(fields).find(([key]) => key !== 'title')?.[1];

  return (
    <Panel
      title="Workout plan"
      hint={member.workout?.updatedAt ? `Last updated ${stamp(member.workout.updatedAt)}${member.workout.updatedBy ? ` by ${member.workout.updatedBy}` : ''}. The member sees this plan in their portal.` : 'No plan assigned yet. The member sees it as soon as you save.'}
    >
      <form onSubmit={save} className="space-y-5 p-4 sm:p-5" noValidate>
        {templates.data && (
          <div className="flex flex-wrap items-center gap-2 border border-line bg-ink px-3 py-3">
            <AddonTag />
            <span className="text-xs text-mute">Start from a template:</span>
            {templates.data.templates.map((t) => (
              <Btn
                key={t.id}
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTitle(t.title);
                  setDays(t.days.map((d) => ({ ...d, exercises: d.exercises.map((x) => ({ ...x })) })));
                }}
              >
                {t.title}
              </Btn>
            ))}
          </div>
        )}

        <Field label="Plan title" value={title} onChange={(e) => setTitle(e.target.value)} error={fields.title} placeholder="e.g. Strength Block · Week 4" />

        {days.length === 0 && <p className="text-sm text-mute">No training days yet. Add a day to start building the plan.</p>}
        {days.map((d, i) => (
          <fieldset key={i} className="border border-line">
            <legend className="sr-only">Training day {i + 1}</legend>
            <div className="grid gap-3 border-b border-line bg-ink p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Day</span>
                <input value={d.day} onChange={(e) => editDay(i, { day: e.target.value })} placeholder="e.g. Monday" className={CELL} />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Focus</span>
                <input value={d.focus ?? ''} onChange={(e) => editDay(i, { focus: e.target.value })} placeholder="e.g. Push" className={CELL} />
              </label>
              <Btn variant="quiet" size="sm" onClick={() => setDays((list) => list.filter((_, n) => n !== i))} aria-label={`Remove day ${i + 1}`}>
                Remove day
              </Btn>
            </div>
            <div className="space-y-3 p-3">
              {d.exercises.map((x, j) => (
                <div key={j} className="grid gap-2 sm:grid-cols-[1.6fr_0.5fr_0.9fr_auto]">
                  <input value={x.name} onChange={(e) => editExercise(i, j, { name: e.target.value })} placeholder="Exercise" aria-label={`Exercise ${j + 1} name`} className={CELL} />
                  <input value={x.sets ?? ''} onChange={(e) => editExercise(i, j, { sets: e.target.value })} placeholder="Sets" aria-label={`Exercise ${j + 1} sets`} className={CELL} />
                  <input value={x.reps ?? ''} onChange={(e) => editExercise(i, j, { reps: e.target.value })} placeholder="Reps" aria-label={`Exercise ${j + 1} reps`} className={CELL} />
                  <button
                    type="button"
                    onClick={() => editDay(i, { exercises: d.exercises.filter((_, n) => n !== j) })}
                    aria-label={`Remove exercise ${j + 1}`}
                    className="flex h-10 w-10 items-center justify-center justify-self-end border border-line text-mute transition-colors hover:border-bone hover:text-bone"
                  >
                    <Trash2 size={15} />
                  </button>
                  <input value={x.note ?? ''} onChange={(e) => editExercise(i, j, { note: e.target.value })} placeholder="Coaching note (optional)" aria-label={`Exercise ${j + 1} note`} className={`${CELL} sm:col-span-2`} />
                  <input
                    value={x.videoUrl ?? ''}
                    onChange={(e) => editExercise(i, j, { videoUrl: e.target.value })}
                    placeholder="Video link, https://… (optional)"
                    aria-label={`Exercise ${j + 1} video link`}
                    className={`${CELL} sm:col-span-2`}
                  />
                </div>
              ))}
              <Btn variant="ghost" size="sm" onClick={() => editDay(i, { exercises: [...d.exercises, blankExercise()] })} disabled={d.exercises.length >= 12}>
                <Plus size={13} aria-hidden /> Add exercise
              </Btn>
            </div>
          </fieldset>
        ))}

        <FormError message={fieldError ?? message} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Btn variant="ghost" onClick={() => setDays((list) => [...list, { day: '', focus: '', exercises: [blankExercise()] }])} disabled={days.length >= 7}>
            <Plus size={13} aria-hidden /> Add day
          </Btn>
          <Btn type="submit" busy={busy}>
            Save workout plan
          </Btn>
        </div>
      </form>
    </Panel>
  );
}

// ---- Diet guidance editor -------------------------------------------------

function DietEditor({ member, onSaved }: { member: Member; onSaved: () => void }) {
  const { api } = useSession();
  const toast = useToast();
  const { busy, fields, message, run } = useSubmit();
  const [diet, setDiet] = useState<Diet>({ title: member.diet?.title ?? '', note: member.diet?.note ?? '', meals: member.diet?.meals ?? [] });
  const editMeal = (i: number, patch: Partial<Diet['meals'][number]>) => setDiet((d) => ({ ...d, meals: d.meals.map((m, n) => (n === i ? { ...m, ...patch } : m)) }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const body = { title: diet.title, note: diet.note, meals: diet.meals.filter((m) => m.label.trim() || m.items.trim()) };
    const ok = await run(() => api(`/coach/members/${member.id}/diet`, { method: 'PUT', body }));
    if (ok) {
      toast('Diet guidance saved.');
      onSaved();
    }
  };
  const fieldError = Object.entries(fields).find(([key]) => key !== 'title' && key !== 'note')?.[1];

  return (
    <Panel title="Diet guidance" hint="Written by your team and shown to the member as general guidance.">
      <form onSubmit={save} className="space-y-4 p-4 sm:p-5" noValidate>
        <DemoNote>FORGE only displays what your staff write here. It does not create or recommend diets, and members are told this is not medical advice.</DemoNote>
        <Field label="Title" value={diet.title ?? ''} onChange={(e) => setDiet((d) => ({ ...d, title: e.target.value }))} error={fields.title} placeholder="e.g. Eating guide from your coach" />
        <TextArea label="Note to the member (optional)" value={diet.note ?? ''} onChange={(e) => setDiet((d) => ({ ...d, note: e.target.value }))} error={fields.note} />
        {diet.meals.map((m, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[0.6fr_1.6fr_auto]">
            <input value={m.label} onChange={(e) => editMeal(i, { label: e.target.value })} placeholder="Meal" aria-label={`Meal ${i + 1} name`} className={CELL} />
            <input value={m.items} onChange={(e) => editMeal(i, { items: e.target.value })} placeholder="What to eat" aria-label={`Meal ${i + 1} details`} className={CELL} />
            <button
              type="button"
              onClick={() => setDiet((d) => ({ ...d, meals: d.meals.filter((_, n) => n !== i) }))}
              aria-label={`Remove meal ${i + 1}`}
              className="flex h-10 w-10 items-center justify-center justify-self-end border border-line text-mute transition-colors hover:border-bone hover:text-bone"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <FormError message={fieldError ?? message} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Btn variant="ghost" onClick={() => setDiet((d) => ({ ...d, meals: [...d.meals, { label: '', items: '' }] }))} disabled={diet.meals.length >= 8}>
            <Plus size={13} aria-hidden /> Add meal
          </Btn>
          <Btn type="submit" busy={busy}>
            Save diet guidance
          </Btn>
        </div>
      </form>
    </Panel>
  );
}

// ---- Progress: check-ins, measurements, PT sessions -----------------------

function ProgressForms({ member, onSaved }: { member: Member; onSaved: () => void }) {
  const { api } = useSession();
  const toast = useToast();
  const checkin = useSubmit();
  const measure = useSubmit();
  const pt = useSubmit();
  const [note, setNote] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const first = member.name.split(' ')[0];
  const ptLeft = member.pt.total - member.pt.used;
  const optional = (v: string) => (v.trim() === '' ? undefined : Number(v));

  const saveCheckin = async (e: FormEvent) => {
    e.preventDefault();
    if (await checkin.run(() => api(`/coach/members/${member.id}/logs`, { method: 'POST', body: { type: 'checkin', note } }))) {
      toast(`Check-in saved. It now shows in ${first}'s progress history.`);
      setNote('');
      onSaved();
    }
  };
  const saveMeasure = async (e: FormEvent) => {
    e.preventDefault();
    if (await measure.run(() => api(`/coach/members/${member.id}/logs`, { method: 'POST', body: { type: 'measurement', weightKg: optional(weight), waistCm: optional(waist) } }))) {
      toast(`Measurement saved to ${first}'s history.`);
      setWeight('');
      setWaist('');
      onSaved();
    }
  };
  const logSession = async () => {
    if (await pt.run(() => api(`/coach/members/${member.id}/pt-session`, { method: 'POST', body: {} }))) {
      toast(`PT session logged. ${ptLeft - 1} left in the pack.`);
      onSaved();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel title="Record a check-in">
        <form onSubmit={saveCheckin} className="space-y-3 p-4 sm:p-5" noValidate>
          <TextArea label="How is it going?" value={note} onChange={(e) => setNote(e.target.value)} error={checkin.fields.note} placeholder="e.g. Energy is good, squat feels stronger." />
          {!checkin.fields.note && <FormError message={checkin.message} />}
          <Btn type="submit" busy={checkin.busy}>
            Save check-in
          </Btn>
        </form>
      </Panel>

      <Panel title="Record a measurement">
        <form onSubmit={saveMeasure} className="space-y-3 p-4 sm:p-5" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight (kg)" type="number" inputMode="decimal" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} error={measure.fields.weightKg} />
            <Field label="Waist (cm)" type="number" inputMode="decimal" step="0.5" value={waist} onChange={(e) => setWaist(e.target.value)} error={measure.fields.waistCm} />
          </div>
          {!measure.fields.weightKg && !measure.fields.waistCm && <FormError message={measure.message} />}
          <Btn type="submit" busy={measure.busy}>
            Save measurement
          </Btn>
        </form>
      </Panel>

      <Panel title="PT pack">
        <div className="space-y-3 p-4 sm:p-5">
          {member.pt.total === 0 ? (
            <p className="text-sm leading-relaxed text-mute">No personal-training pack. The owner can add one from the Coaching screen.</p>
          ) : (
            <>
              <p className="font-heavy text-3xl font-semibold leading-none text-bone">
                {member.pt.used}
                <span className="text-lg text-mute"> of {member.pt.total} used</span>
              </p>
              <div className="h-2 bg-graphite" role="img" aria-label={`${member.pt.used} of ${member.pt.total} PT sessions used`}>
                <div className="h-full bg-bone" style={{ width: `${(member.pt.used / member.pt.total) * 100}%` }} />
              </div>
              <FormError message={pt.message} />
              <Btn busy={pt.busy} disabled={ptLeft <= 0} onClick={logSession}>
                {ptLeft > 0 ? 'Log a PT session' : 'Pack finished'}
              </Btn>
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}

/** One member's coaching record. Trainers reach only their own members; the owner can open anyone. */
export default function CoachMember() {
  const { memberId } = useParams();
  const { role } = useSession();
  const record = useData<CoachRecord>(`/coach/members/${memberId}`);
  const back = role === 'trainer' ? '../..' : '..';

  return (
    <>
      <Link to={back} relative="path" className="mb-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone">
        <ArrowLeft size={13} aria-hidden /> {role === 'trainer' ? 'Back to today' : 'Back to coaching'}
      </Link>
      <Async state={record} label="Loading member">
        {({ member: m, logs }) => (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-4xl leading-none text-bone sm:text-5xl">{m.name}</h1>
                <p className="mt-2 text-sm text-mute">
                  {m.category} · {m.planName} · membership {m.daysLeft < 0 ? 'ended' : 'ends'} {prettyDay(m.expiryDate)} ({relDays(m.daysLeft)})
                  {m.trainerName ? ` · Trainer: ${m.trainerName}` : ''}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </div>

            <ProgressForms member={m} onSaved={record.reload} />
            {/* Re-create the editors when the saved plan changes, so they always start from what is stored. */}
            <WorkoutEditor key={`w-${m.workout?.updatedAt ?? 'new'}`} member={m} onSaved={record.reload} />
            <DietEditor key={`d-${m.diet?.updatedAt ?? 'new'}`} member={m} onSaved={record.reload} />

            <Panel title="Progress history" hint="The member sees this history in their own portal.">
              {logs.length === 0 ? <Empty title="No history yet">Check-ins, measurements and PT sessions you record appear here.</Empty> : <LogList logs={logs} />}
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
