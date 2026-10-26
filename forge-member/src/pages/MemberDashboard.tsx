import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  QrCode,
  AlertTriangle,
  UserCheck,
  MessageCircle,
  Dumbbell,
  Utensils,
  Clock,
  Megaphone,
  CheckSquare,
  Square,
  Flame,
} from 'lucide-react';
import { request, ApiError } from '@/lib/api';
import { inr, prettyDay, relDays, time12 } from '@/lib/format';
import { QrPass } from '@/components/QrPass';
import type { MemberPortalData } from '@/types';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<MemberPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const fetchPortalData = async () => {
    try {
      const res = await request<MemberPortalData>('/portal');
      setData(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleLogout();
      } else {
        setError(err instanceof Error ? err.message : 'Could not load your membership details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('forge.member.token');
    localStorage.removeItem('forge.member.session');
    navigate('/login', { replace: true });
  };

  const toggleExercise = (key: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-2 border-red border-t-transparent" />
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-mute">
            Loading your membership...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-ink p-4 text-center">
        <AlertTriangle size={36} className="text-red" />
        <p className="mt-3 font-mono text-sm text-bone">{error || 'Could not load member data.'}</p>
        <button
          onClick={handleLogout}
          className="mt-5 border border-line px-5 py-2 font-mono text-xs uppercase tracking-wider text-mute hover:text-bone"
        >
          Back to Login
        </button>
      </div>
    );
  }

  const { member: m, gymName, today, visits, announcements, slots } = data;
  const isCheckedInToday = visits.includes(today);
  const currentWorkout = m.workout?.days?.[activeDayIdx] || m.workout?.days?.[0];
  const workoutList = currentWorkout?.exercises || [];
  const completedCount = workoutList.filter((_, i) => completedExercises[`${activeDayIdx}-${i}`]).length;
  const progressPercent = workoutList.length ? Math.round((completedCount / workoutList.length) * 100) : 0;
  const todayClasses = slots.filter((s) => s.day === data.weekday);

  return (
    <div className="min-h-svh bg-ink pb-16 text-bone">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">
              {gymName}
            </span>
            <h1 className="font-display text-2xl uppercase tracking-wider text-bone leading-none">
              Hi, {m.name.split(' ')[0]}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-1.5 border border-line bg-ink-2 px-3 py-1.5 font-mono text-xs text-bone hover:border-bone transition-colors"
            >
              <QrCode size={15} className="text-red" />
              <span className="hidden sm:inline">My Pass</span>
            </button>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-xs text-mute hover:border-red hover:text-red transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Feed */}
      <main className="mx-auto max-w-4xl space-y-6 px-4 pt-6 sm:px-6">
        {/* 1. Digital Member Pass & Attendance Status */}
        <section className="border border-line bg-ink-2 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                Digital Pass · {m.memberCode}
              </p>
              <p className="mt-1 font-display text-3xl uppercase tracking-wide text-bone">
                {m.planName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  m.status === 'active'
                    ? 'border-ok/40 bg-ok/10 text-ok'
                    : m.status === 'expiring'
                    ? 'border-warn/40 bg-warn/10 text-warn'
                    : 'border-red/40 bg-red/10 text-red'
                }`}
              >
                {m.status === 'active' ? 'Active Membership' : m.status === 'expiring' ? 'Expiring Soon' : 'Expired'}
              </span>

              {isCheckedInToday && (
                <span className="flex items-center gap-1 border border-ok/40 bg-ok/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ok">
                  <UserCheck size={12} />
                  Checked In
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line/60 pt-4 sm:grid-cols-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mute block">Valid Until</span>
              <span className="mt-0.5 text-bone font-medium">{prettyDay(m.expiryDate)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mute block">Time Left</span>
              <span className={`mt-0.5 font-medium ${m.daysLeft <= 7 ? 'text-warn' : 'text-bone'}`}>
                {relDays(m.daysLeft)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mute block">Attendance</span>
              <span className="mt-0.5 text-bone font-medium flex items-center gap-1">
                <Flame size={13} className="text-red" />
                {visits.length} days this month
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mute block">Fees Due</span>
              <span className={`mt-0.5 font-medium ${m.feeDue > 0 ? 'text-red' : 'text-ok'}`}>
                {m.feeDue > 0 ? inr(m.feeDue) : 'All Paid ✓'}
              </span>
            </div>
          </div>

          {/* Quick QR Pass Toggle */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
            <p className="font-mono text-xs text-bone-dim">
              Show your QR code at reception or turnstile to check in.
            </p>
            <button
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-1.5 bg-bone px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:bg-red hover:text-white transition-colors"
            >
              <QrCode size={14} />
              Open QR Pass
            </button>
          </div>
        </section>

        {/* 2. Today's Assigned Workout Routine */}
        <section className="border border-line bg-ink-2 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center border border-red/40 bg-red/10 text-red">
                <Dumbbell size={18} />
              </div>
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-bone leading-none">
                  Today's Workout
                </h2>
                <p className="mt-0.5 font-mono text-[11px] text-mute">
                  {m.workout?.title || 'Personal Training Routine'}
                  {m.workout?.updatedBy ? ` · by ${m.workout.updatedBy}` : ''}
                </p>
              </div>
            </div>

            {workoutList.length > 0 && (
              <div className="font-mono text-xs text-mute">
                <span className="text-bone font-medium">{completedCount}</span> of {workoutList.length} completed ({progressPercent}%)
              </div>
            )}
          </div>

          {/* Day Tabs */}
          {m.workout?.days && m.workout.days.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scroll-x font-mono text-xs">
              {m.workout.days.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDayIdx(idx)}
                  className={`whitespace-nowrap px-3 py-1.5 uppercase tracking-wider border transition-colors ${
                    activeDayIdx === idx
                      ? 'border-red bg-red/15 text-bone'
                      : 'border-line bg-ink text-mute hover:text-bone'
                  }`}
                >
                  {d.day || `Day ${idx + 1}`}: {d.focus || 'Routine'}
                </button>
              ))}
            </div>
          )}

          {/* Exercises Checklist */}
          {workoutList.length === 0 ? (
            <div className="mt-4 py-8 text-center font-mono text-xs text-mute border border-dashed border-line">
              No workout routine assigned yet. Your personal trainer or gym coach will assign your routine soon.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-line/60">
              {workoutList.map((ex, i) => {
                const key = `${activeDayIdx}-${i}`;
                const done = !!completedExercises[key];
                return (
                  <div
                    key={i}
                    onClick={() => toggleExercise(key)}
                    className={`flex items-start gap-3 py-3.5 px-2 cursor-pointer transition-colors hover:bg-graphite/40 ${
                      done ? 'opacity-50' : ''
                    }`}
                  >
                    <button type="button" className="mt-0.5 text-mute hover:text-bone shrink-0">
                      {done ? (
                        <CheckSquare size={18} className="text-ok" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${done ? 'line-through text-mute' : 'text-bone'}`}>
                        {ex.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-mute">
                        {ex.sets && <span>Sets: <strong className="text-bone-dim">{ex.sets}</strong></span>}
                        {ex.reps && <span>Reps: <strong className="text-bone-dim">{ex.reps}</strong></span>}
                        {ex.note && <span className="text-bone-dim/80">({ex.note})</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. My Personal Trainer Card */}
        {m.trainerName && (
          <section className="border border-line bg-ink-2 p-5 sm:p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-graphite font-display text-2xl text-bone">
                  {m.trainerName.charAt(0)}
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">
                    Assigned Trainer
                  </span>
                  <h3 className="font-display text-2xl uppercase tracking-wider text-bone leading-none">
                    {m.trainerName}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-mute">
                    {m.trainerTitle || 'Fitness & Strength Coach'}
                    {m.pt.total > 0 && ` · ${m.pt.total - m.pt.used} PT sessions left`}
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hi Coach ${m.trainerName}, I am ${m.name} (${m.memberCode}) from ${gymName}. I had a question regarding my training.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-ok/60 bg-ok/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-ok hover:bg-ok hover:text-ink transition-colors"
              >
                <MessageCircle size={15} />
                WhatsApp Trainer
              </a>
            </div>
          </section>
        )}

        {/* 4. Diet & Nutrition Guidance */}
        {m.diet && (m.diet.meals?.length > 0 || m.diet.note) && (
          <section className="border border-line bg-ink-2 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-line pb-4">
              <div className="flex h-9 w-9 items-center justify-center border border-ok/40 bg-ok/10 text-ok">
                <Utensils size={18} />
              </div>
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-bone leading-none">
                  Diet & Meal Guide
                </h2>
                <p className="mt-0.5 font-mono text-[11px] text-mute">
                  {m.diet.title || 'Personal Nutrition Plan'}
                </p>
              </div>
            </div>

            {m.diet.note && (
              <p className="mt-4 border-l-2 border-ok/70 pl-3 font-mono text-xs leading-relaxed text-bone-dim">
                {m.diet.note}
              </p>
            )}

            <div className="mt-4 divide-y divide-line/60">
              {m.diet.meals?.map((meal, idx) => (
                <div key={idx} className="py-3 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-mute block sm:pt-0.5">
                    {meal.label}
                  </span>
                  <span className="mt-1 sm:mt-0 text-sm text-bone font-medium leading-relaxed block">
                    {meal.items}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Today's Classes & Timetable */}
        <section className="border border-line bg-ink-2 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <div className="flex h-9 w-9 items-center justify-center border border-line bg-graphite text-bone">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wider text-bone leading-none">
                Classes Today · {data.weekday}
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-mute">
                Group fitness & training sessions
              </p>
            </div>
          </div>

          {todayClasses.length === 0 ? (
            <p className="mt-4 py-4 text-center font-mono text-xs text-mute">
              No group classes scheduled for today.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-line/60">
              {todayClasses.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-bone">{s.name}</p>
                    <p className="font-mono text-xs text-mute">
                      {time12(s.time)} · {s.durationMin} mins
                      {s.trainerName ? ` · with ${s.trainerName}` : ''}
                    </p>
                  </div>
                  <span className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase text-mute">
                    Open Slot
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Gym Notices */}
        {announcements.length > 0 && (
          <section className="border border-line bg-ink-2 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-line pb-4">
              <Megaphone size={18} className="text-red" />
              <h2 className="font-display text-2xl uppercase tracking-wider text-bone leading-none">
                Gym Notices
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="border-l-2 border-red pl-3.5">
                  <p className="text-sm font-medium text-bone">{a.title}</p>
                  {a.body && <p className="mt-1 text-xs text-bone-dim leading-relaxed">{a.body}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* QR Code Pass Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-line bg-ink-2 p-6 text-center shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">
              {gymName}
            </span>
            <h3 className="mt-1 font-display text-3xl uppercase tracking-wider text-bone">
              {m.name}
            </h3>
            <p className="font-mono text-xs uppercase tracking-widest text-mute">
              Member Pass: {m.memberCode}
            </p>

            <div className="my-6 flex justify-center">
              <QrPass code={m.memberCode} size={210} />
            </div>

            <p className="font-mono text-xs text-bone-dim">
              Hold QR code near the scanner at the front desk.
            </p>

            <button
              onClick={() => setShowQr(false)}
              className="mt-6 w-full bg-bone py-2.5 font-mono text-xs uppercase tracking-wider text-ink hover:bg-red hover:text-white transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
