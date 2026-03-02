import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { PatientRegister } from './pages/auth/PatientRegister';
import { DoctorRegister } from './pages/auth/DoctorRegister';

// Dashboard Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BookAppointment } from './pages/patient/BookAppointment';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Settings } from './pages/Settings';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Landing />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} replace />} />
      <Route path="/register/patient" element={!user ? <PatientRegister /> : <Navigate to="/patient" replace />} />
      <Route path="/register/doctor" element={!user ? <DoctorRegister /> : <Navigate to="/doctor" replace />} />

      {/* Protected Routes - Patient */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/settings"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Doctor */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/settings"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
