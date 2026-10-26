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

const API_ORIGIN = String(import.meta.env.VITE_API_URL ?? 'https://coral-rabbit-267767.hostingersite.com').replace(/\/+$/, '');

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
}

export async function request<T>(path: string, { method = 'GET', body, token, headers }: RequestOptions = {}): Promise<T> {
  const authToken = token || localStorage.getItem('forge.member.token');
  let res: Response;
  try {
    res = await fetch(`${API_ORIGIN}/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Please check your internet connection.', 'offline');
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'Request failed.', data?.code || 'error', data?.fields || {});
  }

  return data as T;
}
