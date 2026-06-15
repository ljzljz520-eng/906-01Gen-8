import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';
import Home from '@/pages/Home';
import VulnDetail from '@/pages/VulnDetail';
import Submit from '@/pages/Submit';
import Review from '@/pages/Review';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Forbidden from '@/pages/Forbidden';
import NotFound from '@/pages/NotFound';
import { Navbar } from '@/components/Navbar';

function RequireAuth({
  children,
  roles,
}: {
  children: JSX.Element;
  roles: UserRole[];
}) {
  const { currentUser, initStore } = useAppStore();
  const location = useLocation();
  useEffect(() => initStore(), [initStore]);
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!roles.includes(currentUser.role)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { initStore } = useAppStore();
  useEffect(() => {
    initStore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, initStore]);
  const noNavbarPaths = ['/login', '/403'];
  const showNavbar = !noNavbarPaths.includes(location.pathname) && !location.pathname.startsWith('/40');
  return (
    <div className="min-h-screen bg-deep-space">
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vuln/:id" element={<VulnDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Forbidden />} />
          <Route
            path="/submit"
            element={
              <RequireAuth roles={[UserRole.RESEARCHER, UserRole.AUTHORIZED, UserRole.ADMIN]}>
                <Submit />
              </RequireAuth>
            }
          />
          <Route
            path="/review"
            element={
              <RequireAuth roles={[UserRole.ADMIN]}>
                <Review />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth roles={[UserRole.RESEARCHER, UserRole.AUTHORIZED, UserRole.ADMIN]}>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}
