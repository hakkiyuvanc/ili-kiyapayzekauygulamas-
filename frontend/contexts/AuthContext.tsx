'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  username?: string;
  is_pro: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  upgradeToPro: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    
    // Verify token with backend
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ username: email, password });
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      
      // Get user profile
      const profileResponse = await authApi.getProfile();
      const userData = profileResponse.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      await authApi.register({ email, password, full_name: fullName });
      // Auto login after register
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const upgradeToPro = () => {
    if (user) {
      const updatedUser = { ...user, is_pro: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isPro: user?.is_pro ?? false,
        login,
        register,
        logout,
        upgradeToPro,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
