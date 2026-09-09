import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ai-job-token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('ai-job-token');
        setToken('');
        delete api.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = (userData, authToken) => {
    localStorage.setItem('ai-job-token', authToken);
    setToken(authToken);
    setUser(userData);
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  };

  const logout = () => {
    localStorage.removeItem('ai-job-token');
    setToken('');
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
