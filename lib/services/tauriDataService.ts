import { DataService } from './types'
import { Timer, TimerUpdate } from '@/types/timer'
import { User } from '@/types/user'

export class TauriDataService implements DataService {
  private throwNotImplemented(method: string): never {
    throw new Error(
      `TauriDataService.${method}() not yet implemented — will be added in Phase 3`
    )
  }

  async registerOrLogin(_username: string, _pin: string): Promise<User & { isNewUser?: boolean }> {
    this.throwNotImplemented('registerOrLogin')
  }

  async createTimer(_params: {
    eventName?: string
    initialSeconds?: number
    userId?: string
  }): Promise<{ id: string; eventName: string; initialSeconds: number }> {
    this.throwNotImplemented('createTimer')
  }

  async getTimer(_id: string): Promise<Timer | null> {
    this.throwNotImplemented('getTimer')
  }

  async updateTimer(_id: string, _update: TimerUpdate): Promise<Timer | null> {
    this.throwNotImplemented('updateTimer')
  }

  async getUserTimers(_userId: string): Promise<Timer[]> {
    this.throwNotImplemented('getUserTimers')
  }
}
