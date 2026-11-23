import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const SuperAdmin = lazy(() => import('@/pages/SuperAdmin'));
const WhatsAppAdmin = lazy(() => import('@/pages/admin/WhatsAppAdmin'));

function PageLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-ink" role="status">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">Loading Admin Console...</span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<SuperAdmin />} />
        <Route path="/whatsapp" element={<WhatsAppAdmin />} />
        <Route path="*" element={<SuperAdmin />} />
      </Routes>
    </Suspense>
  );
}
