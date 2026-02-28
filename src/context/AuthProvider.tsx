import { useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import authService from '../services/auth.service';
import { AuthContext } from './AuthContext';
import type { AuthContextType, User, LoginData, AuthResponse } from './AuthContext';
import { connectSocket } from '../services/socket.service'; // ← import here

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [loading, setLoading] = useState(false);

  // NEW: Auto-connect socket if user is already logged in (page refresh)
  useEffect(() => {
    if (user?.id) {
      connectSocket();
    }
  }, [user?.id]); // Runs when user changes

  const refreshUser = () => {
    setUser(authService.getCurrentUser());
    setToken(authService.getToken());
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await authService.login(data); // this already stores token+user in localStorage

      // IMPORTANT: update React state immediately (fixes "wrong user until refresh")
      setUser(res.user ?? null);
      setToken(res.token ?? null);

      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}