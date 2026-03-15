import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser, AuthSession } from '../services/supabase'
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentSession,
  onAuthStateChange,
  checkAuthStatus,
  getAuthErrorMessage,
  type SignInCredentials,
  type SignUpCredentials,
  type ResetPasswordCredentials,
  type UpdatePasswordCredentials
} from '../services/auth'

export interface AuthStore {
  user: AuthUser | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  rememberMe: boolean
  isInitializing: boolean

  setUser: (user: AuthUser | null) => void
  setSession: (session: AuthSession | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  login: (credentials: SignInCredentials) => Promise<void>
  register: (credentials: SignUpCredentials) => Promise<void>
  logout: () => Promise<void>
  resetUserPassword: (credentials: ResetPasswordCredentials) => Promise<void>
  updateUserPassword: (credentials: UpdatePasswordCredentials) => Promise<void>

  initializeAuth: () => (() => void) | undefined
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      isInitializing: true,

      setUser: (user) => {
        set({ user, isAuthenticated: user !== null })
      },

      setSession: (session) => {
        set({ session, isAuthenticated: session !== null })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const session = await signIn(credentials)
          const user = session.user
          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const session = await signUp(credentials)
          const user = session.user
          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        try {
          await signOut()
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      resetUserPassword: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          await resetPassword(credentials)
          set({
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      updateUserPassword: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          await updatePassword(credentials)
          set({
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = getAuthErrorMessage(error)
          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      initializeAuth: () => {
        const unsubscribe = onAuthStateChange((_event, session) => {
          const user = session?.user || null
          set({
            user,
            session,
            isAuthenticated: session !== null,
            isInitializing: false
          })
        })

        return unsubscribe
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const isAuthenticated = await checkAuthStatus()
          const session = await getCurrentSession()
          const user = session?.user || null
          set({
            user,
            session,
            isAuthenticated,
            isLoading: false
          })
        } catch (error) {
          console.error('检查认证状态失败:', error)
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rememberMe: state.rememberMe
      })
    }
  )
)
