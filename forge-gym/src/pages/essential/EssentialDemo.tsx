import { useEffect, useState } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { DemoBar } from '@/components/forge/DemoBar';
import { Loader } from '@/components/ui/Loader';
import { Cursor } from '@/components/ui/Cursor';
import { IntensityRail } from '@/components/ui/IntensityRail';
import { Nav } from '@/components/sections/Nav';
import { Hero } from '@/components/sections/Hero';
import { Statement } from '@/components/sections/Statement';
import { Membership } from '@/components/sections/Membership';
import { Trainers } from '@/components/sections/Trainers';
import { Classes } from '@/components/sections/Classes';
import { Footer } from '@/components/sections/Footer';
import { sampleGym } from '@/config/sampleGym';
import { About, Enquiry, Gallery, MobileActions, Visit, useDemoActions } from './sections';

/**
 * Essential demo: the sample gym's public website. This is everything the
 * Essential package covers, so it deliberately shows no member-management screens.
 */
export default function EssentialDemo() {
  const [ready, setReady] = useState(false);
  const [openAction, actionDialog] = useDemoActions();
  useLenis();

  useEffect(() => {
    document.title = `${sampleGym.name} — sample gym website · FORGE Essential demo`;
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60]">
        <DemoBar current="essential" note="Sample gym website, sample content" />
      </div>
      <Loader onDone={() => setReady(true)} />
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Cursor />
        <IntensityRail />
        <Nav />
        <main>
          <Hero />
          <Statement />
          <About />
          <Membership />
          <Trainers />
          <Gallery />
          <Classes />
          <Visit onAction={openAction} />
          <Enquiry onAction={openAction} />
        </main>
        <Footer />
        <MobileActions onAction={openAction} />
      </div>
      {actionDialog}
    </>
  );
}
