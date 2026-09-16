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
  user: readJson('porti.user'),
  accessToken: localStorage.getItem('porti.access'),
  refreshToken: localStorage.getItem('porti.refresh'),
  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem('porti.user', JSON.stringify(user))
    localStorage.setItem('porti.access', accessToken)
    localStorage.setItem('porti.refresh', refreshToken)
    set({ user, accessToken, refreshToken })
  },
  setUser: (user) => {
    localStorage.setItem('porti.user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('porti.user')
    localStorage.removeItem('porti.access')
    localStorage.removeItem('porti.refresh')
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
