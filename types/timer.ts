export type TimerState = 'paused' | 'running' | 'finished';

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

export interface WebSocketMessage {
  timerId: string;
  action?: string;
  state?: Timer;
  timestamp: number;
}
