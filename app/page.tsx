'use client';

import { Suspense } from 'react';
import { AuthProvider } from '@/lib/useAuthContext';
import HomeContent from '@/components/HomeContent';

export default function Home() {
  return (
    <AuthProvider>
      <Suspense>
        <HomeContent />
      </Suspense>
    </AuthProvider>
  );
}
