import { useState } from 'react';
import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

const GOALS = ['Strength', 'Weight Loss', 'Muscle Gain', 'Fitness', 'Sports Performance', 'General Health'];

export function FinalCta() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section data-phase="CLOSE" className="relative bg-ink">
      <div className="relative flex h-[70vh] min-h-[460px] items-center overflow-hidden">
        <Img src={images.finalCta} alt="Athlete walking toward camera" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="relative z-10 px-6 lg:px-12">
          <Reveal>
            <h2 className="font-display text-[15vw] leading-[0.85] text-bone lg:text-[9vw]">BECOME</h2>
            <h2 className="font-display text-[15vw] leading-[0.85] text-red lg:text-[9vw]">STRONGER.</h2>
          </Reveal>
        </div>
      </div>

      <div id="tour" className="mx-auto max-w-3xl px-6 py-24 lg:px-12 lg:py-32">
        <Reveal className="mb-10 text-center">
          <p className="eyebrow mb-4">Start Today</p>
          <h3 className="font-display text-4xl text-bone lg:text-5xl">Book A Tour</h3>
        </Reveal>

        {submitted ? (
          <Reveal>
            <div className="border border-line py-16 text-center">
              <p className="font-display text-3xl text-bone">You're In.</p>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-mute">
                We'll call you to confirm your slot.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="flex flex-col gap-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Name" name="name" type="text" required />
                <Field label="Phone" name="phone" type="tel" required />
              </div>
              <Field label="Email" name="email" type="email" required />

              <div>
                <label className="eyebrow mb-3 block">Goal</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <GoalPill key={g} label={g} />
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Preferred Date" name="date" type="date" required />
                <Field label="Preferred Time" name="time" type="time" required />
              </div>

              <button
                type="submit"
                data-cursor="START"
                className="mt-4 bg-bone px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-red hover:text-bone"
              >
                Book My Tour →
              </button>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Field({ label, name, type, required }: { label: string; name: string; type: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border-b border-line bg-transparent py-3 font-body text-bone outline-none transition-colors focus:border-red"
      />
    </label>
  );
}

function GoalPill({ label }: { label: string }) {
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setActive((v) => !v)}
      className={`border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
        active ? 'border-red bg-red text-bone' : 'border-line text-mute hover:text-bone'
      }`}
    >
      {label}
    </button>
  );
}
