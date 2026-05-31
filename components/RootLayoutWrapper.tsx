'use client';

import { AuthProvider } from '@/lib/useAuthContext';
import { ReactNode } from 'react';

export function RootLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
