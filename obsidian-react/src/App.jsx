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
import { LEGACY_HASHES, routeForPath } from './seo/routes';

// Each page has its own real URL ('/', '/kohinoor', '/boond', '/kavach'),
// and the build writes a real HTML file for each one (see vite.config.js
// and src/seo/routes.js) -- so Google indexes four pages, not one, and every
// page arrives with its own title and description. Moving between pages is
// a plain link, i.e. a full page load, which also gives every site a fresh
// scroll position and a clean Lenis/GSAP setup for free.
//
// The old hash routes ('#/boond' etc.) are still accepted, so links already
// shared keep working: they're swapped for the real path on arrival. Every
// other hash ('#book', '#services', ...) is a same-page anchor and is left
// to the browser.
const initialRoute = () => {
  const legacy = LEGACY_HASHES[window.location.hash];
  if (legacy) window.history.replaceState(null, '', legacy);
  // Anything unknown (Render rewrites every path to index.html) shows the
  // catalog rather than a blank page.
  return (routeForPath(window.location.pathname) ?? routeForPath('/'));
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [page] = useState(initialRoute);
  const route = page.id;

  // The prerendered HTML already carries the right title; this covers the
  // legacy-hash case, where index.html's (catalog) title arrived instead.
  useEffect(() => {
    document.title = page.title;
  }, [page]);

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
        <div className="action-bar-spacer" aria-hidden="true" />
        <ActionBar />
      </div>
    </>
  );
}

export default App;
