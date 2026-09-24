import { useEffect, useState, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Loader from './components/Loader';
import Cursor from './components/Cursor';
import ActionBar from './components/ActionBar';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Services from './components/Services';
import BeforeAfter from './components/BeforeAfter';
import Beading from './components/Beading';
import Process from './components/Process';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Booking from './components/Booking';
import Footer from './components/Footer';
import './kavach.css';

gsap.registerPlugin(ScrollTrigger);

// Leaflet is the heaviest dependency, so the studio map loads in its own chunk.
const Locator = lazy(() => import('./components/Locator'));

// Kavach, ported in full from its own project (see ../../../../lacquer (original) or ../../../../obsidian-react/src/sites/kavach (this copy)) so
// it lives inside the same Obsidian deployment instead of a separate hosted
// URL. `.kavach-scope` on the wrapper redefines every CSS custom property
// this site uses (--ink, --paper, --lacquer, --ceramic, ...) for everything
// inside it, so it renders with its own real palette and type instead of
// inheriting Obsidian's -- see kavach.css.
export default function KavachPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This page is reached by a hash-route swap, not a real page load, so
    // the browser's scroll position carries over from whatever page (or
    // scroll depth) came before it -- reset to the top before Lenis reads
    // the current position, or the hero's pinned scroll math starts from
    // wherever the previous page left off instead of from the top.
    window.scrollTo(0, 0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -76 } });
    // Lenis reads the native scroll position when it's constructed to seed
    // its own internal target, and on a route swap that's still wherever the
    // previous page was -- its first raf tick then re-applies that remembered
    // value, silently undoing the reset above. Force Lenis's own state to 0
    // too, not just the native scroll.
    lenis.scrollTo(0, { immediate: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // `window`'s 'load' event already fired once, back when the app first
    // booted -- it never fires again on a client-side route swap, so that
    // used to never re-run. Remote images finishing after mount (Unsplash)
    // still shift section heights, so re-measure on a short delay instead.
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 500);
    return () => {
      clearTimeout(t);
      gsap.ticker.remove(tick);
      lenis.destroy();
      // Every ScrollTrigger/pin this page created must go with it, or a
      // leftover pin-spacer from this page's hero would misplace scroll on
      // whichever page (Home, Beadline, ...) mounts next.
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="kavach-scope">
      {!isLoaded && <Loader onComplete={() => { setIsLoaded(true); ScrollTrigger.refresh(); }} />}
      <a href="#services" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] btn solid">Skip to content</a>
      <Cursor />
      <div className={!isLoaded ? 'pointer-events-none' : ''}>
        <Header />
        <main>
          <Hero />
          <Marquee />
          <Services />
          <BeforeAfter />
          <Beading />
          <Process />
          <Suspense fallback={<div id="studios" className="h-[80vh] bg-[var(--ink-2)]" />}><Locator /></Suspense>
          <Gallery />
          <Reviews />
          <Booking />
        </main>
        <Footer />
        <div className="action-bar-spacer" aria-hidden="true" />
        <ActionBar />
      </div>
    </div>
  );
}
