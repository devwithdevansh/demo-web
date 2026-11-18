import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ForgeMark } from '@/components/forge/DemoBar';
import { request, ApiError } from '@/lib/api';
import type { Session } from '@/lib/api';

export default function Activate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing invite token. Please click the full link received on WhatsApp or email.');
    }
  }, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await request<Session>('/auth/activate', {
        method: 'POST',
        body: { token, password, name: name.trim() || undefined },
      });
      localStorage.setItem('forge.session', JSON.stringify(res));
      localStorage.setItem('forge.token', res.token);
      navigate(`/${res.user.role}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Activation failed. The link may have expired or was already used.');
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
            Activate Your Gym Account
          </h1>
          <p className="mt-1 font-mono text-xs text-mute">
            Set your password to launch your gym portal
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
              Your Name (Optional Update)
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-bone transition-colors focus:border-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-bone-dim">
              Choose a Password / PIN
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-bone transition-colors focus:border-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-bone-dim">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 w-full border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-bone transition-colors focus:border-red focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-bone py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-red hover:text-bone disabled:opacity-50"
          >
            {loading ? 'Activating Account...' : 'Complete Setup & Open Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
