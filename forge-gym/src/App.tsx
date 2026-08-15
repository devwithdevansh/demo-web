import { useState } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { Loader } from '@/components/ui/Loader';
import { Cursor } from '@/components/ui/Cursor';
import { IntensityRail } from '@/components/ui/IntensityRail';
import { Nav } from '@/components/sections/Nav';
import { Hero } from '@/components/sections/Hero';
import { Statement } from '@/components/sections/Statement';
import { Programs } from '@/components/sections/Programs';
import { TrainingFloor } from '@/components/sections/TrainingFloor';
import { Equipment } from '@/components/sections/Equipment';
import { Trainers } from '@/components/sections/Trainers';
import { TheBody } from '@/components/sections/TheBody';
import { Metrics } from '@/components/sections/Metrics';
import { Membership } from '@/components/sections/Membership';
import { Classes } from '@/components/sections/Classes';
import { Community } from '@/components/sections/Community';
import { Motivation } from '@/components/sections/Motivation';
import { Recovery } from '@/components/sections/Recovery';
import { Journal } from '@/components/sections/Journal';
import { Testimonial } from '@/components/sections/Testimonial';
import { SocialGallery } from '@/components/sections/SocialGallery';
import { FinalCta } from '@/components/sections/FinalCta';
import { Footer } from '@/components/sections/Footer';

function App() {
  const [ready, setReady] = useState(false);
  useLenis();

  return (
    <>
      <Loader onDone={() => setReady(true)} />
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Cursor />
        <IntensityRail />
        <Nav />
        <main>
          <Hero />
          <Statement />
          <Programs />
          <TrainingFloor />
          <Equipment />
          <Trainers />
          <TheBody />
          <Metrics />
          <Membership />
          <Classes />
          <Community />
          <Motivation />
          <Recovery />
          <Journal />
          <Testimonial />
          <SocialGallery />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
