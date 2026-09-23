import { useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Beading from './components/Beading';
import Process from './components/Process';
import Work from './components/Work';
import Reviews from './components/Reviews';
import Booking from './components/Booking';
import Footer from './components/Footer';
import './boond.css';

gsap.registerPlugin(ScrollTrigger);

// Leaflet is the heaviest dependency, so the map loads in its own chunk.
const Visit = lazy(() => import('./components/Visit'));

// Boond, ported in full from its own project (see ../../../../beadline (original) or ../../../../obsidian-react/src/sites/boond (this copy))
// so it lives inside the same Obsidian deployment instead of a separate
// hosted URL. `.boond-scope` on the wrapper redefines every CSS custom
// property this site uses (--foam, --asphalt, --bead, ...) for everything
// inside it, so it renders with its own real palette and type instead of
// inheriting Obsidian's -- see boond.css.
export default function BoondPage() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -72 } });
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
      // leftover pin-spacer from this page's hero would misplace scroll on
      // whichever page (Home, Lacquer, ...) mounts next.
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="boond-scope">
      <a href="#services" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] btn">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <Services />
        <Beading />
        <Process />
        <Work />
        <Suspense fallback={<div id="visit" className="h-[80vh]" />}><Visit /></Suspense>
        <Reviews />
        <Booking />
      </main>
      <Footer />
    </div>
  );
}
