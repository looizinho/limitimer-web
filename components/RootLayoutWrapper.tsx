'use client';

import { AuthProvider } from '@/lib/useAuthContext';
import { DataServiceProvider } from '@/lib/services';
import { ReactNode } from 'react';

export function RootLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <DataServiceProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DataServiceProvider>
  );
}
