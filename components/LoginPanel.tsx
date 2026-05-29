'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuthContext';

export default function LoginPanel() {
  const { isLoggedIn, username, login, logout, loading: authLoading } = useAuth();
  const [username_input, setUsernameInput] = useState('');
  const [pin_input, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameValid = /^[a-z]{3,20}$/.test(username_input) || username_input === '';
  const pinValid = /^\d{0,4}$/.test(pin_input) && (pin_input === '' || pin_input.length === 4);
  const canSubmit = usernameValid && pin_input.length === 4 && !loading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username_input, pin_input);
      setUsernameInput('');
      setPinInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (/^[a-z]*$/.test(value) && value.length <= 20) {
      setUsernameInput(value);
      setError(null);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPinInput(value);
      setError(null);
    }
  };

  if (authLoading) {
    return null;
  }

  if (isLoggedIn) {
    return (
      <div className="fixed top-4 right-4 flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg shadow-lg border border-zinc-300 dark:border-zinc-600">
        <span className="text-sm font-medium text-black dark:text-white">
          {username}
        </span>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleLogin}
      className="fixed top-4 right-4 bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-lg border border-zinc-300 dark:border-zinc-600"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Usuário
          </label>
          <input
            type="text"
            value={username_input}
            onChange={handleUsernameChange}
            placeholder="joao"
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            disabled={loading}
            title={!usernameValid && username_input ? "Use apenas letras minúsculas (3-20 caracteres)" : ""}
          />
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            PIN
          </label>
          <input
            type="text"
            value={pin_input}
            onChange={handlePinChange}
            placeholder="0000"
            maxLength={4}
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-center"
            disabled={loading}
            title={pin_input.length < 4 && pin_input ? `${pin_input.length}/4 dígitos` : ""}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="p-1.5 text-black dark:text-white hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          title={loading ? "Entrando..." : "Entrar"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          {error}
        </p>
      )}
    </form>
  );
}
