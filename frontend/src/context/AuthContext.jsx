import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bloodbridge_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bloodbridge_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('bloodbridge_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, signing out');
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('bloodbridge_token', receivedToken);
      localStorage.setItem('bloodbridge_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    }
    return { success: false, message: res.data.message };
  };

  const registerDonor = async (formData) => {
    const res = await api.post('/auth/register/donor', formData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('bloodbridge_token', receivedToken);
      localStorage.setItem('bloodbridge_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    }
    return { success: false, message: res.data.message };
  };

  const registerPatient = async (formData) => {
    const res = await api.post('/auth/register/patient', formData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('bloodbridge_token', receivedToken);
      localStorage.setItem('bloodbridge_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    }
    return { success: false, message: res.data.message };
  };

  const registerHospital = async (formDataObj) => {
    // Uses FormData for document upload
    const res = await api.post('/auth/register/hospital', formDataObj, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bloodbridge_token');
    localStorage.removeItem('bloodbridge_user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('bloodbridge_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  const getDashboardPath = (role) => {
    const r = role || user?.roleName;
    switch (r) {
      case 'ADMIN':
        return '/admin';
      case 'HOSPITAL':
        return '/hospital';
      case 'DONOR':
        return '/donor';
      case 'PATIENT':
        return '/patient';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      registerDonor,
      registerPatient,
      registerHospital,
      logout,
      refreshUser,
      getDashboardPath,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
