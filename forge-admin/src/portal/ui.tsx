/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { CheckCircle2, Info, Loader2, X, AlertTriangle } from 'lucide-react';
import { ApiError } from '@/lib/api';

/**
 * Shared building blocks for the Growth and Performance portals. They use the
 * same ink / bone / red tokens and square corners as the FORGE site, so the
 * dashboards read as part of one product.
 */

// ---- Buttons --------------------------------------------------------------

type Variant = 'primary' | 'accent' | 'ghost' | 'quiet';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-bone text-ink hover:bg-red hover:text-bone',
  accent: 'bg-red text-bone hover:bg-bone hover:text-ink',
  ghost: 'border border-line text-bone hover:border-bone',
  quiet: 'text-bone-dim underline decoration-line underline-offset-4 hover:text-bone hover:decoration-bone',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  busy?: boolean;
}

export function Btn({ variant = 'primary', size = 'md', busy = false, className = '', children, disabled, type = 'button', ...rest }: BtnProps) {
  const pad = variant === 'quiet' ? 'py-1' : size === 'sm' ? 'px-3 py-2' : 'px-5 py-3';
  return (
    <button
      type={type}
      disabled={disabled || busy}
      className={`inline-flex min-h-9 items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pad} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {busy && <Loader2 size={14} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

// ---- Layout ---------------------------------------------------------------

export function PageHead({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-4xl leading-none text-bone sm:text-5xl">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, hint, actions, children, className = '' }: { title?: string; hint?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-ink-2 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone">{title}</h2>}
            {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** A headline number. The value stays in bone; any state is carried by a labelled badge, not colour alone. */
export function Stat({ label, value, note, badge }: { label: string; value: ReactNode; note?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="border border-line bg-ink-2 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">{label}</p>
        {badge}
      </div>
      <p className="mt-3 font-heavy text-3xl font-semibold leading-none text-bone sm:text-4xl">{value}</p>
      {note && <p className="mt-2 text-xs text-mute">{note}</p>}
    </div>
  );
}

type Tone = 'ok' | 'warn' | 'bad' | 'mute' | 'info';
const TONES: Record<Tone, string> = {
  ok: 'border-ok/50 text-ok',
  warn: 'border-warn/50 text-warn',
  bad: 'border-red/60 text-red',
  mute: 'border-line text-mute',
  info: 'border-bone/40 text-bone',
};

export function Badge({ tone = 'mute', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${TONES[tone]}`}>
      {children}
    </span>
  );
}

const STATUS: Record<string, { tone: Tone; label: string }> = {
  active: { tone: 'ok', label: 'Active' },
  expiring: { tone: 'warn', label: 'Ending soon' },
  expired: { tone: 'bad', label: 'Expired' },
};
export const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS[status] ?? { tone: 'mute' as Tone, label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
};

/** Marks a control that comes from an add-on rather than the base package. */
export const AddonTag = () => <Badge tone="info">Add-on</Badge>;

/** How a payment came in, when it was not taken at the desk: a provider's test mode, or the practice page. */
export function PaymentTag({ payment }: { payment: { simulated?: boolean; gateway?: string } }) {
  if (payment.gateway === 'razorpay_test') return <Badge tone="info">Test payment</Badge>;
  return payment.simulated ? <Badge>Simulated</Badge> : null;
}

/** Honest label for anything that only pretends to reach the outside world. */
export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 border border-line bg-ink px-3 py-2.5 text-xs leading-relaxed text-bone-dim">
      <Info size={14} className="mt-0.5 shrink-0 text-mute" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

// ---- States ---------------------------------------------------------------

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-14 text-mute" role="status">
      <Loader2 size={16} className="animate-spin" aria-hidden />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="font-display text-2xl text-bone">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mute">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="px-4 py-12 text-center" role="alert">
      <AlertTriangle size={20} className="mx-auto text-warn" aria-hidden />
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-bone-dim">{error}</p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Btn variant="ghost" size="sm" onClick={onRetry}>
            Try again
          </Btn>
        </div>
      )}
    </div>
  );
}

/** Renders loading, error or content for one data request. */
export function Async<T>({ state, children, label }: { state: { data: T | null; error: string | null; loading: boolean; reload: () => void }; children: (data: T) => ReactNode; label?: string }) {
  if (state.data) return <div className={state.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>{children(state.data)}</div>;
  if (state.error) return <ErrorBlock error={state.error} onRetry={state.reload} />;
  return <Loading label={label} />;
}

// ---- Forms ----------------------------------------------------------------

const CONTROL =
  'w-full border bg-ink px-3 py-2.5 text-base text-bone placeholder:text-mute/60 outline-none transition-colors focus:border-bone sm:text-sm';

function Labelled({ label, error, hint, htmlFor, children }: { label: string; error?: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-err`} className="mt-1.5 text-xs text-red" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-mute">{hint}</p>
      )}
    </div>
  );
}

interface FieldBase {
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ label, error, hint, className = '', ...rest }: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Labelled label={label} error={error} hint={hint} htmlFor={id}>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={`${CONTROL} ${error ? 'border-red' : 'border-line'} ${className}`} {...rest} />
    </Labelled>
  );
}

export function SelectField({ label, error, hint, children, className = '', ...rest }: FieldBase & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Labelled label={label} error={error} hint={hint} htmlFor={id}>
      <select id={id} aria-invalid={!!error} className={`${CONTROL} ${error ? 'border-red' : 'border-line'} ${className}`} {...rest}>
        {children}
      </select>
    </Labelled>
  );
}

export function TextArea({ label, error, hint, className = '', ...rest }: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Labelled label={label} error={error} hint={hint} htmlFor={id}>
      <textarea id={id} rows={3} aria-invalid={!!error} className={`${CONTROL} resize-y ${error ? 'border-red' : 'border-line'} ${className}`} {...rest} />
    </Labelled>
  );
}

/** Form-level error line, shown above the submit button. */
export const FormError = ({ message }: { message?: string | null }) =>
  message ? (
    <p className="border border-red/60 bg-red-dim/40 px-3 py-2.5 text-sm text-bone" role="alert">
      {message}
    </p>
  ) : null;

/**
 * Tracks one submit: busy flag, field errors from the server, and a form-level message.
 * `run` resolves true when the action succeeded.
 */
export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setBusy(true);
    setFields({});
    setMessage(null);
    try {
      await action();
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setMessage(err.message);
      } else {
        setMessage('Something went wrong. Please try again.');
      }
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, fields, message, run };
}

// ---- Modal ----------------------------------------------------------------

// Open dialogs, oldest first. Keyboard handling belongs to the top one only.
const openModals: object[] = [];

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const self = {};
    openModals.push(self);
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('input, select, textarea, button, a[href]') ?? []).filter((el) => !el.hasAttribute('disabled'));
    (focusable().find((el) => el.dataset.modalClose === undefined) ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (openModals[openModals.length - 1] !== self) return;
      if (e.key === 'Escape') closeRef.current();
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      openModals.splice(openModals.indexOf(self), 1);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6" data-lenis-prevent>
      <div className="absolute inset-0 bg-ink/85" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-[92svh] w-full flex-col border border-line bg-ink-2 outline-none ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={titleId} className="font-display text-2xl leading-none text-bone">
            {title}
          </h2>
          <button type="button" data-modal-close onClick={onClose} aria-label="Close" className="-mr-2 p-2 text-mute transition-colors hover:text-bone">
            <X size={20} />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---- Toasts ---------------------------------------------------------------

type ToastKind = 'ok' | 'warn';
interface ToastItem {
  id: number;
  text: string;
  kind: ToastKind;
}
const ToastCtx = createContext<(text: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((text: string, kind: ToastKind = 'ok') => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-2), { id, text, kind }]);
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[300] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex max-w-md items-start gap-3 border border-line bg-graphite px-4 py-3 text-sm text-bone shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            {t.kind === 'ok' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden /> : <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---- Rows -----------------------------------------------------------------

/** A list row that stays readable on a phone: main text on the left, actions wrap underneath. */
export function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 last:border-b-0 sm:px-5 ${className}`}>{children}</div>;
}

export function RowMain({ title, meta }: { title: ReactNode; meta?: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 basis-48">
      <p className="truncate text-sm font-medium text-bone">{title}</p>
      {meta && <p className="mt-0.5 text-xs leading-relaxed text-mute">{meta}</p>}
    </div>
  );
}
