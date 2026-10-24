import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from '@/pages/Home';

const EssentialDemo = lazy(() => import('@/pages/essential/EssentialDemo'));

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

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/demo/essential" element={<EssentialDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
