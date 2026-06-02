'use client';

import { useEffect, useState } from 'react';
import { useTimerState } from '@/lib/useTimerState';
import TimerDisplay from '@/components/TimerDisplay';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';

export default function MobileTimer() {
  const params = useParams();
  const timerId = params.id as string;
  const { timer, loading, error, start, pause, stop, reset, setTime, markQrScanned } = useTimerState({
    timerId,
  });
  const [inputValue, setInputValue] = useState('');

  // Mark QR as scanned when mobile page loads
  useEffect(() => {
    if (timer && !timer.qrCodeScanned) {
      markQrScanned();
    }
  }, [timer?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error || !timer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">Erro ao carregar timer</p>
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 pb-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
          {timer.eventName}
        </h1>
        <h2 className="text-lg text-center mb-8 text-muted-foreground">
          Controle do Timer
        </h2>

        <div className="bg-muted rounded-lg p-6 mb-6">
          <p className="text-center text-muted-foreground mb-2">Tempo atual</p>
          <div className="flex justify-center mb-4">
            <TimerDisplay seconds={timer.currentSeconds} size="small" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
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
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              min="1"
            />
            <button
              onClick={handleSetTime}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-80 transition-colors"
            >
              Definir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => start()}
              disabled={timer.state === 'running'}
              className="px-4 py-3 bg-success text-success-foreground rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Iniciar
            </button>
            <button
              onClick={() => pause()}
              disabled={timer.state !== 'running'}
              className="px-4 py-3 bg-amber-500 text-white rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Pausar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => stop()}
              className="px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-80 transition-colors font-semibold"
            >
              Parar
            </button>
            <button
              onClick={() => reset()}
              className="px-4 py-3 bg-muted text-foreground rounded-lg hover:opacity-80 transition-colors font-semibold"
            >
              Resetar
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
