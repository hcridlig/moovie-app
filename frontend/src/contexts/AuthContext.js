// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setUsername(user);
    }
    setLoading(false);
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', user);
    setIsAuthenticated(true);
    setUsername(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUsername('');
  };

  // Nouvelle fonction pour mettre à jour le nom d'utilisateur
  const updateUser = (newUsername) => {
    localStorage.setItem('user', newUsername);
    setUsername(newUsername);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
