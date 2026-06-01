import { Timer, TimerUpdate } from '@/types/timer'
import { User } from '@/types/user'

export interface DataService {
  registerOrLogin(username: string, pin: string): Promise<User & { isNewUser?: boolean }>
  createTimer(params: {
    eventName?: string
    initialSeconds?: number
    userId?: string
  }): Promise<{ id: string; eventName: string; initialSeconds: number }>
  getTimer(id: string): Promise<Timer | null>
  updateTimer(id: string, update: TimerUpdate): Promise<Timer | null>
  getUserTimers(userId: string): Promise<Timer[]>
}
