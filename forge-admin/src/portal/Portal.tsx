import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import {
  BarChart3, CalendarDays, Dumbbell, House, IndianRupee, LayoutDashboard, Megaphone, MessageSquare, Puzzle, QrCode,
  RefreshCw, Repeat, RotateCcw, ScanLine, Tags, TrendingUp, UserCog, Users, Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DemoBar } from '@/components/forge/DemoBar';
import type { Role, Tier } from '@/lib/api';
import { SessionProvider, useSession } from './session';
import { Btn, Loading, Modal, ToastProvider, useToast, FormError, useSubmit } from './ui';

const Today = lazy(() => import('./pages/Today'));
const Members = lazy(() => import('./pages/Members'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Payments = lazy(() => import('./pages/Payments'));
const Renewals = lazy(() => import('./pages/Renewals'));
const Leads = lazy(() => import('./pages/Leads'));
const Team = lazy(() => import('./pages/TeamPlans').then((m) => ({ default: m.Team })));
const Plans = lazy(() => import('./pages/TeamPlans').then((m) => ({ default: m.Plans })));
const Reports = lazy(() => import('./pages/Reports'));
const Addons = lazy(() => import('./pages/Addons'));
const Coaching = lazy(() => import('./pages/Coaching'));
const Timetable = lazy(() => import('./pages/Club').then((m) => ({ default: m.Timetable })));
const Notices = lazy(() => import('./pages/Club').then((m) => ({ default: m.Notices })));
const TrainerToday = lazy(() => import('./pages/TrainerToday'));
const CoachMember = lazy(() => import('./pages/CoachMember'));
const MemberHome = lazy(() => import('./pages/MemberPortal').then((m) => ({ default: m.MemberHome })));
const MemberWorkout = lazy(() => import('./pages/MemberPortal').then((m) => ({ default: m.MemberWorkout })));
const MemberProgress = lazy(() => import('./pages/MemberPortal').then((m) => ({ default: m.MemberProgress })));
const MemberDiet = lazy(() => import('./pages/MemberPortal').then((m) => ({ default: m.MemberDiet })));
const MemberPass = lazy(() => import('./pages/MemberPortal').then((m) => ({ default: m.MemberPass })));
const MemberAutopay = lazy(() => import('./pages/MemberPortal').then((m) => ({ default: m.MemberAutopay })));

const TIER_ROLES: Record<Tier, Role[]> = { growth: ['owner', 'staff'], performance: ['owner', 'staff', 'trainer', 'member'] };
const ROLE_LABEL: Record<Role, string> = { owner: 'Owner', staff: 'Front desk', trainer: 'Trainer', member: 'Member' };

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

function navFor(tier: Tier, role: Role): NavItem[] {
  const perf = tier === 'performance';
  if (role === 'trainer') {
    return [
      { to: '', label: 'Today', icon: LayoutDashboard },
      { to: 'timetable', label: 'Timetable', icon: CalendarDays },
    ];
  }
  if (role === 'member') {
    return [
      { to: '', label: 'Home', icon: House },
      { to: 'workout', label: 'Workout', icon: Dumbbell },
      { to: 'progress', label: 'Progress', icon: TrendingUp },
      { to: 'diet', label: 'Diet guide', icon: Utensils },
      { to: 'timetable', label: 'Timetable', icon: CalendarDays },
      { to: 'pass', label: 'My pass', icon: QrCode },
      { to: 'autopay', label: 'Autopay', icon: Repeat },
    ];
  }
  const owner = role === 'owner';
  return [
    { to: '', label: 'Today', icon: LayoutDashboard },
    { to: 'members', label: 'Members', icon: Users },
    { to: 'attendance', label: 'Attendance', icon: ScanLine },
    { to: 'payments', label: 'Payments', icon: IndianRupee },
    { to: 'renewals', label: 'Renewals', icon: RefreshCw },
    { to: 'leads', label: 'Leads', icon: MessageSquare },
    ...(perf && owner ? [{ to: 'coaching', label: 'Coaching', icon: Dumbbell }] : []),
    ...(perf ? [{ to: 'timetable', label: 'Timetable', icon: CalendarDays }, { to: 'notices', label: 'Notices', icon: Megaphone }] : []),
    { to: 'team', label: 'Team', icon: UserCog },
    { to: 'plans', label: 'Plans', icon: Tags },
    ...(owner ? [{ to: 'reports', label: 'Reports', icon: BarChart3 }] : []),
    { to: 'addons', label: 'Add-ons', icon: Puzzle },
  ];
}

function ResetButton() {
  const { resetDemo } = useSession();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const { busy, message, run } = useSubmit();

  return (
    <>
      <Btn variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <RotateCcw size={13} aria-hidden /> Reset demo data
      </Btn>
      {open && (
        <Modal title="Reset demo data?" onClose={() => setOpen(false)}>
          <p className="text-sm leading-relaxed text-bone-dim">
            This puts the sample gym back to how it started. Members, payments, check-ins and plans you changed in this demo will be replaced with the original
            sample data. Only your own demo is affected.
          </p>
          <div className="mt-5 space-y-3">
            <FormError message={message} />
            <div className="flex flex-wrap justify-end gap-2">
              <Btn variant="ghost" onClick={() => setOpen(false)}>
                Keep my changes
              </Btn>
              <Btn
                variant="accent"
                busy={busy}
                onClick={async () => {
                  if (await run(resetDemo)) {
                    setOpen(false);
                    toast('Demo data reset to the original sample gym.');
                  }
                }}
              >
                Reset demo data
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Shell() {
  const { session, tier, role } = useSession();
  const base = `/demo/${tier}/${role}`;
  const items = navFor(tier, role);
  const perf = tier === 'performance';
  const desk = role === 'owner' || role === 'staff';
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // On phones the sections scroll sideways; bring the open one into view.
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors lg:px-4 ${
      isActive ? 'bg-bone text-ink' : 'text-bone-dim hover:bg-graphite hover:text-bone'
    }`;

  return (
    <>
      <header className="border-b border-line bg-ink-2">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 lg:px-8">
          <div className="min-w-0">
            <p className="truncate font-display text-2xl leading-none text-bone">{session.gym.name}</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
              Signed in as <span className="text-bone-dim">{session.user.name}</span> · {session.user.title || ROLE_LABEL[role]}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center" role="group" aria-label="View the demo as">
              {TIER_ROLES[tier].map((r) => (
                <Link
                  key={r}
                  to={`/demo/${tier}/${r}`}
                  aria-current={r === role ? 'true' : undefined}
                  className={`border-y border-l border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors last:border-r ${
                    r === role ? 'bg-graphite text-bone' : 'text-mute hover:text-bone'
                  }`}
                >
                  {ROLE_LABEL[r]}
                </Link>
              ))}
            </div>
            <ResetButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] lg:flex">
        <nav ref={navRef} aria-label="Sections" className="scroll-x sticky top-0 z-40 flex gap-1 border-b border-line bg-ink px-2 py-2 lg:static lg:w-56 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:px-3 lg:py-6">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to ? `${base}/${to}` : base} end={!to} className={linkClass}>
              <Icon size={15} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 sm:py-8 lg:px-8">
          <Suspense fallback={<Loading />}>
            <Routes>
              {desk && (
                <>
                  <Route index element={<Today />} />
                  <Route path="members" element={<Members />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="renewals" element={<Renewals />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="team" element={<Team />} />
                  <Route path="plans" element={<Plans />} />
                  <Route path="addons" element={<Addons />} />
                  {role === 'owner' && <Route path="reports" element={<Reports />} />}
                  {perf && <Route path="timetable" element={<Timetable />} />}
                  {perf && <Route path="notices" element={<Notices />} />}
                  {perf && role === 'owner' && <Route path="coaching" element={<Coaching />} />}
                  {perf && role === 'owner' && <Route path="coaching/:memberId" element={<CoachMember />} />}
                </>
              )}
              {role === 'trainer' && (
                <>
                  <Route index element={<TrainerToday />} />
                  <Route path="member/:memberId" element={<CoachMember />} />
                  <Route path="timetable" element={<Timetable />} />
                </>
              )}
              {role === 'member' && (
                <>
                  <Route index element={<MemberHome />} />
                  <Route path="workout" element={<MemberWorkout />} />
                  <Route path="progress" element={<MemberProgress />} />
                  <Route path="diet" element={<MemberDiet />} />
                  <Route path="timetable" element={<Timetable />} />
                  <Route path="pass" element={<MemberPass />} />
                  <Route path="autopay" element={<MemberAutopay />} />
                </>
              )}
              <Route path="*" element={<Navigate to={base} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </>
  );
}

/** /demo/:tier/:role/* — one portal for every role; the server decides what each role may load. */
export default function Portal({ tier }: { tier: Tier }) {
  const { role } = useParams();
  if (!TIER_ROLES[tier].includes(role as Role)) return <Navigate to={`/demo/${tier}`} replace />;
  return (
    <div className="min-h-svh bg-ink text-bone">
      <DemoBar current={tier} />
      <ToastProvider>
        <SessionProvider key={`${tier}:${role}`} tier={tier} role={role as Role}>
          <Shell />
        </SessionProvider>
      </ToastProvider>
    </div>
  );
}
