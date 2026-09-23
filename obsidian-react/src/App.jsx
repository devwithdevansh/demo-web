import { useEffect, useState } from 'react';
import Loader from './components/Loader';
import Cursor from './components/Cursor';
import AmbientSpotlight from './components/AmbientSpotlight';
import Catalog from './pages/Catalog';
import BeadlinePage from './sites/beadline/BeadlinePage';
import LacquerPage from './sites/lacquer/LacquerPage';
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

const ROUTES = { '#/catalog': 'catalog', '#/beadline': 'beadline', '#/lacquer': 'lacquer' };
const routeFromHash = () => ROUTES[window.location.hash] || 'home';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  // A plain hash route, not react-router: it needs no server rewrite rule to
  // work on whatever static host already serves this site, and every other
  // studio site lives here as one more page, not a link out to a separate
  // deployment -- see src/sites/*.
  const [route, setRoute] = useState(routeFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'catalog') {
    return (
      <>
        <Cursor />
        <AmbientSpotlight />
        <Catalog />
      </>
    );
  }

  if (route === 'beadline') return <BeadlinePage />;
  if (route === 'lacquer') return <LacquerPage />;

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
      </div>
    </>
  );
}

export default App;
