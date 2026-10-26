import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { request, ApiError } from '@/lib/api';
import type { Session } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await request<Session>('/auth/login', {
        method: 'POST',
        body: { identifier: identifier.trim(), password },
      });

      if (res.user.role !== 'member') {
        throw new Error('This portal is for gym members. Gym owners and staff should use the Gym SaaS portal.');
      }

      localStorage.setItem('forge.member.token', res.token);
      localStorage.setItem('forge.member.session', JSON.stringify(res));
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not connect to gym server. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-ink px-4 py-8">
      <div className="w-full max-w-md border border-line bg-ink-2 p-7 sm:p-9 shadow-2xl">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-red/40 bg-red/10 text-red">
            <Dumbbell size={28} />
          </div>
          <h1 className="mt-4 font-display text-3xl uppercase tracking-wider text-bone">
            Member Access
          </h1>
          <p className="mt-1 font-mono text-xs text-mute">
            Sign in with your Member ID or phone number
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 border border-red/40 bg-red-dim/40 p-3 font-mono text-xs text-red">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-mute">
              Member ID or Phone
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-mute">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. IP-1001 or 9876543210"
                className="w-full border border-line bg-ink py-2.5 pl-9 pr-3 font-mono text-sm text-bone focus:border-red focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-mute">
              Password
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-mute">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password set by gym front desk"
                className="w-full border border-line bg-ink py-2.5 pl-9 pr-3 font-mono text-sm text-bone focus:border-red focus:outline-none"
              />
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-mute">
              * Password is set by your gym owner or front desk when you join.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 bg-bone py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink hover:bg-red hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Member App</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-line/60 pt-4 text-center font-mono text-[11px] text-mute">
          Need help logging in? Ask at the gym front desk to set or reset your password.
        </div>
      </div>
    </div>
  );
}
