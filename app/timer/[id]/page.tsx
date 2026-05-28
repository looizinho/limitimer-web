'use client';

import { useTimerState } from '@/lib/useTimerState';
import TimerDisplay from '@/components/TimerDisplay';
import QRCodeComponent from '@/components/QRCode';
import { useParams } from 'next/navigation';

export default function DesktopTimer() {
  const params = useParams();
  const timerId = params.id as string;
  const { timer, loading, error, reset } = useTimerState({ timerId });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !timer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Erro ao carregar timer: {error}</p>
      </div>
    );
  }

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="flex flex-col items-center gap-8 w-full">
        <div>
          <TimerDisplay seconds={timer.currentSeconds} size="large" />
          <p className="text-center text-2xl mt-4 text-gray-400">
            {getStatusText()}
          </p>
        </div>

        {timer.state === 'finished' && (
          <div className="text-4xl font-bold text-green-500 text-center">
            ✓ Tempo finalizado!
          </div>
        )}

        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
        >
          Resetar
        </button>

        <div className="mt-8 p-6 bg-white rounded-lg">
          <QRCodeComponent timerId={timerId} />
        </div>
      </div>
    </div>
  );
}
