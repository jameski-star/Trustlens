import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('trustlens-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('trustlens-token'));

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('trustlens-token', data.token);
    localStorage.setItem('trustlens-refresh', data.refreshToken);
    localStorage.setItem('trustlens-user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiRegister(name, email, password);
    localStorage.setItem('trustlens-token', data.token);
    localStorage.setItem('trustlens-refresh', data.refreshToken);
    localStorage.setItem('trustlens-user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('trustlens-token');
    localStorage.removeItem('trustlens-refresh');
    localStorage.removeItem('trustlens-user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return { user, isAuthenticated, login, register, logout };
}
