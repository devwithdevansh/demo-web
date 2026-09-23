import { BRAND, EMAIL, INSTAGRAM, studios } from '../content';

export default function Footer() {
  return (
    <footer className="bg-[var(--ink)] wrap pt-16" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)' }}>
      <div className="grid sm:grid-cols-3 gap-8 text-[14px] text-[var(--paper-dim)]">
        {studios.map((s) => (
          <p key={s.id} className="m-0">
            <span className="block font-semibold text-[var(--paper)] mb-1">{s.city}, {s.area}</span>
            {s.address[0]}<br />{s.address[1]}<br />
            <a className="link" href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>
          </p>
        ))}
      </div>
      <div className="hairline my-10" />
      <div className="flex flex-wrap items-center justify-between gap-4 text-[14px] text-[var(--paper-dim)]">
        <a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <a className="link" href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a>
        <span className="opacity-60">© {new Date().getFullYear()} {BRAND}. Site by DevWithDevansh.</span>
      </div>
      <p className="display m-0 mt-12 leading-[.8] text-[clamp(52px,15vw,260px)] tracking-[-0.03em] whitespace-nowrap overflow-hidden text-[var(--paper)]" aria-hidden="true">{BRAND}</p>
    </footer>
  );
}
