import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Login = lazy(() => import('@/pages/auth/Login'));
const Activate = lazy(() => import('@/pages/auth/Activate'));
const Portal = lazy(() => import('@/portal/Portal'));

function RootRedirect() {
  const stored = localStorage.getItem('forge.session');
  if (stored) {
    try {
      const session = JSON.parse(stored);
      if (session?.user?.role) {
        return <Navigate to={`/${session.user.role}`} replace />;
      }
    } catch {
      localStorage.removeItem('forge.session');
    }
  }
  return <Navigate to="/login" replace />;
}

function PageLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-ink" role="status">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">Loading Portal...</span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<Activate />} />
        {/* Role portals: /owner/*, /staff/*, /trainer/*, /member/* */}
        <Route path="/owner/*" element={<Portal role="owner" />} />
        <Route path="/staff/*" element={<Portal role="staff" />} />
        <Route path="/trainer/*" element={<Portal role="trainer" />} />
        <Route path="/member/*" element={<Portal role="member" />} />
        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
}
