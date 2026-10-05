import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from '@/pages/Home';

// Each demo loads on demand, so the homepage stays light.
const EssentialDemo = lazy(() => import('@/pages/essential/EssentialDemo'));
const TierEntry = lazy(() => import('@/portal/TierEntry'));
const Portal = lazy(() => import('@/portal/Portal'));
const PayDemo = lazy(() => import('@/pages/DemoPages').then((m) => ({ default: m.PayDemo })));
const SampleClip = lazy(() => import('@/pages/DemoPages').then((m) => ({ default: m.SampleClip })));
const NotFound = lazy(() => import('@/pages/DemoPages').then((m) => ({ default: m.NotFound })));

/** Start each page at the top. In-page links (#packages) are left to the browser. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-ink" role="status">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">Loading</span>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demo/essential" element={<EssentialDemo />} />
          <Route path="/demo/growth" element={<TierEntry tier="growth" />} />
          <Route path="/demo/growth/:role/*" element={<Portal tier="growth" />} />
          <Route path="/demo/performance" element={<TierEntry tier="performance" />} />
          <Route path="/demo/performance/:role/*" element={<Portal tier="performance" />} />
          <Route path="/demo/pay/:token" element={<PayDemo />} />
          <Route path="/demo/sample-clip" element={<SampleClip />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
