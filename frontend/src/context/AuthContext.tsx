import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
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
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('trustlens-token');
    localStorage.removeItem('trustlens-refresh');
    localStorage.removeItem('trustlens-user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
