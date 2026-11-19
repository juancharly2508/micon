import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const cachedUser = JSON.parse(storedUser);
        setUser(cachedUser);
        try {
          const { data } = await api.get('/auth/me');
          let updatedUser = { ...cachedUser, ...data };
          if (data.condo_id) {
            const { data: condo } = await api.get('/condominiums/me');
            updatedUser = { ...updatedUser, condominium_name: condo.name, has_guards: Boolean(condo.has_guards), setup_completed: Boolean(condo.setup_completed) };
          }
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (error) {
          if (error.response?.status === 401) { await AsyncStorage.multiRemove(['token', 'user']); setUser(null); }
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (token, userData) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: profile } = await api.get('/auth/me');
    let nextUser = { ...user, ...profile };
    if (profile.condo_id) {
      const { data } = await api.get('/condominiums/me');
      nextUser = { ...nextUser, condominium_name: data.name, has_guards: Boolean(data.has_guards), setup_completed: Boolean(data.setup_completed), condo_id: data.id };
    }
    await AsyncStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  useEffect(() => {
    if (!user) return undefined;
    const timer = setInterval(() => refreshUser().catch(() => {}), 60000);
    return () => clearInterval(timer);
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
