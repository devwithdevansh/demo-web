import { sampleGym } from '@/config/sampleGym';

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink pb-28 pt-12 lg:pb-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <p className="font-display text-3xl text-bone">{sampleGym.wordmark}</p>
          <p className="mt-2 max-w-xs font-mono text-[11px] uppercase tracking-[0.14em] text-mute">{sampleGym.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="eyebrow mb-3">Visit</p>
            <p className="font-mono text-xs text-bone-dim leading-relaxed">
              {sampleGym.address[0]}<br />{sampleGym.address[1]}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Contact</p>
            <p className="font-mono text-xs text-bone-dim leading-relaxed">
              {sampleGym.email}<br />{sampleGym.phone}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Hours</p>
            <p className="font-mono text-xs text-bone-dim leading-relaxed">
              Mon to Sat, 5:30 AM to 10:30 PM<br />Sun, 7:00 AM to 1:00 PM
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1440px] px-6 lg:px-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute/70">
          Demo website. {sampleGym.name} is a fictional gym, and its address, phone number, plans and trainers are sample content.
        </p>
      </div>
    </footer>
  );
}
