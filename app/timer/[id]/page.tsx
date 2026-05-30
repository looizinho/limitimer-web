'use client';

import { useState, useEffect } from 'react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cleanInterface, setCleanInterface] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCleanInterface(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      console.error('Erro ao alternar tela cheia');
    }
  };

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

  // Modo limpo - apenas contador com fundo transparente
  if (cleanInterface) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent text-white p-4">
        <button
          onClick={() => setCleanInterface(false)}
          className="absolute top-4 right-4 p-2 text-white hover:opacity-60 transition-opacity text-sm"
          title="Voltar à interface completa (ESC)"
        >
          ✕ Voltar
        </button>
        <div className="flex flex-col items-center gap-4">
          <TimerDisplay seconds={timer.currentSeconds} size="large" />
          <p className="text-2xl text-gray-300">
            {getStatusText()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 relative">
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white text-black hover:opacity-80 transition-opacity"
        title={isFullscreen ? 'Sair de Tela Cheia' : 'Tela Cheia'}
      >
        {isFullscreen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4m-4 0l5 5m11-5v4m0-4h-4m4 0l-5 5M4 20v-4m0 4h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        )}
      </button>
      <button
        onClick={() => setCleanInterface(true)}
        className="absolute top-4 left-4 p-2 rounded-lg bg-white text-black hover:opacity-80 transition-opacity text-xs font-semibold"
        title="Limpar interface - deixa apenas o contador"
      >
        Limpar
      </button>
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
