'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/useAuthContext';
import Footer from './Footer';
import LoginPanel from './LoginPanel';

export default function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setExpired(true);
      const timeout = setTimeout(() => setExpired(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  const handleCreateTimer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventName || 'Sem nome',
          initialSeconds: 60,
          ...(userId && { userId }),
        }),
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateTimer();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      <LoginPanel />
      <main className="flex flex-col items-center justify-center gap-8 px-4 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-4">
            Limitimer Web
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 font-bold dark:text-zinc-400 mb-8" style={{ color: 'cyan' }}>
            TÉCNICA DE VÍDEO RS
          </p>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Contador de tempo regressivo para eventos
          </p>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Nome do Evento
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Reunião, Apresentação..."
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <button
          onClick={handleCreateTimer}
          disabled={loading}
          className="w-full px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando...' : 'Criar Timer'}
        </button>

        {expired && (
          <p className="text-amber-600 dark:text-amber-400 text-center">
            ⏱️ Timer expirou. Crie um novo para começar.
          </p>
        )}

        {error && (
          <p className="text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
