'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTimer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialSeconds: 60 }),
      });

      if (!response.ok) {
        throw new Error('Failed to create timer');
      }

      const data = await response.json() as { id: string };
      router.push(`/timer/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      <main className="flex flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-4">
            Limitimer
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Contador de tempo regressivo para eventos
          </p>
        </div>

        <button
          onClick={handleCreateTimer}
          disabled={loading}
          className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando...' : 'Criar Timer'}
        </button>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
