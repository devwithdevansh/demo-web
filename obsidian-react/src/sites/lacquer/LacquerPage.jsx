import { useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import './lacquer.css';

gsap.registerPlugin(ScrollTrigger);

// Leaflet is the heaviest dependency, so the studio map loads in its own chunk.
const Locator = lazy(() => import('./components/Locator'));

// Lacquer, ported in full from its own project (see ../../../../lacquer) so
// it lives inside the same Obsidian deployment instead of a separate hosted
// URL. `.lacquer-scope` on the wrapper redefines every CSS custom property
// this site uses (--ink, --paper, --lacquer, --ceramic, ...) for everything
// inside it, so it renders with its own real palette and type instead of
// inheriting Obsidian's -- see lacquer.css.
export default function LacquerPage() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -76 } });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.removeEventListener('load', refresh);
      // Every ScrollTrigger/pin this page created must go with it, or a
      // leftover pin-spacer from Lacquer's hero would misplace scroll on
      // whichever page (Home, Beadline, ...) mounts next.
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="lacquer-scope">
      <a href="#services" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] btn solid">Skip to content</a>
      <Cursor />
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
      <div className="h-[64px] md:hidden" aria-hidden="true" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      <ActionBar />
    </div>
  );
}
