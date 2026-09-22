import { media, EMAIL } from '../content';
import { Img } from './Media';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#e9ecea] text-[#1b2244]">
      <div className="relative h-[46vh] min-h-[300px]">
        <Img m={media.footer} alt="Guests walking out onto the White Rann" className="absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,20,48,.55),transparent_40%,#e9ecea)]" />
        <p className="serif d3 absolute top-10 wrap m-0 text-[#e9ecea]">See you at sunrise.</p>
      </div>
      <div className="wrap pb-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)' }}>
        <p className="serif m-0 leading-[.8] text-[clamp(72px,21vw,360px)] tracking-[-0.03em]" aria-hidden="true">Saltlight</p>
        <div className="mt-10 grid sm:grid-cols-3 gap-6 text-[15px]">
          <p className="m-0">Near Dhordo, Kutch<br />Gujarat 370510</p>
          <p className="m-0">Open 1 November to 31 March<br /><a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          <p className="m-0 sm:text-right muted">© {new Date().getFullYear()} Saltlight<br />Site by DevWithDevansh</p>
        </div>
      </div>
    </footer>
  );
}
