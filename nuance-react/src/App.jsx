import React from 'react';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SplitSection from './components/SplitSection';
import Services from './components/Services';
import Experience from './components/Experience';
import Transformation from './components/Transformation';
import Gallery from './components/Gallery';
import Stylists from './components/Stylists';
import Journal from './components/Journal';
import Products from './components/Products';
import Booking from './components/Booking';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="grain" aria-hidden="true"></div>
      
      <CustomCursor />
      <Preloader />
      <Navbar />

      <main id="main">
        <Hero />
        <SplitSection />
        <Services />
        <Experience />
        <Transformation />
        <Gallery />
        <Stylists />
        <Journal />
        <Products />
        <Booking />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}

export default App;
