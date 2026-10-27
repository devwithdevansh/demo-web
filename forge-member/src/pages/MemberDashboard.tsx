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
  Camera,
  Play,
  Film,
  ExternalLink,
  Pin,
  X,
} from 'lucide-react';
import { request, ApiError } from '@/lib/api';
import { inr, prettyDay, relDays, time12 } from '@/lib/format';
import { QrPass } from '@/components/QrPass';
import { CameraQrScanner } from '@/components/CameraQrScanner';
import type { MemberPortalData, FitnessVideo } from '@/types';

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}


export default function MemberDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<MemberPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [checkinSuccessMsg, setCheckinSuccessMsg] = useState<string | null>(null);
  const [checkinErrorMsg, setCheckinErrorMsg] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [activeVideoCategory, setActiveVideoCategory] = useState<string>('All');
  const [playingVideo, setPlayingVideo] = useState<FitnessVideo | null>(null);


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

  const handleScanGymQr = async (scannedCode: string) => {
    setShowCameraScanner(false);
    setCheckinErrorMsg(null);
    setCheckinSuccessMsg(null);
    try {
      const res = await request<{
        ok: boolean;
        alreadyCheckedIn: boolean;
        message: string;
        time: string;
        visitsMonth?: number;
      }>('/portal/checkin', {
        method: 'POST',
        body: { qrCode: scannedCode },
      });

      setCheckinSuccessMsg(res.message);

      // Instant optimistic update: mark today as checked-in immediately without waiting for a manual refresh
      setData((prev) => {
        if (!prev) return prev;
        const alreadyVisited = prev.visits.includes(prev.today);
        return {
          ...prev,
          visits: alreadyVisited ? prev.visits : [...prev.visits, prev.today],
        };
      });

      // Synchronize latest fresh state from server in background
      await fetchPortalData();
    } catch (err) {
      setCheckinErrorMsg(err instanceof Error ? err.message : 'Could not check in. Please try again.');
    }
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
  const videos = data.videos || [];
  const videoCategories = ['All', ...Array.from(new Set(videos.map((v) => v.category).filter(Boolean)))];
  const displayedVideos =
    activeVideoCategory === 'All'
      ? videos
      : videos.filter((v) => v.category === activeVideoCategory);


  return (
    <div className="min-h-svh bg-ink pb-16 text-bone">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
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
      <main className="mx-auto max-w-7xl space-y-5 px-3 pt-4 sm:px-6 lg:px-8 sm:pt-6">
        {/* Scan Gym QR Check-in Banner */}
        {checkinSuccessMsg && (
          <div className="flex items-center justify-between border border-ok/40 bg-ok/10 p-3.5 font-mono text-xs text-ok">
            <span>✓ {checkinSuccessMsg}</span>
            <button onClick={() => setCheckinSuccessMsg(null)} className="text-bone-dim hover:text-bone">✕</button>
          </div>
        )}
        {checkinErrorMsg && (
          <div className="flex items-center justify-between border border-red/40 bg-red/10 p-3.5 font-mono text-xs text-red">
            <span>⚠ {checkinErrorMsg}</span>
            <button onClick={() => setCheckinErrorMsg(null)} className="text-bone-dim hover:text-bone">✕</button>
          </div>
        )}

        {isCheckedInToday ? (
          <div className="flex items-center justify-between border border-ok/40 bg-ok/10 p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="text-ok" size={22} />
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ok">Checked In Today</p>
                <p className="font-mono text-[11px] text-bone-dim">Your workout attendance is recorded for today!</p>
              </div>
            </div>
            <span className="font-mono text-xs font-semibold text-ok">✓ Complete</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-red/50 bg-red/10 p-4">
            <div className="flex items-center gap-3">
              <Camera className="text-red" size={24} />
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-bone">Gym QR Check-In</p>
                <p className="font-mono text-[11px] text-bone-dim">Scan the reception / desk QR code to mark your attendance.</p>
              </div>
            </div>
            <button
              onClick={() => setShowCameraScanner(true)}
              className="flex items-center justify-center gap-2 bg-red px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-red/90 transition-colors"
            >
              <Camera size={16} />
              Scan Gym QR
            </button>
          </div>
        )}

        {/* 1. Digital Member Pass & Attendance Status */}
        <section className="border border-line bg-ink-2 p-4 sm:p-6 shadow-xl">
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

        {/* 2-Column Responsive Dashboard Layout on Desktop/Tablet */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Main Left Column: Workout Routine & Diet Plan (8 cols on lg) */}
          <div className="space-y-6 lg:col-span-8">
            {/* 2. Today's Assigned Workout Routine */}
            <section className="border border-line bg-ink-2 p-4 sm:p-6 shadow-xl">
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

            {/* 3. Diet & Nutrition Guidance */}
            {m.diet && (m.diet.meals?.length > 0 || m.diet.note) && (
              <section className="border border-line bg-ink-2 p-4 sm:p-6 shadow-xl">
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

            {/* 4. Today's Classes & Timetable */}
            <section className="border border-line bg-ink-2 p-4 sm:p-6 shadow-xl">
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

            {/* 5. Fitness Videos & Guides */}
            {videos.length > 0 && (
              <section className="border border-line bg-ink-2 p-4 sm:p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center border border-red/40 bg-red/10 text-red">
                      <Film size={18} />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl uppercase tracking-wider text-bone leading-none">
                        Fitness Videos & Tutorials
                      </h2>
                      <p className="mt-0.5 font-mono text-[11px] text-mute">
                        Workout guides, exercise form & fitness advice from your gym
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-bone-dim">
                    {videos.length} videos available
                  </span>
                </div>

                {/* Category Filter Chips */}
                {videoCategories.length > 1 && (
                  <div className="mt-4 scroll-x flex gap-1.5 pb-2">
                    {videoCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveVideoCategory(cat)}
                        className={`shrink-0 px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
                          activeVideoCategory === cat
                            ? 'bg-bone text-ink font-semibold'
                            : 'border border-line text-mute hover:border-bone/50 hover:text-bone'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Video Cards Grid */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {displayedVideos.map((video) => {
                    const ytId = video.youtubeId || extractYouTubeId(video.videoUrl);
                    const thumb =
                      video.thumbnailUrl ||
                      (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

                    return (
                      <div
                        key={video.id}
                        onClick={() => setPlayingVideo(video)}
                        className="group flex flex-col border border-line bg-ink hover:border-red/60 transition-all cursor-pointer overflow-hidden shadow-md"
                      >
                        {/* Thumbnail with play overlay */}
                        <div className="relative aspect-video w-full overflow-hidden bg-graphite">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={video.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-mute font-mono text-xs">
                              Video Guide
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/15 transition-colors">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red text-white shadow-xl group-hover:scale-110 transition-transform">
                              <Play size={18} className="ml-0.5 fill-white" />
                            </div>
                          </div>
                          {video.pinned && (
                            <span className="absolute top-2 left-2 flex items-center gap-1 bg-red px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white shadow">
                              <Pin size={10} /> Pinned
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 border border-line bg-ink/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-bone-dim backdrop-blur-sm">
                            {video.category}
                          </span>
                        </div>

                        {/* Title and details */}
                        <div className="flex flex-1 flex-col justify-between p-3.5">
                          <div>
                            <h3 className="font-display text-lg uppercase tracking-wide text-bone group-hover:text-red transition-colors line-clamp-2">
                              {video.title}
                            </h3>
                            {video.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-bone-dim leading-relaxed">
                                {video.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2 font-mono text-[10px] text-mute">
                            <span>{video.postedBy ? `Coach ${video.postedBy}` : 'Gym Staff'}</span>
                            <span className="flex items-center gap-1 text-red group-hover:underline">
                              Watch Video →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>


          {/* Right Column: Pass Standee, Trainer Card, Notices (4 cols on lg) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Front Desk QR Pass Standee */}
            <section className="border border-line bg-ink-2 p-5 shadow-xl text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">
                Front Desk QR Pass
              </span>
              <h3 className="mt-1 font-display text-2xl uppercase tracking-wider text-bone">
                {m.name}
              </h3>
              <p className="font-mono text-xs uppercase tracking-widest text-mute">
                Member ID: {m.memberCode}
              </p>
              <div className="my-4 flex justify-center">
                <QrPass code={m.memberCode} size={170} />
              </div>
              <p className="font-mono text-[11px] text-bone-dim">
                Hold QR code near front desk scanner to check in.
              </p>
            </section>

            {/* My Personal Trainer Card */}
            {m.trainerName && (
              <section className="border border-line bg-ink-2 p-4 sm:p-5 shadow-xl">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-graphite font-display text-xl text-bone">
                      {m.trainerName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">
                        Assigned Trainer
                      </span>
                      <h3 className="font-display text-xl uppercase tracking-wider text-bone leading-none">
                        {m.trainerName}
                      </h3>
                      <p className="mt-0.5 font-mono text-[11px] text-mute">
                        {m.trainerTitle || 'Fitness & Strength Coach'}
                      </p>
                    </div>
                  </div>

                  {m.pt.total > 0 && (
                    <p className="font-mono text-xs text-bone-dim border-t border-line/60 pt-2">
                      PT Sessions: <strong className="text-bone">{m.pt.total - m.pt.used}</strong> of {m.pt.total} remaining
                    </p>
                  )}

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hi Coach ${m.trainerName}, I am ${m.name} (${m.memberCode}) from ${gymName}. I had a question regarding my training.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center justify-center gap-2 border border-ok/60 bg-ok/10 py-2 px-3 font-mono text-xs uppercase tracking-wider text-ok hover:bg-ok hover:text-ink transition-colors"
                  >
                    <MessageCircle size={15} />
                    WhatsApp Trainer
                  </a>
                </div>
              </section>
            )}

            {/* Gym Notices */}
            {announcements.length > 0 && (
              <section className="border border-line bg-ink-2 p-4 sm:p-5 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-line pb-3">
                  <Megaphone size={16} className="text-red" />
                  <h2 className="font-display text-xl uppercase tracking-wider text-bone leading-none">
                    Gym Notices
                  </h2>
                </div>
                <div className="mt-3 space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="border-l-2 border-red pl-3">
                      <p className="text-xs font-medium text-bone">{a.title}</p>
                      {a.body && <p className="mt-0.5 text-[11px] text-bone-dim leading-relaxed">{a.body}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
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

      {/* Camera QR Scanner Modal */}
      {showCameraScanner && (
        <CameraQrScanner
          onScanSuccess={handleScanGymQr}
          onClose={() => setShowCameraScanner(false)}
        />
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="w-full max-w-3xl border border-line bg-ink p-4 sm:p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="min-w-0 pr-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-red">
                  {playingVideo.category}
                </span>
                <h3 className="truncate font-display text-2xl uppercase tracking-wider text-bone">
                  {playingVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="flex h-8 w-8 items-center justify-center border border-line bg-graphite text-mute hover:border-red hover:text-red transition-colors"
                aria-label="Close video"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 relative aspect-video w-full overflow-hidden border border-line bg-black">
              {playingVideo.youtubeId || extractYouTubeId(playingVideo.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${
                    playingVideo.youtubeId || extractYouTubeId(playingVideo.videoUrl)
                  }?autoplay=1&rel=0&playsinline=1`}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full"
                />
              ) : (

                <video
                  src={playingVideo.videoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs text-mute">
                {playingVideo.postedBy ? `Shared by ${playingVideo.postedBy}` : 'Provided by your gym'}
              </p>
              <a
                href={playingVideo.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 border border-line px-3 py-1 font-mono text-xs text-bone hover:border-red hover:text-red transition-colors"
              >
                Open in YouTube <ExternalLink size={13} />
              </a>
            </div>

            {playingVideo.description && (
              <div className="mt-3 border-l-2 border-red pl-3 py-1 text-xs text-bone-dim leading-relaxed bg-graphite/30">
                {playingVideo.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

