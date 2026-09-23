import dwdLogo from '../assets/dwd-logo.png';

// Closes the pitch: whoever is being walked through this catalog on a
// tablet sees a direct next step, not just a portfolio that ends abruptly.
export default function PitchCTA() {
  const mailHref =
    'mailto:devwithdevansh@gmail.com?subject=' +
    encodeURIComponent('A site like this for my business') +
    '&body=' +
    encodeURIComponent('Hi DWD,\n\nI saw the Kohinoor / Boond / Kavach catalog and want something like this for my business.\n\n');

  return (
    <section className="pitch-cta">
      <img src={dwdLogo} alt="DWD" />
      <p className="eyebrow m-0">Every site above was built by</p>
      <h2 className="text-[clamp(26px,3.6vw,38px)] leading-[1.1] font-semibold max-w-[22ch] m-0">
        Want one of these, built for your business?
      </h2>
      <p className="max-w-[56ch] m-0 text-[14.5px] md:text-[15.5px] text-[var(--paper-dim)] leading-[1.6]">
        Same custom-build approach every time — your own palette, your own type, your own
        signature interaction — never a reskinned template. Live in days, not months.
      </p>
      <a href={mailHref} className="btn solid mt-[6px]">
        Get a site like this &rarr;
      </a>
    </section>
  );
}
