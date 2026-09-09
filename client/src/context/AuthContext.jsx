import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse stored user', e);
          }
        }
        setToken(storedToken);

        // Validate token with backend and refresh user data
        try {
          const res = await authAPI.getProfile();
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (name, email, password, studentId) => {
    try {
      const response = await authAPI.register({ name, email, password, studentId });
      const { data, token: newToken } = response.data;
      
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', newToken);
      setUser(data);
      setToken(newToken);
      return data;
    } catch (error) {
      if (
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Network Error') ||
        !error.response
      ) {
        throw 'Unable to connect to the server. Please try again in a moment.';
      }
      throw error.response?.data?.message || error.message;
    }
  };

  const login = async (email, password, role = null) => {
    try {
      const payload = { email, password };
      if (role) payload.role = role;
      const response = await authAPI.login(payload);
      const { data, token: newToken } = response.data;
      
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', newToken);
      setUser(data);
      setToken(newToken);
      return data;
    } catch (error) {
      if (
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Network Error') ||
        !error.response
      ) {
        throw 'Unable to connect to the server. Please try again in a moment.';
      }
      throw error.response?.data?.message || error.message;
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin',
    register,
    login,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
