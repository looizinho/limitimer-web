'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuthContext';
import { useDataService } from '@/lib/services';
import { useParams, useRouter } from 'next/navigation';
import { Timer } from '@/types/timer';

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const { userId, username, isLoggedIn, logout } = useAuth();
  const dataService = useDataService();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramUserId = typeof params?.userId === 'string' ? params.userId : '';

  useEffect(() => {
    // Redirect if not logged in or trying to access another user's profile
    if (!isLoggedIn || userId !== paramUserId) {
      router.push('/');
    }
  }, [isLoggedIn, userId, paramUserId, router]);

  useEffect(() => {
    const fetchTimers = async () => {
      try {
        setLoading(true);
        const userTimers = await dataService.getUserTimers(paramUserId);
        setTimers(userTimers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (paramUserId) {
      fetchTimers();
    }
  }, [paramUserId, dataService]);

  if (!isLoggedIn || userId !== paramUserId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b border-border shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-foreground hover:opacity-70 transition-opacity">
              Limitimer Web
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {username}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-destructive hover:opacity-80 text-destructive-foreground text-sm rounded transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Meus Contadores
          </h1>
          <p className="text-muted-foreground">
            {timers.length} contador{timers.length !== 1 ? 'es' : ''} criado{timers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && timers.length === 0 && (
          <div className="bg-muted border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não criou nenhum contador
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Criar Novo Contador
            </Link>
          </div>
        )}

        {!loading && timers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timers.map(timer => (
              <Link
                key={timer.id}
                href={`/timer/${timer.id}`}
                className="block p-6 bg-background border border-border rounded-lg hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg font-semibold text-foreground mb-2 truncate">
                  {timer.eventName}
                </h2>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-foreground font-mono tabular-nums">
                    {Math.floor(timer.currentSeconds / 60)}:{String(timer.currentSeconds % 60).padStart(2, '0')}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {Math.floor(timer.initialSeconds / 60)}:{String(timer.initialSeconds % 60).padStart(2, '0')}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    timer.state === 'running'
                      ? 'bg-success/20 text-success'
                      : timer.state === 'finished'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {timer.state === 'running' ? 'Em progresso' : timer.state === 'finished' ? 'Finalizado' : 'Pausado'}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(timer.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
