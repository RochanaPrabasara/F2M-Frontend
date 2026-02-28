import { createContext } from 'react';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'farmer' | 'buyer';
  district: string;
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => void;

  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);