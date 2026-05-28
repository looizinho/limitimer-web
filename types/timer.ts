export type TimerState = 'paused' | 'running' | 'finished';

export interface TimerRecord {
  id: string;
  initialSeconds: number;
  secondsWhenPaused: number;
  startedAt: number | null;
  state: TimerState;
  createdAt: number;
  updatedAt: number;
}

export interface Timer {
  id: string;
  initialSeconds: number;
  currentSeconds: number;
  state: TimerState;
  createdAt: number;
  updatedAt: number;
}

export interface TimerUpdate {
  action: 'start' | 'pause' | 'stop' | 'reset' | 'set-time';
  seconds?: number;
}
