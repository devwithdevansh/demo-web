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

gsap.registerPlugin(ScrollTrigger);

// Leaflet is the heaviest dependency, so the studio map loads in its own chunk.
const Locator = lazy(() => import('./components/Locator'));

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -76 } });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.removeEventListener('load', refresh); };
  }, []);

  return (
    <>
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
      {/* Reserves the action bar's own height at the bottom of the page on
          mobile, so its fixed position never covers the last bit of footer. */}
      <div className="h-[64px] md:hidden" aria-hidden="true" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      <ActionBar />
    </>
  );
}
