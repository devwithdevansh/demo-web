import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { FRAME_COUNT, framePath } from '@/config/sampleGym';

/**
 * Plays the bundled frame sequence as a short clip. The project ships the
 * hero footage as individual frames rather than a video file, so this draws
 * them to a canvas. Frames are only fetched once the visitor presses play.
 */
export function ClipPlayer({ label = 'Sample clip', fps = 12 }: { label?: string; fps?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef(0);
  const positionRef = useRef(0);
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [progress, setProgress] = useState(0);

  // Same spacing as the hero on each screen size, so frames already downloaded there are reused.
  const step = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 4 : 3;
  const count = Math.ceil(FRAME_COUNT / step);

  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img?.naturalWidth) return;
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const run = () => {
    let last = performance.now();
    const tick = (now: number) => {
      positionRef.current = (positionRef.current + ((now - last) / 1000) * fps) % count;
      last = now;
      draw(Math.floor(positionRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    setState('playing');
  };

  const load = () =>
    new Promise<void>((resolve) => {
      let done = 0;
      const settle = () => {
        done += 1;
        setProgress(Math.round((done / count) * 100));
        if (done === count) resolve();
      };
      framesRef.current = Array.from({ length: count }, (_, i) => {
        const img = new Image();
        img.onload = settle;
        img.onerror = settle;
        img.src = framePath(1 + i * step);
        return img;
      });
    });

  const toggle = async () => {
    if (state === 'loading') return;
    if (state === 'playing') {
      cancelAnimationFrame(rafRef.current);
      setState('paused');
      return;
    }
    if (framesRef.current.length === 0) {
      setState('loading');
      await load();
    }
    run();
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="relative aspect-video w-full overflow-hidden border border-line bg-ink-2">
      <img src={framePath(1)} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity ${state === 'idle' || state === 'loading' ? 'opacity-100' : 'opacity-0'}`} />
      <canvas ref={canvasRef} width={960} height={540} className="absolute inset-0 h-full w-full object-cover" role="img" aria-label={`${label}: a member on the bench press`} />
      <div className={`absolute inset-0 bg-ink/40 transition-opacity ${state === 'playing' ? 'opacity-0' : 'opacity-100'}`} aria-hidden />

      <button
        type="button"
        onClick={toggle}
        data-cursor={state === 'playing' ? 'PAUSE' : 'PLAY'}
        aria-label={state === 'playing' ? `Pause ${label.toLowerCase()}` : `Play ${label.toLowerCase()}`}
        className="group absolute inset-0 flex items-center justify-center"
      >
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full border border-bone bg-ink/70 text-bone backdrop-blur-sm transition-all group-hover:bg-red group-hover:border-red ${
            state === 'playing' ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100' : 'opacity-100'
          }`}
        >
          {state === 'playing' ? <Pause size={22} /> : <Play size={22} className="translate-x-0.5" />}
        </span>
      </button>

      <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em] text-bone">
        {state === 'loading' ? `Loading clip ${progress}%` : label}
      </p>
    </div>
  );
}
