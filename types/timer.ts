export type TimerState = 'paused' | 'running' | 'finished';

export interface TimerRecord {
  _id?: string;
  id: string;
  eventName: string;
  initialSeconds: number;
  secondsWhenPaused: number;
  startedAt: number | null;
  state: TimerState;
  qrCodeScanned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Timer {
  id: string;
  eventName: string;
  initialSeconds: number;
  currentSeconds: number;
  state: TimerState;
  qrCodeScanned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TimerUpdate {
  action: 'start' | 'pause' | 'stop' | 'reset' | 'set-time' | 'mark-qr-scanned';
  seconds?: number;
}
