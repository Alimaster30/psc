import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SkeletonTheme } from 'react-loading-skeleton';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './styles/mobile.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Layouts
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

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
import AuditLogs from './pages/admin/AuditLogs';
import UserSettings from './pages/UserSettings';

// Patient Pages
import PatientRegistration from './pages/patients/PatientRegistration';
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
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    console.log(`Access denied: User role '${user.role}' not in required roles:`, requiredRoles);

    // Show access denied page instead of redirecting to homepage
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Access Denied
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                You don't have permission to access this page.
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Required roles: {requiredRoles.join(', ')} | Your role: {user.role}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
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
    return <LoadingScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Routes
const AppRoutes: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Start NProgress on route change
  useEffect(() => {
    NProgress.start();
    NProgress.done();

    return () => {
      NProgress.remove();
    };
  }, []);

  // Handle intended path restoration after authentication
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const intendedPath = sessionStorage.getItem('intendedPath');
      if (intendedPath && intendedPath !== window.location.pathname) {
        console.log('Restoring intended path:', intendedPath);
        sessionStorage.removeItem('intendedPath');

        // Use setTimeout to ensure React Router is ready
        setTimeout(() => {
          window.history.replaceState({}, '', intendedPath);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 100);
      }
    }
  }, [isAuthenticated, isLoading]);

  // Remove automatic logout redirect - let ProtectedRoute handle authentication
  // This prevents conflicts during login/logout state changes

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
          path="/audit-logs"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <AuditLogs />
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
