/**
 * Thin client for the FORGE API. Nothing secret lives here: demo access is a
 * short-lived session issued by the server for a private sandbox of sample data.
 */

export type Tier = 'growth' | 'performance';
export type Role = 'owner' | 'staff' | 'trainer' | 'member';
export type Addons = Record<'whatsapp' | 'upiLinks' | 'autopay' | 'leadFollowup' | 'trainerPlus', boolean>;

export interface Session {
  token: string;
  sandboxKey?: string;
  user: { id: string; name: string; role: Role; title: string };
  gym: { name: string; package: Tier | 'essential'; addons: Addons; isDemo: boolean };
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string>;
  constructor(status: number, message: string, code = 'error', fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// Where the API lives. Empty means "same address as the site" (local dev and the
// single-server deployment). Set VITE_API_URL at build time when the site is on
// static hosting and the API runs as its own service.
const API_ORIGIN = String(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const SEPARATE_API = API_ORIGIN !== '';

/** True when the request never got a real answer from the API (as opposed to the API saying no). */
export const isUnreachable = (err: unknown) => err instanceof ApiError && ['offline', 'waking', 'no_server'].includes(err.code);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

export async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_ORIGIN}/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the demo server. Check your connection and try again.', 'offline');
  }
  // The API always answers in JSON. Anything else came from the hosting layer in front of it.
  const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
  if (!isJson) {
    if ([500, 502, 503, 504].includes(res.status)) {
      throw new ApiError(res.status, 'The demo server is starting up. Please try again in a moment.', 'waking');
    }
    throw new ApiError(res.status, 'This demo needs its server, and no server is connected to this address yet.', 'no_server');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? 'That did not work. Please try again.', data?.code ?? 'error', data?.fields ?? {});
  return data as T;
}

// ---- Sleeping servers -----------------------------------------------------

// Free hosting puts an idle API to sleep; the first request wakes it, which can take up to a minute.
const WAKE_BUDGET_MS = 80_000;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retries while the API is waking. A cross-origin API that is still asleep looks like a network failure. */
async function untilAwake<T>(action: () => Promise<T>): Promise<T> {
  const started = Date.now();
  for (;;) {
    try {
      return await action();
    } catch (err) {
      const waking = err instanceof ApiError && (err.code === 'waking' || (err.code === 'offline' && SEPARATE_API));
      if (!waking || Date.now() - started > WAKE_BUDGET_MS) throw err;
      await pause(4000);
    }
  }
}

let warmed = false;
/** Nudges a sleeping API awake as soon as someone lands on the site, before they open a demo. */
export function warmApi() {
  if (warmed) return;
  warmed = true;
  void fetch(`${API_ORIGIN}/api/health`).catch(() => {});
}

// ---- Demo sandbox ---------------------------------------------------------

const SANDBOX_STORE = 'forge.demo.sandbox';

function readKey(): string | undefined {
  try {
    return localStorage.getItem(SANDBOX_STORE) ?? undefined;
  } catch {
    return undefined;
  }
}

export function rememberSandbox(key?: string) {
  if (!key) return;
  try {
    localStorage.setItem(SANDBOX_STORE, key);
  } catch {
    // Private browsing: the sandbox just lasts for this page view.
  }
}
export const sandboxKey = readKey;

// One request per role at a time, so a double-mounted component cannot create two sandboxes.
const pending = new Map<string, Promise<Session>>();

export function startDemoSession(tier: Tier, role: Role): Promise<Session> {
  const id = `${tier}:${role}`;
  const existing = pending.get(id);
  if (existing) return existing;
  const started = untilAwake(() => request<Session>('/demo/session', { method: 'POST', body: { tier, role, sandboxKey: readKey() } }))
    .then((session) => {
      rememberSandbox(session.sandboxKey);
      return session;
    })
    .finally(() => pending.delete(id));
  pending.set(id, started);
  return started;
}

export interface EnquiryInput {
  name: string;
  phone: string;
  interest?: string;
  message?: string;
}

export async function sendEnquiry(input: EnquiryInput) {
  const res = await request<{ ok: boolean; sandboxKey?: string }>('/public/enquiry', {
    method: 'POST',
    body: { ...input, sandboxKey: readKey() },
  });
  rememberSandbox(res.sandboxKey);
  return res;
}
