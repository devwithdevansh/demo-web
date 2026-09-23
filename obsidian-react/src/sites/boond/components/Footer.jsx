import { BRAND, ADDRESS, HOURS, EMAIL } from '../content';

export default function Footer() {
  return (
    <footer className="bg-[#16191c] text-[#f3f5f6] wrap pt-16" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)' }}>
      <div className="grid sm:grid-cols-3 gap-6 text-[15px]">
        <p className="m-0">{ADDRESS[0]}<br />{ADDRESS[1]}</p>
        <p className="m-0">{HOURS}<br /><a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        <p className="m-0 sm:text-right opacity-60">© {new Date().getFullYear()} {BRAND}<br />Site by DevWithDevansh</p>
      </div>
      <p className="wide m-0 mt-12 leading-[.78] text-[clamp(56px,16vw,280px)] tracking-[-0.04em] whitespace-nowrap overflow-hidden" aria-hidden="true">{BRAND}</p>
    </footer>
  );
}
