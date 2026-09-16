import { create } from 'zustand'
import type { PublicUser } from '@/lib/types'

interface AuthState {
  user: PublicUser | null
  accessToken: string | null
  refreshToken: string | null
  setSession: (user: PublicUser, accessToken: string, refreshToken: string) => void
  setUser: (user: PublicUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readJson('atrio.user'),
  accessToken: localStorage.getItem('atrio.access'),
  refreshToken: localStorage.getItem('atrio.refresh'),
  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem('atrio.user', JSON.stringify(user))
    localStorage.setItem('atrio.access', accessToken)
    localStorage.setItem('atrio.refresh', refreshToken)
    set({ user, accessToken, refreshToken })
  },
  setUser: (user) => {
    localStorage.setItem('atrio.user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('atrio.user')
    localStorage.removeItem('atrio.access')
    localStorage.removeItem('atrio.refresh')
    set({ user: null, accessToken: null, refreshToken: null })
  },
}))

function readJson(key: string): PublicUser | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PublicUser
  } catch {
    return null
  }
}
