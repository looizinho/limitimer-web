'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Timer } from '@/types/timer';

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const { userId, username, isLoggedIn, logout } = useAuth();
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
        const response = await fetch(`/api/users/${paramUserId}/timers`);
        if (!response.ok) throw new Error('Failed to fetch timers');
        const data = (await response.json()) as { timers: Timer[] };
        setTimers(data.timers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (paramUserId) {
      fetchTimers();
    }
  }, [paramUserId]);

  if (!isLoggedIn || userId !== paramUserId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-black dark:text-white hover:opacity-70 transition-opacity">
              Limitimer
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {username}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Meus Contadores
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {timers.length} contador{timers.length !== 1 ? 'es' : ''} criado{timers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Carregando...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && timers.length === 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Você ainda não criou nenhum contador
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
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
                className="block p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:shadow-lg dark:hover:shadow-zinc-900 transition-shadow"
              >
                <h2 className="text-lg font-semibold text-black dark:text-white mb-2 truncate">
                  {timer.eventName}
                </h2>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-black dark:text-white">
                    {Math.floor(timer.currentSeconds / 60)}:{String(timer.currentSeconds % 60).padStart(2, '0')}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Total: {Math.floor(timer.initialSeconds / 60)}:{String(timer.initialSeconds % 60).padStart(2, '0')}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    timer.state === 'running'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : timer.state === 'finished'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {timer.state === 'running' ? 'Em progresso' : timer.state === 'finished' ? 'Finalizado' : 'Pausado'}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-500 text-xs">
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
