import React, { useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi, type LoginPayload, type SignupPayload } from '../lib/api/auth';
import { AuthContext } from './authContextDef';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

  useEffect(() => {
    // Check session on initial load via /api/auth/me
    const verifyAuth = async () => {
      try {
        setLoading(true);
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        // If not authenticated or backend is offline, leave user null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (credentials: LoginPayload): Promise<User> => {
    setError(null);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      const msg = err.message || 'Email or password is incorrect.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (payload: SignupPayload): Promise<User> => {
    setError(null);
    try {
      const response = await authApi.signup(payload);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      const msg = err.message || 'Unable to create account. Please check your details.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        intendedDestination,
        setIntendedDestination,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
