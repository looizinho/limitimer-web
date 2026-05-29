'use client';

import { useState } from 'react';
import { useTimerState } from '@/lib/useTimerState';
import TimerDisplay from '@/components/TimerDisplay';
import QRCodeComponent from '@/components/QRCode';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';

export default function DesktopTimer() {
  const params = useParams();
  const timerId = params.id as string;
  const { timer, loading, error, reset, markQrScanned } = useTimerState({ timerId });
  const [showQR, setShowQR] = useState(false);

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

  const handleShowQR = () => {
    setShowQR(true);
    markQrScanned();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <div className="flex justify-between items-start w-full">
          <h1 className="text-3xl font-bold">{timer.eventName}</h1>
          {!timer.qrCodeScanned && !showQR && (
            <button
              onClick={handleShowQR}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-sm transition-colors"
            >
              Mostrar QR
            </button>
          )}
        </div>

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

        {showQR && (
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg">
            <QRCodeComponent timerId={timerId} />
            <button
              onClick={() => setShowQR(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Ocultar QR
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
