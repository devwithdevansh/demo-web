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
          tokenRef.current = stored.token;
          setSession(stored);
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
        tokenRef.current = s.token;
        setSession(s);
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
    return await request(path, { ...options, token: tokenRef.current });
  }, []);

  const resetDemo = useCallback(async () => {
    const fresh = await request<Session>('/demo/reset', { method: 'POST', token: tokenRef.current });
    tokenRef.current = fresh.token;
    setSession((current) => ({ ...fresh, sandboxKey: current?.sandboxKey }));
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
