import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ForgeMark } from '@/components/forge/DemoBar';
import { ApiError, request } from '@/lib/api';

/**
 * /admin/whatsapp — for the person who runs this FORGE installation.
 * Connects a WhatsApp Business app number through Meta's own sign-up window,
 * so reminders are sent from that number while it keeps working in the app.
 * Nothing secret lives in this page: the admin key is typed in, and the
 * server does every step that needs the Meta app secret.
 */

interface Overview {
  signup: { appId: string; configId: string; graphVersion: string } | null;
  connection: {
    phone: string | null;
    name: string | null;
    onBusinessApp: boolean;
    status: 'connected' | 'disconnected';
    statusReason: string | null;
    sync: { contacts?: string; history?: string; requestedAt?: string } | null;
    connectedAt: string;
  } | null;
  sendingFrom: { label: string; source: 'connected' | 'settings' } | null;
  demoPhones: string[];
  deliveryUpdates: boolean;
}

interface SignupSession {
  event?: string;
  wabaId?: string;
  phoneNumberId?: string;
}
interface FacebookSdk {
  init: (options: Record<string, unknown>) => void;
  login: (callback: (response: { authResponse?: { code?: string } | null }) => void, options: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

const KEY_STORE = 'forge.admin.key';
const BUTTON = 'inline-flex items-center justify-center px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const SOLID = `${BUTTON} bg-bone text-ink hover:bg-red hover:text-bone`;
const LINE = `${BUTTON} border border-line text-bone hover:border-bone`;
const LABEL = 'font-mono text-[10px] uppercase tracking-[0.16em] text-mute';

/** Loads Meta's JavaScript SDK once. It is loaded ahead of time so the sign-up window can open straight from a click. */
function loadFacebookSdk(appId: string, version: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.FB) return resolve();
    window.fbAsyncInit = () => {
      window.FB!.init({ appId, autoLogAppEvents: true, xfbml: false, version });
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => reject(new Error('Meta’s sign-up could not be loaded. Check your connection, or an ad blocker.'));
    document.head.appendChild(script);
  });
}

const isFacebook = (origin: string) => {
  try {
    const host = new URL(origin).hostname;
    return host === 'facebook.com' || host.endsWith('.facebook.com');
  } catch {
    return false;
  }
};

export default function WhatsAppAdmin() {
  const [key, setKey] = useState(() => {
    try {
      return sessionStorage.getItem(KEY_STORE) ?? '';
    } catch {
      return '';
    }
  });
  const [typed, setTyped] = useState('');
  const [info, setInfo] = useState<Overview | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const session = useRef<SignupSession>({});

  const call = useCallback(
    <T,>(path: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: unknown, withKey = key) =>
      request<T>(`/admin/whatsapp${path}`, { method, body, headers: { 'X-Admin-Key': withKey } }),
    [key],
  );
  const explain = (err: unknown) =>
    err instanceof ApiError && err.status === 404
      ? 'The admin page is switched off on the server. Set ADMIN_KEY (16 or more characters) and redeploy.'
      : err instanceof Error
        ? err.message
        : 'Something went wrong. Please try again.';

  const unlock = async (candidate: string) => {
    setBusy('unlock');
    setError(null);
    try {
      const data = await call<Overview>('', 'GET', undefined, candidate);
      setInfo(data);
      setKey(candidate);
      try {
        sessionStorage.setItem(KEY_STORE, candidate);
      } catch {
        // Private browsing: the key just has to be typed again next time.
      }
    } catch (err) {
      setInfo(null);
      setError(explain(err));
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    document.title = 'WhatsApp number · FORGE admin';
    if (key) void unlock(key);
    // Run once with whatever key this browser tab already holds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Meta's sign-up window reports how it ended, and which account and number were chosen.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isFacebook(event.origin)) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type !== 'WA_EMBEDDED_SIGNUP') return;
        session.current = { event: data.event, wabaId: data.data?.waba_id, phoneNumberId: data.data?.phone_number_id };
        if (data.event === 'CANCEL') setNotice(data.data?.error_message ? `Meta reported a problem: ${data.data.error_message}` : 'The sign-up was closed before it finished.');
      } catch {
        // Other messages from facebook.com are not ours.
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const signup = info?.signup;
  useEffect(() => {
    if (!signup) return;
    loadFacebookSdk(signup.appId, signup.graphVersion)
      .then(() => setSdkReady(true))
      .catch((err: Error) => setError(err.message));
  }, [signup]);

  const run = async (name: string, action: () => Promise<void>) => {
    setBusy(name);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(null);
    }
  };

  const connect = () => {
    if (!signup || !window.FB) return;
    setBusy('connect');
    setError(null);
    setNotice(null);
    session.current = {};
    // Opened directly from the click, so the browser allows the popup.
    window.FB.login(
      (response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setBusy(null);
          setNotice((current) => current ?? 'The sign-up was closed before it finished. Nothing was connected.');
          return;
        }
        // The code is only valid for 30 seconds, so it goes to the server immediately.
        void run('connect', async () => {
          setInfo(await call<Overview>('/connect', 'POST', { code, ...session.current }));
          setNotice('Number connected. Reminders in the demo now go out from it.');
        });
      },
      {
        config_id: signup.configId,
        response_type: 'code',
        override_default_response_type: true,
        // Offers "connect my existing WhatsApp Business app number" in Meta's window.
        extras: { setup: {}, featureType: 'whatsapp_business_app_onboarding', sessionInfoVersion: '3' },
      },
    );
  };

  const connection = info?.connection;
  const syncFailed = connection?.sync && (connection.sync.contacts === 'failed' || connection.sync.history === 'failed');

  return (
    <div className="min-h-svh bg-ink text-bone">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" aria-label="FORGE home">
            <ForgeMark className="text-xl" />
          </Link>
          <span className={LABEL}>Admin</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-5 py-10">
        <div>
          <h1 className="font-display text-5xl leading-none text-bone">WhatsApp number</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mute">
            Connect a number that is already on the WhatsApp Business app. It keeps working in the app, and FORGE sends reminders from it.
          </p>
        </div>

        {error && (
          <p className="border border-red/60 bg-red-dim/40 px-4 py-3 text-sm text-bone" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="border border-line bg-ink-2 px-4 py-3 text-sm text-bone-dim" role="status">
            {notice}
          </p>
        )}

        {!info ? (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void unlock(typed.trim());
            }}
            className="space-y-4 border border-line bg-ink-2 p-5"
          >
            <label className="block">
              <span className={`${LABEL} mb-2 block`}>Admin key</span>
              <input
                type="password"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                className="w-full border border-line bg-ink px-3 py-2.5 text-base text-bone outline-none focus:border-bone"
              />
            </label>
            <p className="text-xs leading-relaxed text-mute">This is the ADMIN_KEY set on the server. It is kept only for this browser tab.</p>
            <button type="submit" disabled={!typed.trim() || busy === 'unlock'} className={SOLID}>
              {busy === 'unlock' ? 'Checking…' : 'Unlock'}
            </button>
          </form>
        ) : (
          <>
            <section className="border border-line bg-ink-2">
              <h2 className="border-b border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">Right now</h2>
              <dl className="grid gap-x-8 gap-y-4 p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className={LABEL}>Demo messages are sent from</dt>
                  <dd className="mt-1 text-bone">{info.sendingFrom ? info.sendingFrom.label : 'Nowhere yet (sends are simulated)'}</dd>
                </div>
                <div>
                  <dt className={LABEL}>And delivered only to</dt>
                  <dd className="mt-1 text-bone">{info.demoPhones.length ? `Demo phone ${info.demoPhones.join(', ')}` : 'No demo phone set (WHATSAPP_DEMO_RECIPIENTS)'}</dd>
                </div>
                <div>
                  <dt className={LABEL}>Connected number</dt>
                  <dd className="mt-1 text-bone">
                    {connection ? `${connection.phone ?? 'Number'}${connection.name ? ` · ${connection.name}` : ''}` : 'None'}
                    {connection && (
                      <span className={`ml-2 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${connection.status === 'connected' ? 'border-ok/50 text-ok' : 'border-red/60 text-red'}`}>
                        {connection.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                    )}
                  </dd>
                  {connection?.status === 'disconnected' && <dd className="mt-1 text-xs text-mute">Reason from WhatsApp: {connection.statusReason || 'not given'}. Connect it again below.</dd>}
                </div>
                <div>
                  <dt className={LABEL}>Delivery updates</dt>
                  <dd className="mt-1 text-bone">{info.deliveryUpdates ? 'On' : 'Off (needs the webhook settings)'}</dd>
                </div>
                {connection?.sync && (
                  <div className="sm:col-span-2">
                    <dt className={LABEL}>Sync Meta requires after connecting</dt>
                    <dd className="mt-1 text-bone">
                      Contacts: {connection.sync.contacts ?? 'not started'} · Chat history: {connection.sync.history ?? 'not started'}
                    </dd>
                    <dd className="mt-1 text-xs leading-relaxed text-mute">
                      FORGE asks for this because Meta requires it within 24 hours. It does not keep the chats or contacts it is sent.
                    </dd>
                  </div>
                )}
              </dl>
              {connection && (
                <div className="flex flex-wrap gap-2 border-t border-line p-5">
                  <button
                    type="button"
                    disabled={!!busy || !info.sendingFrom}
                    className={SOLID}
                    onClick={() =>
                      run('test', async () => {
                        const res = await call<{ to: string; from: string }>('/test', 'POST');
                        setNotice(`Test message handed to WhatsApp, from ${res.from} to the demo phone ${res.to}. Check that phone.`);
                      })
                    }
                  >
                    {busy === 'test' ? 'Sending…' : 'Send test message'}
                  </button>
                  {syncFailed && (
                    <button type="button" disabled={!!busy} className={LINE} onClick={() => run('sync', async () => setInfo(await call<Overview>('/sync', 'POST')))}>
                      {busy === 'sync' ? 'Retrying…' : 'Retry sync'}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!!busy}
                    className={LINE}
                    onClick={() => {
                      if (!window.confirm('Stop FORGE using this number? You can connect it again later.')) return;
                      void run('disconnect', async () => {
                        setInfo(await call<Overview>('', 'DELETE'));
                        setNotice('Disconnected here. To fully remove access, also open the WhatsApp Business app: Settings > Account > Business Platform > Disconnect.');
                      });
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </section>

            <section className="border border-line bg-ink-2">
              <h2 className="border-b border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">
                {connection?.status === 'connected' ? 'Connect a different number' : 'Connect a number'}
              </h2>
              <div className="space-y-4 p-5">
                {!signup ? (
                  <p className="text-sm leading-relaxed text-bone-dim">
                    Sign-up is not set up on the server yet. It needs WHATSAPP_APP_ID, WHATSAPP_APP_SECRET and WHATSAPP_CONFIG_ID, then a redeploy.
                  </p>
                ) : (
                  <>
                    <ol className="space-y-2 text-sm leading-relaxed text-bone-dim">
                      <li>1. Have the phone with the WhatsApp Business app in your hand.</li>
                      <li>2. Press the button below. Meta's own window opens.</li>
                      <li>3. Choose to connect your existing WhatsApp Business app account, and enter the number.</li>
                      <li>4. A code arrives in the WhatsApp Business app. Follow the prompts there, then enter the code in Meta's window.</li>
                    </ol>
                    <p className="text-xs leading-relaxed text-mute">
                      After connecting, WhatsApp turns off broadcast lists, disappearing messages, view-once and live location on that number, and unlinks companion
                      devices (most can be linked again). You can disconnect at any time from the app.
                    </p>
                    <button type="button" disabled={!sdkReady || !!busy} onClick={connect} className={SOLID}>
                      {busy === 'connect' ? 'Waiting for Meta…' : sdkReady ? 'Connect WhatsApp number' : 'Loading Meta sign-up…'}
                    </button>
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
