import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SkeletonTheme } from 'react-loading-skeleton';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Layouts
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

// Main Pages
import Dashboard from './pages/Dashboard';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import UserForm from './pages/admin/UserForm';
import SystemSettings from './pages/admin/SystemSettings';
import BackupManagement from './pages/admin/BackupManagement';
import RolePermissions from './pages/admin/RolePermissions';
import UserSettings from './pages/UserSettings';

// Patient Pages
import PatientRegistration from './pages/patients/PatientRegistration';
import PatientImageUpload from './pages/patients/PatientImageUpload';
import PatientImageSelector from './pages/patients/PatientImageSelector';
import PatientList from './pages/patients/PatientList';
import PatientDetail from './pages/patients/PatientDetail';
import PatientForm from './pages/patients/PatientForm';

// Prescription Pages
import CreatePrescription from './pages/prescriptions/CreatePrescription';
import PrescriptionList from './pages/prescriptions/PrescriptionList';
import PrescriptionDetail from './pages/prescriptions/PrescriptionDetail';
import EditPrescription from './pages/prescriptions/EditPrescription';

// Billing Pages
import CreateBilling from './pages/billing/CreateBilling';
import EditBilling from './pages/billing/EditBilling';
import ReceiptPrinting from './pages/billing/ReceiptPrinting';
import BillingList from './pages/billing/BillingList';
import BillingDetail from './pages/billing/BillingDetail';
import InvoiceGenerator from './pages/billing/InvoiceGenerator';

// Appointment Pages
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentDetail from './pages/appointments/AppointmentDetail';
import CreateAppointment from './pages/appointments/CreateAppointment';
import AppointmentCalendar from './pages/appointments/AppointmentCalendar';

// Analytics
import Analytics from './pages/admin/Analytics';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';

// Configure NProgress
NProgress.configure({ showSpinner: false });

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ('admin' | 'receptionist' | 'dermatologist')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Public Route Component (accessible only when not authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// App Routes
const AppRoutes: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Start NProgress on route change
  useEffect(() => {
    NProgress.start();
    NProgress.done();

    return () => {
      NProgress.remove();
    };
  }, []);

  return (
    <SkeletonTheme baseColor={isDarkMode ? '#374151' : '#e5e7eb'} highlightColor={isDarkMode ? '#4b5563' : '#f3f4f6'}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        {/* Removed public registration route - only admins can create users */}

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <UserForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <UserDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <UserForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/permissions"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <RolePermissions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist', 'receptionist']}>
              <Layout>
                {({ user }) => user?.role === 'admin' ? <SystemSettings /> : <UserSettings />}
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/backups"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <BackupManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <AnalyticsDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/basic"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
        <Route
          path="/patients/new"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <PatientRegistration />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:patientId/upload-image"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist']}>
              <Layout>
                <PatientImageUpload />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Prescription Routes */}
        <Route
          path="/prescriptions/new"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist']}>
              <Layout>
                <CreatePrescription />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Billing Routes */}
        <Route
          path="/billing/new"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <CreateBilling />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/:billingId/receipt"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <ReceiptPrinting />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipts"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <div>
                  <h1 className="text-2xl font-bold mb-4">Receipts</h1>
                  <p>Select a billing record to print its receipt.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist', 'dermatologist']}>
              <Layout>
                <PatientList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist', 'dermatologist']}>
              <Layout>
                <PatientDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <PatientForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id/edit-medical"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist']}>
              <Layout>
                <PatientForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Appointment Routes */}
        <Route
          path="/appointments"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist', 'dermatologist']}>
              <Layout>
                <AppointmentList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/calendar"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist', 'dermatologist']}>
              <Layout>
                <AppointmentCalendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <CreateAppointment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/:id"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist', 'dermatologist']}>
              <Layout>
                <AppointmentDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <CreateAppointment />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Prescription Routes */}
        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist', 'receptionist']}>
              <Layout>
                <PrescriptionList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/:id"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist', 'receptionist']}>
              <Layout>
                <PrescriptionDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist']}>
              <Layout>
                <EditPrescription />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/:id/print"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist', 'receptionist']}>
              <Layout>
                <PrescriptionDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Billing Routes */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <BillingList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/:id"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <BillingDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <EditBilling />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/:id/receipt"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <ReceiptPrinting />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/:id/invoice"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <InvoiceGenerator />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/new"
          element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Layout>
                <CreateBilling />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-images"
          element={
            <ProtectedRoute requiredRoles={['admin', 'dermatologist']}>
              <Layout>
                <PatientImageSelector />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <div>
                  <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
                  <p>System audit logs will be displayed here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SkeletonTheme>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
