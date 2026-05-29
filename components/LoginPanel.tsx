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
      className="fixed top-4 right-4 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg border border-zinc-300 dark:border-zinc-600 w-80"
    >
      <h3 className="text-sm font-semibold text-black dark:text-white mb-3">
        Login
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Usuário
          </label>
          <input
            type="text"
            value={username_input}
            onChange={handleUsernameChange}
            placeholder="Ex: joao"
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            disabled={loading}
          />
          {!usernameValid && username_input && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Use apenas letras minúsculas (3-20 caracteres)
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            PIN
          </label>
          <input
            type="text"
            value={pin_input}
            onChange={handlePinChange}
            placeholder="0000"
            maxLength={4}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-center"
            disabled={loading}
          />
          {pin_input.length < 4 && pin_input && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {pin_input.length}/4 dígitos
            </p>
          )}
          {pin_input.length === 4 && !pinValid && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              PIN deve conter apenas números
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full px-3 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </form>
  );
}
