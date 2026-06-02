'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/useAuthContext';
import { useDataService } from '@/lib/services';
import Footer from './Footer';
import LoginPanel from './LoginPanel';

export default function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const dataService = useDataService();
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
      const data = await dataService.createTimer({
        eventName: eventName || 'Sem nome',
        initialSeconds: 60,
        ...(userId && { userId }),
      });
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-muted/50 to-background">
      <LoginPanel />
      <main className="flex flex-col items-center justify-center gap-8 px-4 max-w-md w-full pb-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Limitimer Web
          </h1>
          <p className="text-lg sm:text-xl font-bold text-accent mb-8">
            TÉCNICA DE VÍDEO RS
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-pretty">
            Contador de tempo regressivo para eventos
          </p>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Nome do Evento
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Reunião, Apresentação..."
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={handleCreateTimer}
          disabled={loading}
          className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
