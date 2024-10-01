import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    checkAuthStatus()
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/check-auth');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get('api/user');
      setUser(res.data.user);
    } catch (error) {
      console.error('Failed to refresh user data', error);
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};
