'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('limitimer_userId');
    const storedUsername = localStorage.getItem('limitimer_username');

    if (storedUserId && storedUsername) {
      setUserId(storedUserId);
      setUsername(storedUsername);
    }

    setLoading(false);
  }, []);

  const login = async (username: string, pin: string) => {
    const response = await fetch('/api/auth/register-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }

    const data = (await response.json()) as { userId: string; username: string };
    setUserId(data.userId);
    setUsername(data.username);
    localStorage.setItem('limitimer_userId', data.userId);
    localStorage.setItem('limitimer_username', data.username);
  };

  const logout = () => {
    setUserId(null);
    setUsername(null);
    localStorage.removeItem('limitimer_userId');
    localStorage.removeItem('limitimer_username');
  };

  const value: AuthContextType = {
    userId,
    username,
    isLoggedIn: !!userId,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
