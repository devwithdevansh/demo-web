import { useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './components/Header';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Day from './components/Day';
import Stays from './components/Stays';
import Craft from './components/Craft';
import Notes from './components/Notes';
import Booking from './components/Booking';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

// Leaflet is the heaviest dependency, so the map loads in its own chunk.
const MapSection = lazy(() => import('./components/MapSection'));

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.15, anchors: { offset: 0 } });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // Images load late; recalc pin distances once everything is in.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.removeEventListener('load', refresh); };
  }, []);

  return (
    <>
      <a href="#day" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] btn">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <Intro />
        <Day />
        <Stays />
        <Craft />
        <Suspense fallback={<div id="map" className="h-[80vh]" />}><MapSection /></Suspense>
        <Notes />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
