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

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

export async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
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
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // A dev proxy with no API behind it answers 5xx with no JSON body.
    const fallback = res.status >= 500 ? 'The demo server is not responding. Please try again shortly.' : 'That did not work. Please try again.';
    throw new ApiError(res.status, data?.error ?? fallback, data?.code ?? (res.status >= 500 ? 'offline' : 'error'), data?.fields ?? {});
  }
  return data as T;
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
  const started = request<Session>('/demo/session', { method: 'POST', body: { tier, role, sandboxKey: readKey() } })
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
