import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
