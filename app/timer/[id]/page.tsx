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
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !timer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
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
      <div className="flex items-center justify-center min-h-screen bg-transparent text-foreground p-4">
        <button
          onClick={() => setCleanInterface(false)}
          className="absolute top-4 right-4 p-2 text-foreground hover:opacity-60 transition-opacity text-sm"
          title="Voltar à interface completa (ESC)"
          aria-label="Voltar à interface completa"
        >
          ✕ Voltar
        </button>
        <div className="flex flex-col items-center gap-4">
          <TimerDisplay seconds={timer.currentSeconds} size="large" />
          <p className="text-2xl text-muted-foreground">
            {getStatusText()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 pb-24 relative">
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-80 transition-opacity"
        title={isFullscreen ? 'Sair de Tela Cheia' : 'Tela Cheia'}
        aria-label={isFullscreen ? 'Sair de Tela Cheia' : 'Tela Cheia'}
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
        className="absolute top-4 left-4 p-2 rounded-lg bg-muted text-foreground hover:opacity-80 transition-opacity text-xs font-semibold"
        title="Limpar interface - deixa apenas o contador"
        aria-label="Modo limpo"
      >
        Limpar
      </button>
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <div className="flex justify-between items-start w-full">
          <h1 className="text-3xl font-bold text-foreground">{timer.eventName}</h1>
          {!timer.qrCodeScanned && !showQR && (
            <button
              onClick={handleShowQR}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold text-sm transition-colors hover:opacity-80"
            >
              Mostrar QR
            </button>
          )}
        </div>

        <div>
          <TimerDisplay seconds={timer.currentSeconds} size="large" />
          <p className="text-center text-2xl mt-4 text-muted-foreground">
            {getStatusText()}
          </p>
        </div>

        {timer.state === 'finished' && (
          <div className="text-4xl font-bold text-success text-center">
            ✓ Tempo finalizado!
          </div>
        )}

        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-muted text-foreground hover:opacity-80 rounded-lg font-semibold transition-colors"
        >
          Resetar
        </button>

        {showQR && (
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg">
            <QRCodeComponent timerId={timerId} />
            <button
              onClick={() => setShowQR(false)}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded transition-colors"
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
