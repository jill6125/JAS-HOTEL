import { createContext } from 'react';
import type { User } from '../types';
import type { LoginPayload, SignupPayload } from '../lib/api/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => Promise<void>;
  intendedDestination: string | null;
  setIntendedDestination: (path: string | null) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
