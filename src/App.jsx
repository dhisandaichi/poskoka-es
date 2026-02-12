import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ToastContainer from './components/ToastContainer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrackViewPage from './pages/TrackViewPage';
import KioskPage from './pages/KioskPage';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import ForbiddenPage from './pages/error/ForbiddenPage';
import NotFoundPage from './pages/error/NotFoundPage';

function AppRoutes() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Volunteer Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['volunteer', 'admin', 'pengurus', 'korlap']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'pengurus', 'korlap']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Kiosk Setup - Restrict to Staff */}
        <Route path="/kiosk" element={
          <ProtectedRoute allowedRoles={['admin', 'korlap', 'pengurus']}>
            <KioskPage />
          </ProtectedRoute>
        } />

        {/* Track View - Authenticated Users for safety */}
        <Route path="/track-view" element={
          <ProtectedRoute>
            <TrackViewPage />
          </ProtectedRoute>
        } />

        {/* Error Pages */}
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
