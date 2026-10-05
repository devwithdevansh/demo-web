/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, request, startDemoSession } from '@/lib/api';
import type { Addons, Role, Session, Tier } from '@/lib/api';
import { ErrorBlock, Loading } from './ui';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface SessionValue {
  session: Session;
  tier: Tier;
  role: Role;
  /** Calls the API as the signed-in demo user. */
  api: <T>(path: string, options?: { method?: Method; body?: unknown }) => Promise<T>;
  /** Changes whenever data was reset, so open screens refetch. */
  version: number;
  resetDemo: () => Promise<void>;
  setAddons: (addons: Addons) => void;
}

const Ctx = createContext<SessionValue | null>(null);

export function useSession() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useSession must be used inside a portal.');
  return value;
}

/** Opens a demo session for one role and keeps it alive while the portal is on screen. */
export function SessionProvider({ tier, role, children }: { tier: Tier; role: Role; children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [version, setVersion] = useState(0);
  const tokenRef = useRef('');

  useEffect(() => {
    let live = true;
    setSession(null);
    setError(null);
    startDemoSession(tier, role)
      .then((s) => {
        if (!live) return;
        tokenRef.current = s.token;
        setSession(s);
      })
      .catch((err: unknown) => live && setError(err instanceof ApiError ? err.message : 'The demo could not be started.'));
    return () => {
      live = false;
    };
  }, [tier, role, attempt]);

  const api = useCallback<SessionValue['api']>(
    async (path, options = {}) => {
      try {
        return await request(path, { ...options, token: tokenRef.current });
      } catch (err) {
        // Sessions end when the sandbox is reset or expires; quietly open a new one and retry once.
        if (!(err instanceof ApiError) || err.status !== 401) throw err;
        const fresh = await startDemoSession(tier, role);
        tokenRef.current = fresh.token;
        setSession(fresh);
        return request(path, { ...options, token: fresh.token });
      }
    },
    [tier, role],
  );

  const resetDemo = useCallback(async () => {
    const fresh = await request<Session>('/demo/reset', { method: 'POST', token: tokenRef.current });
    tokenRef.current = fresh.token;
    setSession((current) => ({ ...fresh, sandboxKey: current?.sandboxKey }));
    setVersion((v) => v + 1);
  }, []);

  const setAddons = useCallback((addons: Addons) => setSession((s) => (s ? { ...s, gym: { ...s.gym, addons } } : s)), []);

  const value = useMemo(
    () => (session ? { session, tier, role, api, version, resetDemo, setAddons } : null),
    [session, tier, role, api, version, resetDemo, setAddons],
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
      <div className="flex min-h-[70svh] items-center justify-center">
        <Loading label="Preparing your sample gym" />
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

/** Loads one API resource and refetches when asked, or when the demo data is reset. */
export function useData<T>(path: string | null): DataState<T> {
  const { api, version } = useSession();
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string | null; loading: boolean }>({ path, data: null, error: null, loading: !!path });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let live = true;
    // Keep the previous result on screen while the same resource reloads; drop it when the resource changes.
    setState((s) => ({ path, data: s.path === path ? s.data : null, error: null, loading: true }));
    api<T>(path)
      .then((data) => live && setState({ path, data, error: null, loading: false }))
      .catch((err: unknown) => live && setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Could not load this.', loading: false })));
    return () => {
      live = false;
    };
  }, [path, tick, version, api]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data: state.path === path ? state.data : null, error: state.error, loading: state.loading, reload };
}
