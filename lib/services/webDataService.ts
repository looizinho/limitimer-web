import { DataService } from './types'
import { Timer, TimerUpdate } from '@/types/timer'
import { User } from '@/types/user'

export class WebDataService implements DataService {
  async registerOrLogin(username: string, pin: string): Promise<User & { isNewUser?: boolean }> {
    const response = await fetch('/api/auth/register-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed')
    }

    return {
      userId: data.userId,
      username: data.username,
      isNewUser: data.isNewUser
    }
  }

  async createTimer(params: {
    eventName?: string
    initialSeconds?: number
    userId?: string
  }): Promise<{ id: string; eventName: string; initialSeconds: number }> {
    const response = await fetch('/api/timers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create timer')
    }

    return data
  }

  async getTimer(id: string): Promise<Timer | null> {
    const response = await fetch(`/api/timers/${id}`)

    if (response.status === 404) {
      return null
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch timer')
    }

    return data
  }

  async updateTimer(id: string, update: TimerUpdate): Promise<Timer | null> {
    const response = await fetch(`/api/timers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    })

    if (response.status === 404) {
      return null
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update timer')
    }

    return data
  }

  async getUserTimers(userId: string): Promise<Timer[]> {
    const response = await fetch(`/api/users/${userId}/timers`)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user timers')
    }

    return data.timers
  }
}
