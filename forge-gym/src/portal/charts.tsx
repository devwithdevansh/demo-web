import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Panel } from './ui';

/**
 * Small single-series charts for the portals. One series means one colour:
 * marks are a quiet grey, the current period is bone, and all text stays in
 * text colours. Every chart has a table view, and values are reachable by
 * hover, keyboard focus or the table.
 */

export interface Datum {
  label: string;
  value: number;
  /** Longer label for tooltips and the table, e.g. a full date. */
  full?: string;
  /** Marks the current period. */
  emphasis?: boolean;
}

const MARK = 'bg-mute';
const MARK_STRONG = 'bg-bone';

/** Rounds a maximum up to a clean axis value: 1, 2, 2.5, 5 or 10 times a power of ten. */
function niceMax(max: number) {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= max) ?? 10;
  return step * pow;
}

export function ChartCard({ title, hint, columns, rows, children }: { title: string; hint?: string; columns: [string, string]; rows: [string, string][]; children: ReactNode }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <Panel
      title={title}
      hint={hint}
      actions={
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          aria-pressed={asTable}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim underline decoration-line underline-offset-4 hover:text-bone"
        >
          {asTable ? 'Show chart' : 'Show table'}
        </button>
      }
    >
      {asTable ? (
        <div className="scroll-x p-4 sm:p-5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                <th className="py-2 pr-4 font-normal">{columns[0]}</th>
                <th className="py-2 text-right font-normal">{columns[1]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-line last:border-b-0">
                  <td className="py-2 pr-4 text-bone-dim">{label}</td>
                  <td className="py-2 text-right tabular-nums text-bone">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 sm:p-5">{children}</div>
      )}
    </Panel>
  );
}

function Tooltip({ value, label }: { value: string; label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap border border-line bg-graphite px-2.5 py-1.5 text-left shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
      <span className="block text-sm font-semibold text-bone">{value}</span>
      <span className="block text-[11px] text-bone-dim">{label}</span>
    </span>
  );
}

/** Vertical columns for values over time. */
export function Columns({ data, format, height = 190 }: { data: Datum[]; format: (n: number) => string; height?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const top = niceMax(Math.max(...data.map((d) => d.value)));
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  // Label every column when there are few; otherwise every second one, always including the last.
  const showLabel = (i: number) => data.length <= 8 || (data.length - 1 - i) % 2 === 0;

  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 flex-col justify-between text-right text-[10px] tabular-nums text-mute" style={{ height }} aria-hidden>
        {[top, top / 2, 0].map((t) => (
          <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
            {format(t)}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {[0, 50, 100].map((pct) => (
            <span key={pct} className="absolute inset-x-0 h-px bg-line" style={{ bottom: `${pct}%` }} aria-hidden />
          ))}
          <div className="absolute inset-0 flex items-end">
            {data.map((d, i) => {
              const labelled = d.emphasis || i === peak;
              return (
                <button
                  key={d.label + i}
                  type="button"
                  aria-label={`${d.full ?? d.label}: ${format(d.value)}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full min-w-0 flex-1 cursor-default flex-col items-center justify-end px-px outline-none"
                >
                  <span className="relative flex w-full max-w-6 flex-col items-center" style={{ height: `${(d.value / top) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}>
                    {active === i ? (
                      <Tooltip value={format(d.value)} label={d.full ?? d.label} />
                    ) : (
                      labelled && d.value > 0 && <span className="absolute bottom-full mb-1 whitespace-nowrap text-[10px] tabular-nums text-bone-dim">{format(d.value)}</span>
                    )}
                    <span
                      className={`block h-full w-full rounded-t-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-bone ${
                        d.emphasis ? MARK_STRONG : MARK
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex" aria-hidden>
          {data.map((d, i) => (
            <span key={d.label + i} className={`min-w-0 flex-1 text-center text-[10px] leading-tight ${d.emphasis ? 'text-bone' : 'text-mute'}`}>
              {showLabel(i) ? d.label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Horizontal bars for comparing a handful of named things. The value sits at the tip of each bar. */
export function Bars({ data, format }: { data: Datum[]; format: (n: number) => string }) {
  const top = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr]">
          <span className="truncate text-xs text-bone-dim" title={d.label}>
            {d.label}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <span className={`block h-3 rounded-r-[4px] ${d.emphasis ? MARK_STRONG : MARK}`} style={{ width: `${(d.value / top) * 82}%`, minWidth: d.value > 0 ? 2 : 0 }} />
            <span className="shrink-0 text-xs tabular-nums text-bone">{format(d.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A single line over time, with a crosshair that snaps to the nearest reading. */
export function LineChart({ data, format, height = 200 }: { data: Datum[]; format: (n: number) => string; height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pad = { top: 18, right: 54, bottom: 26, left: 8 };
  const values = data.map((d) => d.value);
  const lo = Math.floor(Math.min(...values) - 1);
  const hi = Math.ceil(Math.max(...values) + 1);
  const plotW = Math.max(0, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v: number) => pad.top + (1 - (v - lo) / (hi - lo)) * plotH;
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const last = data.length - 1;
  const shown = active ?? last;

  const onMove = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;
    const ratio = plotW === 0 ? 0 : (clientX - rect.left - pad.left) / plotW;
    setActive(Math.max(0, Math.min(last, Math.round(ratio * last))));
  };

  return (
    <div ref={wrapRef} className="relative" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Line chart, ${data.length} readings from ${data[0].full ?? data[0].label} to ${data[last].full ?? data[last].label}. Latest ${format(data[last].value)}.`}
          onPointerMove={(e) => onMove(e.clientX)}
          onPointerLeave={() => setActive(null)}
          className="block touch-pan-y"
        >
          {[lo, (lo + hi) / 2, hi].map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={pad.left + plotW} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
              <text x={width - 4} y={y(t) + 3} textAnchor="end" fontSize={10} fill="var(--color-mute)">
                {format(t)}
              </text>
            </g>
          ))}
          <path d={`${path} L${x(last)},${pad.top + plotH} L${x(0)},${pad.top + plotH} Z`} fill="var(--color-bone)" opacity={0.08} />
          <path d={path} fill="none" stroke="var(--color-bone)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {active !== null && <line x1={x(active)} x2={x(active)} y1={pad.top} y2={pad.top + plotH} stroke="var(--color-mute)" strokeWidth={1} />}
          <circle cx={x(shown)} cy={y(data[shown].value)} r={5} fill="var(--color-bone)" stroke="var(--color-ink-2)" strokeWidth={2} />
          {active === null && (
            <text x={x(last)} y={y(data[last].value) - 12} fontSize={11} fontWeight={600} textAnchor="end" fill="var(--color-bone)">
              {format(data[last].value)}
            </text>
          )}
          <text x={pad.left} y={height - 6} fontSize={10} fill="var(--color-mute)">
            {data[0].label}
          </text>
          <text x={pad.left + plotW} y={height - 6} fontSize={10} textAnchor="end" fill="var(--color-mute)">
            {data[last].label}
          </text>
        </svg>
      )}
      {width > 0 && active !== null && (
        <span
          className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap border border-line bg-graphite px-2.5 py-1.5"
          style={{ left: Math.max(48, Math.min(width - pad.right - 40, x(shown))), top: Math.max(0, y(data[shown].value) - 58) }}
        >
          <span className="block text-sm font-semibold text-bone">{format(data[shown].value)}</span>
          <span className="block text-[11px] text-bone-dim">{data[shown].full ?? data[shown].label}</span>
        </span>
      )}
    </div>
  );
}
