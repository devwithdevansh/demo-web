import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { prettyDay } from '@/lib/format';
import { Badge } from './ui';
import type { CoachLog, Workout } from './types';

const LOG_LABEL: Record<CoachLog['type'], string> = { checkin: 'Check-in', measurement: 'Measurement', pt_session: 'PT session' };

/** Trainer-recorded history, newest first. Shown to the trainer and, read-only, to the member. */
export function LogList({ logs }: { logs: CoachLog[] }) {
  return (
    <ul>
      {logs.map((l) => (
        <li key={l.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-3.5 last:border-b-0 sm:px-5">
          <div className="min-w-0 flex-1 basis-56">
            <p className="text-sm text-bone">
              {l.type === 'measurement'
                ? [l.weightKg !== undefined ? `Weight ${l.weightKg} kg` : null, l.waistCm !== undefined ? `Waist ${l.waistCm} cm` : null].filter(Boolean).join(' · ')
                : l.note}
            </p>
            {l.type === 'measurement' && l.note && <p className="mt-0.5 text-sm text-bone-dim">{l.note}</p>}
            <p className="mt-1 text-xs text-mute">
              {prettyDay(l.day)}
              {l.trainerName ? ` · ${l.trainerName}` : ''}
            </p>
          </div>
          <Badge>{LOG_LABEL[l.type]}</Badge>
        </li>
      ))}
    </ul>
  );
}

/** Opens a trainer's video link. The bundled sample clip stays inside the demo; anything else opens in a new tab. */
export function VideoLink({ url }: { url: string }) {
  const cls = 'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone underline decoration-line underline-offset-4 hover:decoration-bone';
  if (url.startsWith('/')) {
    return (
      <Link to={url} className={cls}>
        <Play size={11} aria-hidden /> Watch video
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      <Play size={11} aria-hidden /> Watch video
    </a>
  );
}

/** Read-only workout plan, as the member sees it. */
export function WorkoutView({ workout }: { workout: Workout }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {workout.days.map((d, i) => (
        <section key={`${d.day}-${i}`} className="border border-line bg-ink-2">
          <header className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <h3 className="font-display text-2xl leading-none text-bone">{d.day}</h3>
            {d.focus && <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{d.focus}</span>}
          </header>
          <ol>
            {d.exercises.map((e, j) => (
              <li key={`${e.name}-${j}`} className="border-b border-line px-4 py-3 last:border-b-0 sm:px-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-medium text-bone">{e.name}</p>
                  <p className="text-sm tabular-nums text-bone-dim">{[e.sets, e.reps].filter(Boolean).join(' × ')}</p>
                </div>
                {e.note && <p className="mt-1 text-xs leading-relaxed text-mute">{e.note}</p>}
                {e.videoUrl && (
                  <p className="mt-2">
                    <VideoLink url={e.videoUrl} />
                  </p>
                )}
              </li>
            ))}
            {d.exercises.length === 0 && <li className="px-4 py-3 text-sm text-mute sm:px-5">No exercises listed for this day.</li>}
          </ol>
        </section>
      ))}
    </div>
  );
}
