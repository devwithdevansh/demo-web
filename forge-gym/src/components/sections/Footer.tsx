export function Footer() {
  return (
    <footer className="border-t border-line bg-ink py-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <p className="font-display text-3xl text-bone">FORGE</p>
          <p className="mt-2 max-w-xs font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
            Discipline. Power. Movement. Community. Progress.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="eyebrow mb-3">Visit</p>
            <p className="font-mono text-xs text-bone-dim leading-relaxed">
              Rajkot, Gujarat<br />Open 7 days
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Contact</p>
            <p className="font-mono text-xs text-bone-dim leading-relaxed">
              hello@forge.club<br />+91 00000 00000
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Follow</p>
            <p className="font-mono text-xs text-bone-dim leading-relaxed">
              Instagram<br />YouTube
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1440px] px-6 lg:px-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute/60">
          © {new Date().getFullYear()} Forge Performance Club. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
