"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/lib/config';
import { deleteCookie } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch user profile if we might have a cookie
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include', // Include httpOnly cookie
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Token is now in httpOnly cookie, not accessible via JS
        setToken('cookie'); // Placeholder to indicate authenticated state
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    await fetchUserProfile();
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear httpOnly cookie
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    deleteCookie('auth_token'); // Clean up any legacy cookies
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
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
