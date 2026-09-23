import { useEffect, useState } from 'react';
import Loader from './components/Loader';
import ActionBar from './components/ActionBar';
import Cursor from './components/Cursor';
import AmbientSpotlight from './components/AmbientSpotlight';
import Catalog from './pages/Catalog';
import BoondPage from './sites/boond/BoondPage';
import KavachPage from './sites/kavach/KavachPage';
import Header from './components/Header';
import Hero from './components/Hero';
import Statement from './components/Statement';
import BeforeAfter from './components/BeforeAfter';
import Services from './components/Services';
import Process from './components/Process';
import PaintCorrection from './components/PaintCorrection';
import Ceramic from './components/Ceramic';
import PPF from './components/PPF';
import Modification from './components/Modification';
import Configurator from './components/Configurator';
import Builds from './components/Builds';
import Studio from './components/Studio';
import Craftsmanship from './components/Craftsmanship';
import Reviews from './components/Reviews';
import Booking from './components/Booking';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

// The catalog is the front door -- no hash lands there. Kohinoor's own
// homepage is just one more studio site now, reached at '#/kohinoor' like
// Boond and Kavach are at their own hashes, not the thing you see by
// default. Every ported page also has its OWN same-page anchors (Boond and
// Kavach's "Book a slot" both point at '#book', Kohinoor's nav uses '#hero'
// / '#services' / etc.) -- those aren't page routes, so routeFromHash
// returns null for them and the hashchange handler leaves the current page
// alone, letting the browser's native anchor-scroll do its job instead of
// yanking the user back to the catalog or the homepage mid-scroll.
const ROUTES = { '#/catalog': 'catalog', '#/kohinoor': 'home', '#/boond': 'boond', '#/kavach': 'kavach' };
const routeFromHash = () => {
  if (window.location.hash === '') return 'catalog';
  return ROUTES[window.location.hash] ?? null;
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  // A plain hash route, not react-router: it needs no server rewrite rule to
  // work on whatever static host already serves this site, and every other
  // studio site lives here as one more page, not a link out to a separate
  // deployment -- see src/sites/*.
  const [route, setRoute] = useState(() => routeFromHash() ?? 'catalog');

  useEffect(() => {
    const onHashChange = () => {
      const next = routeFromHash();
      if (next) setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Every route swap here is a hash change, not a real page load, so the
  // browser keeps whatever scroll position the previous page was at. Boond
  // and Kavach already reset this themselves before their own Lenis/GSAP
  // setup runs (order matters there); this covers the catalog and Kohinoor's
  // own homepage too, neither of which has that setup to hook into.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (route === 'catalog') {
    return (
      <>
        <Cursor />
        <AmbientSpotlight />
        <Catalog />
      </>
    );
  }

  if (route === 'boond') return <BoondPage />;
  if (route === 'kavach') return <KavachPage />;

  return (
    <>
      {!isLoaded && <Loader onComplete={() => setIsLoaded(true)} />}
      <Cursor />
      <AmbientSpotlight />

      {/* We apply a wrapper class to stop interactions until loaded */}
      <div className={!isLoaded ? 'pointer-events-none' : ''}>
        <Header />

        <main>
          <Hero isReady={isLoaded} />
          <Statement />
          <BeforeAfter />
          <Services />
          <Process />
          <PaintCorrection />
          <Ceramic />
          <PPF />
          <Modification />
          <Configurator />
          <Builds />
          <Studio />
          <Craftsmanship />
          <Reviews />
          <Booking />
          <FinalCTA />
        </main>

        <Footer />
        <div className="h-[64px] md:hidden" aria-hidden="true" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        <ActionBar />
      </div>
    </>
  );
}

export default App;
