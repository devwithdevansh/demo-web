export default function SplitSection() {
  const updateCursor = (text, big) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, big } }));
  };

  return (
    <section className="split" id="split" aria-label="Choose men or women services">
      <a 
        className="split-panel" 
        href="#men"
        onMouseEnter={() => updateCursor('View', true)}
        onMouseLeave={() => updateCursor('', false)}
      >
        <div className="ph ph-men">
          <img className="ph-img" src="/images/men_studio.jpg" alt="Men's studio" />
          <span className="ph-mark" style={{ right: '-4%', left: 'auto', bottom: '-10%', fontSize: '34vw' }}>M</span>
        </div>
        <div className="split-scrim"></div>
        <div className="split-content">
          <div className="eyebrow">For Him</div>
          <h2 className="split-label">Men</h2>
          <p className="body-md split-sub">Precision cuts, fades and beard artistry, built around how you actually live.</p>
          <span className="link-arrow split-cta">Enter Men's Studio
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 5H15M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="1.4"/></svg>
          </span>
        </div>
      </a>
      <a 
        className="split-panel" 
        href="#women"
        onMouseEnter={() => updateCursor('View', true)}
        onMouseLeave={() => updateCursor('', false)}
      >
        <div className="ph ph-women">
          <img className="ph-img" src="/images/women_studio.jpg" alt="Women's studio" />
          <span className="ph-mark" style={{ fontSize: '34vw' }}>W</span>
        </div>
        <div className="split-scrim"></div>
        <div className="split-content">
          <div className="eyebrow">For Her</div>
          <h2 className="split-label">Women</h2>
          <p className="body-md split-sub">Cut, colour and styling with an editorial hand — never generic, always yours.</p>
          <span className="link-arrow split-cta">Enter Women's Studio
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 5H15M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="1.4"/></svg>
          </span>
        </div>
      </a>
    </section>
  );
}
