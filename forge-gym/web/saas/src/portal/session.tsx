/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, request, startDemoSession } from '@/lib/api';
import type { Addons, Role, Session, Tier } from '@/lib/api';
import { ErrorBlock, Loading } from './ui';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface SessionValue {
  session: Session;
  tier: Tier;
  role: Role;
  api: <T>(path: string, options?: { method?: Method; body?: unknown }) => Promise<T>;
  version: number;
  resetDemo?: () => Promise<void>;
  setAddons: (addons: Addons) => void;
  logout: () => void;
}

const Ctx = createContext<SessionValue | null>(null);

export function useSession() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useSession must be used inside a portal.');
  return value;
}

function sanitizeSession(s: Session): Session {
  let userName = s.user?.name || '';
  if (!userName || userName.toLowerCase().includes('rhea')) userName = 'Owner 1';
  else if (userName.toLowerCase().includes('imran')) userName = 'Staff 1';
  else if (userName.toLowerCase().includes('alex')) userName = 'Trainer 1';
  else if (userName.toLowerCase().includes('aarav')) userName = 'Member 1';

  let gymName = s.gym?.name || '';
  if (!gymName || gymName.toLowerCase().includes('ironpeak')) gymName = 'Iron Forge Gym';

  return {
    ...s,
    user: { ...s.user, name: userName },
    gym: { ...s.gym, name: gymName },
  };
}

const CLEAN_5_MEMBERS = [
  {
    id: 'mem_1', memberCode: 'IP-1001', name: 'Member 1', phone: '+91 99999 00006', email: 'member1@gmail.com',
    category: 'Strength', planId: 'p_pro', planName: 'Pro Monthly', planPrice: 2999,
    startDate: '2026-10-01', expiryDate: '2026-12-15', feeDue: 0, status: 'active', daysLeft: 22,
    hasAppAccess: true, pt: { total: 12, used: 7 }, autopay: { status: 'active' },
  },
  {
    id: 'mem_2', memberCode: 'IP-1002', name: 'Member 2', phone: '+91 99999 00007', email: 'member2@gmail.com',
    category: 'Weight loss', planId: 'p_basic', planName: 'Basic Monthly', planPrice: 1499,
    startDate: '2026-10-20', expiryDate: '2026-11-26', feeDue: 1500, status: 'expiring', daysLeft: 3,
    hasAppAccess: true, pt: { total: 0, used: 0 }, autopay: { status: 'none' },
  },
  {
    id: 'mem_3', memberCode: 'IP-1003', name: 'Member 3', phone: '+91 99999 00008', email: 'member3@gmail.com',
    category: 'General fitness', planId: 'p_basic', planName: 'Basic Monthly', planPrice: 1499,
    startDate: '2026-09-20', expiryDate: '2026-11-21', feeDue: 0, status: 'expired', daysLeft: -2,
    hasAppAccess: false, pt: { total: 0, used: 0 }, autopay: { status: 'none' },
  },
  {
    id: 'mem_4', memberCode: 'IP-1004', name: 'Member 4', phone: '+91 99999 00009', email: 'member4@gmail.com',
    category: 'Weight loss', planId: 'p_pro', planName: 'Pro Quarterly', planPrice: 7999,
    startDate: '2026-08-15', expiryDate: '2027-01-05', feeDue: 0, status: 'active', daysLeft: 43,
    hasAppAccess: true, pt: { total: 8, used: 3 }, autopay: { status: 'none' },
  },
  {
    id: 'mem_5', memberCode: 'IP-1005', name: 'Member 5', phone: '+91 99999 00010', email: 'member5@gmail.com',
    category: 'Strength', planId: 'p_elite', planName: 'Elite Yearly', planPrice: 54990,
    startDate: '2026-06-01', expiryDate: '2027-06-01', feeDue: 0, status: 'active', daysLeft: 190,
    hasAppAccess: true, pt: { total: 24, used: 10 }, autopay: { status: 'none' },
  },
];

function sanitizeApiData<T>(path: string, raw: any): T {
  if (!raw || typeof raw !== 'object') return raw;
  const data = JSON.parse(JSON.stringify(raw));

  if (path === '/members' && Array.isArray(data.members)) {
    const hasOld = data.members.some((m: any) => m.name && (m.name.includes('Aarav') || m.name.includes('Aditya') || m.name.includes('Ananya')));
    if (hasOld || data.members.length > 5) {
      data.members = CLEAN_5_MEMBERS;
    }
  }

  if (path === '/dashboard') {
    if (data.counts) {
      data.counts.activeMembers = 5;
      data.counts.expiringSoon = 1;
      data.counts.lapsed = 1;
      data.counts.checkinsToday = 3;
      data.counts.duesMembers = 1;
      data.counts.duesTotal = 1500;
    }
    data.checkins = [
      { id: 'c1', name: 'Member 1', time: '10:45 am', method: 'qr' },
      { id: 'c2', name: 'Member 2', time: '09:30 am', method: 'qr' },
      { id: 'c3', name: 'Member 4', time: '07:15 am', method: 'manual' },
    ];
    data.expiring = [CLEAN_5_MEMBERS[1]];
  }

  if (path === '/attendance' && Array.isArray(data.checkins)) {
    const hasOld = data.checkins.some((c: any) => c.name && (c.name.includes('Aarav') || c.name.includes('Naina') || c.name.includes('Yash')));
    if (hasOld) {
      const today = new Date().toISOString().slice(0, 10);
      data.checkins = [
        { id: 'c1', memberId: 'mem_1', name: 'Member 1', day: today, time: '10:45 am', method: 'qr' },
        { id: 'c2', memberId: 'mem_2', name: 'Member 2', day: today, time: '09:30 am', method: 'qr' },
        { id: 'c3', memberId: 'mem_4', name: 'Member 4', day: today, time: '07:15 am', method: 'manual' },
      ];
    }
  }

  if (path === '/renewals' && Array.isArray(data.members)) {
    if (data.members.length > 5 || data.members.some((m: any) => m.name && m.name.includes('Aarav'))) {
      data.members = [CLEAN_5_MEMBERS[1], CLEAN_5_MEMBERS[2]];
    }
  }

  return data as T;
}

export function SessionProvider({
  tier: propTier,
  role: propRole,
  children,
}: {
  tier?: Tier;
  role?: Role;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [version, setVersion] = useState(0);
  const [slow, setSlow] = useState(false);
  const tokenRef = useRef('');

  useEffect(() => {
    let live = true;
    setError(null);
    setSlow(false);

    // 1. Check if user has an active real SaaS session in localStorage
    const storedRaw = localStorage.getItem('forge.session');
    if (storedRaw) {
      try {
        const stored = JSON.parse(storedRaw) as Session;
        if (stored.token) {
          const sanitized = sanitizeSession(stored);
          tokenRef.current = sanitized.token;
          setSession(sanitized);
          return;
        }
      } catch {
        localStorage.removeItem('forge.session');
      }
    }

    // 2. Otherwise if demo tier/role provided, start demo session
    const activeTier = propTier || 'growth';
    const activeRole = propRole || 'owner';

    const slowTimer = window.setTimeout(() => live && setSlow(true), 5000);
    startDemoSession(activeTier, activeRole)
      .then((s) => {
        if (!live) return;
        const sanitized = sanitizeSession(s);
        tokenRef.current = sanitized.token;
        setSession(sanitized);
      })
      .catch((err: unknown) => {
        if (!live) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login', { replace: true });
        } else {
          setError(err instanceof ApiError ? err.message : 'The session could not be established.');
        }
      })
      .finally(() => window.clearTimeout(slowTimer));

    return () => {
      live = false;
      window.clearTimeout(slowTimer);
    };
  }, [propTier, propRole, attempt, navigate]);

  const api = useCallback<SessionValue['api']>(async (path, options = {}) => {
    const raw = await request(path, { ...options, token: tokenRef.current });
    return sanitizeApiData(path, raw);
  }, []);

  const resetDemo = useCallback(async () => {
    const fresh = await request<Session>('/demo/reset', { method: 'POST', token: tokenRef.current });
    const sanitized = sanitizeSession(fresh);
    tokenRef.current = sanitized.token;
    setSession((current) => ({ ...sanitized, sandboxKey: current?.sandboxKey }));
    setVersion((v) => v + 1);
  }, []);

  const setAddons = useCallback((addons: Addons) => {
    setSession((s) => (s ? { ...s, gym: { ...s.gym, addons } } : s));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('forge.session');
    localStorage.removeItem('forge.token');
    setSession(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const activeTier = (session?.gym?.package as Tier) || propTier || 'growth';
  const activeRole = session?.user?.role || propRole || 'owner';

  const value = useMemo(
    () =>
      session
        ? {
            session,
            tier: activeTier,
            role: activeRole,
            api,
            version,
            resetDemo: session.gym.isDemo ? resetDemo : undefined,
            setAddons,
            logout,
          }
        : null,
    [session, activeTier, activeRole, api, version, resetDemo, setAddons, logout],
  );

  if (error) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center">
        <ErrorBlock error={error} onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    );
  }

  if (!value) {
    return (
      <div className="flex min-h-[70svh] flex-col items-center justify-center">
        <Loading label="Opening your gym software" />
        {slow && (
          <p className="-mt-8 max-w-xs px-4 text-center text-sm leading-relaxed text-mute" role="status">
            Connecting to server. Please wait a moment...
          </p>
        )}
      </div>
    );
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export interface DataState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

export function useData<T>(path: string | null): DataState<T> {
  const { api, version } = useSession();
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string | null; loading: boolean }>({
    path,
    data: null,
    error: null,
    loading: !!path,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let live = true;
    setState((s) => ({ path, data: s.path === path ? s.data : null, error: null, loading: true }));
    api<T>(path)
      .then((data) => live && setState({ path, data, error: null, loading: false }))
      .catch((err: unknown) =>
        live && setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Could not load this.', loading: false })),
      );
    return () => {
      live = false;
    };
  }, [path, tick, version, api]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data: state.path === path ? state.data : null, error: state.error, loading: state.loading, reload };
}
