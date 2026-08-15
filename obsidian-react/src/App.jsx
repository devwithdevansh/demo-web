import { useState } from 'react';
import Loader from './components/Loader';
import Cursor from './components/Cursor';
import AmbientSpotlight from './components/AmbientSpotlight';
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

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

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
