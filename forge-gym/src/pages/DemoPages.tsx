import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { DemoBar, ForgeMark } from '@/components/forge/DemoBar';
import { ClipPlayer } from '@/components/ui/ClipPlayer';
import { ApiError, request } from '@/lib/api';
import { inr } from '@/config/forge';

const BUTTON = 'inline-flex items-center justify-center gap-2 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors disabled:cursor-wait disabled:opacity-60';

// ---- Demo pay page --------------------------------------------------------

interface PayLink {
  gymName: string;
  payer: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
}

/**
 * /demo/pay/:token — what a member would see after opening a payment link.
 * It stands in for a UPI app: the visitor chooses the outcome, and no money moves.
 */
export function PayDemo() {
  const { token } = useParams();
  const [link, setLink] = useState<PayLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Demo payment page · FORGE';
    let live = true;
    request<PayLink>(`/public/pay/${token}`)
      .then((data) => live && setLink(data))
      .catch((err: unknown) => live && setError(err instanceof ApiError && err.status === 404 ? 'This demo payment link does not exist or has been reset.' : err instanceof Error ? err.message : 'Could not open this link.'));
    return () => {
      live = false;
    };
  }, [token]);

  const settle = async (outcome: 'success' | 'failure') => {
    setBusy(true);
    setError(null);
    try {
      setLink(await request<PayLink>(`/public/pay/${token}`, { method: 'POST', body: { outcome } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-ink text-bone">
      <header className="border-b border-line px-5 py-4">
        <Link to="/" aria-label="FORGE home">
          <ForgeMark className="text-xl" />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md border border-line bg-ink-2 p-6 sm:p-8">
          <p className="inline-block border border-warn/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-warn">Demo payment page</p>
          {!link && !error && <p className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-mute" role="status">Opening link…</p>}
          {link && (
            <>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Pay {link.gymName}</p>
              <p className="mt-2 font-heavy text-5xl font-semibold leading-none text-bone">{inr(link.amount)}</p>
              <p className="mt-3 text-sm text-bone-dim">Membership fee for {link.payer}</p>

              {link.status === 'pending' ? (
                <>
                  <p className="mt-6 border-l border-line pl-3 text-sm leading-relaxed text-mute">
                    This page stands in for a UPI app. No money moves and no bank is contacted. Choose an outcome to see how the gym's records respond.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    <button type="button" disabled={busy} onClick={() => settle('success')} className={`${BUTTON} bg-bone text-ink hover:bg-red hover:text-bone`}>
                      Simulate successful payment
                    </button>
                    <button type="button" disabled={busy} onClick={() => settle('failure')} className={`${BUTTON} border border-line text-bone hover:border-bone`}>
                      Simulate failed payment
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-6 border-t border-line pt-6" role="status">
                  {link.status === 'paid' ? <CheckCircle2 size={28} className="text-ok" aria-hidden /> : <XCircle size={28} className="text-red" aria-hidden />}
                  <p className="mt-3 font-display text-3xl leading-none text-bone">{link.status === 'paid' ? 'Simulated payment recorded' : 'Simulated payment failed'}</p>
                  <p className="mt-3 text-sm leading-relaxed text-bone-dim">
                    {link.status === 'paid'
                      ? 'The gym’s fee records now show this amount as paid by UPI, marked as simulated. No money was actually paid.'
                      : 'Nothing was recorded and the dues are unchanged. The gym would send a new link.'}
                  </p>
                  <p className="mt-4 text-xs text-mute">You can close this tab and go back to the demo.</p>
                </div>
              )}
            </>
          )}
          {error && (
            <p className="mt-6 text-sm leading-relaxed text-bone-dim" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

// ---- Sample exercise clip -------------------------------------------------

/** /demo/sample-clip — where the sample "Watch video" link in a workout plan leads. */
export function SampleClip() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'Sample exercise video · FORGE';
  }, []);

  return (
    <div className="min-h-svh bg-ink text-bone">
      <DemoBar current="performance" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone">
          <ArrowLeft size={13} aria-hidden /> Back to the workout
        </button>
        <p className="eyebrow mb-3">Trainer video link · sample</p>
        <h1 className="font-display text-5xl leading-[0.95] text-bone sm:text-6xl">Bench Press</h1>
        <div className="mt-6">
          <ClipPlayer label="Sample technique clip" />
        </div>
        <p className="mt-6 text-sm leading-relaxed text-bone-dim">
          A trainer can attach a video link to any exercise in a member's plan, for example a clip they recorded or a video they trust. The member taps "Watch
          video" in their workout to open it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mute">In the demo, the sample link opens this short clip that ships with the site instead of an outside website.</p>
      </main>
    </div>
  );
}

// ---- Not found ------------------------------------------------------------

export function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center text-bone">
      <ForgeMark className="text-2xl" />
      <h1 className="mt-8 font-display text-7xl leading-none text-bone">Page not found</h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute">That page does not exist. Head back to the homepage to pick a demo.</p>
      <Link to="/" className={`${BUTTON} mt-8 bg-bone text-ink hover:bg-red hover:text-bone`}>
        Back to FORGE
      </Link>
    </div>
  );
}
