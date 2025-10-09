// Authentication state management using Zustand
// Stores: user data, authentication token, login/logout functions
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

// Create auth store with persistence (saves to localStorage)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Login function - saves user and token
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      
      // Logout function - clears all auth data
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
)
