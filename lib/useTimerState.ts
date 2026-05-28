'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Timer } from '@/types/timer';

interface UseTimerStateOptions {
  timerId: string;
  pollInterval?: number;
}

export function useTimerState({ timerId, pollInterval = 1000 }: UseTimerStateOptions) {
  const [timer, setTimer] = useState<Timer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);

  const fetchTimer = useCallback(async () => {
    try {
      const response = await fetch(`/api/timers/${timerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timer');
      }
      const data = (await response.json()) as Timer;
      if (isMountedRef.current) {
        setTimer(data);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [timerId]);

  const pollTimer = useCallback(() => {
    fetchTimer();
    if (isMountedRef.current) {
      pollTimeoutRef.current = setTimeout(pollTimer, pollInterval);
    }
  }, [fetchTimer, pollInterval]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchTimer();
    pollTimeoutRef.current = setTimeout(pollTimer, pollInterval);

    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [fetchTimer, pollTimer, pollInterval]);

  const updateTimer = useCallback(
    async (action: string, seconds?: number) => {
      try {
        const response = await fetch(`/api/timers/${timerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, seconds }),
        });
        if (!response.ok) {
          throw new Error('Failed to update timer');
        }
        const data = (await response.json()) as Timer;
        if (isMountedRef.current) {
          setTimer(data);
        }
        return data;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
        return null;
      }
    },
    [timerId]
  );

  return {
    timer,
    loading,
    error,
    start: () => updateTimer('start'),
    pause: () => updateTimer('pause'),
    stop: () => updateTimer('stop'),
    reset: () => updateTimer('reset'),
    setTime: (seconds: number) => updateTimer('set-time', seconds),
  };
}
