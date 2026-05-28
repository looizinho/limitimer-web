'use client';

import { useTimerState } from '@/lib/useTimerState';
import TimerDisplay from '@/components/TimerDisplay';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function MobileTimer() {
  const params = useParams();
  const timerId = params.id as string;
  const { timer, loading, error, start, pause, stop, reset, setTime } = useTimerState({
    timerId,
  });
  const [inputValue, setInputValue] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (error || !timer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <p className="text-red-600 dark:text-red-400">Erro ao carregar timer</p>
      </div>
    );
  }

  const handleSetTime = async () => {
    const seconds = parseInt(inputValue, 10);
    if (!isNaN(seconds) && seconds > 0) {
      await setTime(seconds);
      setInputValue('');
    }
  };

  const getStatusText = () => {
    switch (timer.state) {
      case 'running':
        return 'Rodando';
      case 'paused':
        return 'Pausado';
      case 'finished':
        return 'Finalizado';
      default:
        return 'Parado';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-black dark:text-white">
          Controle do Timer
        </h1>

        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 mb-6">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-2">Tempo atual</p>
          <div className="flex justify-center mb-4">
            <TimerDisplay seconds={timer.currentSeconds} size="small" />
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Status: {getStatusText()}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Segundos"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
              min="1"
            />
            <button
              onClick={handleSetTime}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Definir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => start()}
              disabled={timer.state === 'running'}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Iniciar
            </button>
            <button
              onClick={() => pause()}
              disabled={timer.state !== 'running'}
              className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Pausar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => stop()}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Parar
            </button>
            <button
              onClick={() => reset()}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Resetar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
