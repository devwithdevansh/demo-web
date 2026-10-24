import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ForgeMark } from '@/components/forge/DemoBar';
import { request, ApiError } from '@/lib/api';
import type { Session } from '@/lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await request<Session>('/auth/login', {
        method: 'POST',
        body: { identifier, password },
      });
      // Store session
      localStorage.setItem('forge.session', JSON.stringify(res));
      localStorage.setItem('forge.token', res.token);
      // Redirect based on role
      const redirect = params.get('redirect') || `/${res.user.role}`;
      navigate(redirect, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Could not connect to the server. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-md border border-line bg-ink-2 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <ForgeMark className="mx-auto text-3xl" />
          <h1 className="mt-4 font-display text-2xl uppercase tracking-wider text-bone">
            Gym Software Sign-In
          </h1>
          <p className="mt-1 font-mono text-xs text-mute">
            Sign in with your registered phone number or email
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red/40 bg-red-dim/40 px-4 py-3 font-mono text-xs text-red">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-bone-dim">
              Phone Number or Email
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 9876543210 or owner@gym.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1.5 w-full border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-bone transition-colors focus:border-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-bone-dim">
              Password / PIN
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-bone transition-colors focus:border-red focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bone py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-red hover:text-bone disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-line/60 pt-4 text-center font-mono text-[11px] text-mute">
          Looking for the product website?{' '}
          <a
            href={import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5173'}
            className="text-bone underline hover:text-red"
          >
            Visit forgegym.in
          </a>
        </div>
      </div>
    </div>
  );
}
