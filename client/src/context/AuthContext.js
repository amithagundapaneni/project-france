import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const API_URL = 'https://project-france.onrender.com';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('pf_token');
    setAuthHeader(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('pf_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setAuthHeader(storedToken);
    axios.get('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('pf_token', data.token);
    setAuthHeader(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post('/api/auth/register', formData);
    localStorage.setItem('pf_token', data.token);
    setAuthHeader(data.token);
    setUser(data.user);
    return data;
  };

  const updateUser = (updatedUserData) => setUser(updatedUserData);

  const refreshUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data);
      return data;
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};