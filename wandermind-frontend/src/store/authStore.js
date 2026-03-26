import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        localStorage.setItem('wandermind-tokens', JSON.stringify(tokens))
        set({ user, tokens, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('wandermind-tokens')
        set({ user: null, tokens: null, isAuthenticated: false })
      },

      updateUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),
    }),
    { name: 'wandermind-auth' }
  )
)
