import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('blood_care_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user from token on reload
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('blood_care_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('blood_care_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Failed to restore session:', err.message);
        localStorage.removeItem('blood_care_token');
        localStorage.removeItem('blood_care_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('blood_care_token', receivedToken);
        localStorage.setItem('blood_care_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: response.data.message || 'Login failed.' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Network error during login.';
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('blood_care_token', receivedToken);
        localStorage.setItem('blood_care_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: response.data.message || 'Registration failed.' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('blood_care_token');
    localStorage.removeItem('blood_care_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('blood_care_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: Boolean(token && user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
