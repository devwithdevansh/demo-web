import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/Login';
import MemberDashboard from '@/pages/MemberDashboard';
import { InstallPwaBanner } from '@/components/InstallPwaBanner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('forge.member.token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <InstallPwaBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
