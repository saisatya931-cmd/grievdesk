import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { StudentLayout } from './components/StudentLayout';
import { ToastContainer } from './components/Toast';
import { AdminNotificationPopup } from './components/AdminNotificationPopup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BackgroundPattern } from './components/BackgroundPattern';

// Real Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaintsPage } from './pages/AdminComplaintsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { NewComplaintPage } from './pages/NewComplaintPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIAssistantPage } from './pages/AIAssistantPage';

import { useAuth } from './context/AuthContext';

// Redirect authenticated users directly to their respective dashboard
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
        replace
      />
    );
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const isStudentPortal = location.pathname.startsWith('/student');

  return (
    <div className="relative flex flex-col min-h-screen bg-[#F7F5F0] dark:bg-[#0B0F15] text-[#1F2937] dark:text-[#F8FAFC]">
      {/* Global Ambient GrievDesk Background Pattern & Depth */}
      <BackgroundPattern isGlobal />

      <div className="relative z-10 flex flex-col min-h-screen">
        {!isStudentPortal && <Navbar />}
        <main className="flex-grow">
          <Routes>
            {/* Public Only Routes (hidden after login) */}
            <Route
              path="/"
              element={
                <PublicOnlyRoute>
                  <LandingPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* Common Protected Profile Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Routes (Wrapped in dedicated StudentLayout matching reference_ui.png) */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout>
                    <StudentDashboard />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout>
                    <ComplaintsPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints/new"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout>
                    <NewComplaintPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout>
                    <ProfilePage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/ai"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout>
                    <AIAssistantPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/ai-assistant"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout>
                    <AIAssistantPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <AIAssistantPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Direct Authentication Entry Point (/admin only) */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<Navigate to="/admin" replace />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard initialTab="students" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppContent />
            <ToastContainer />
            <AdminNotificationPopup />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
