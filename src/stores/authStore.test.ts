import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { signIn, signUp, signOut, resetPassword, updatePassword, onAuthStateChange, checkAuthStatus } from '@/services/auth'

vi.mock('@/services/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  onAuthStateChange: vi.fn(() => vi.fn()),
  checkAuthStatus: vi.fn(),
  getAuthErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error) {
      return error.message
    }
    return 'Unknown error'
  })
}))

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const state = useAuthStore.getState()
    state.setUser(null)
    state.setSession(null)
    state.setLoading(false)
    state.setError(null)
    state.clearError()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useAuthStore.getState()

      expect(store.user).toBeNull()
      expect(store.session).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.rememberMe).toBe(false)
    })
  })

  describe('setUser', () => {
    it('应该设置用户信息', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z'
      }

      useAuthStore.getState().setUser(mockUser)

      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('应该清除用户信息', () => {
      useAuthStore.getState().setUser(null)

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('setSession', () => {
    it('应该设置会话信息', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z'
      }

      const mockSession = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      }

      useAuthStore.getState().setSession(mockSession)

      expect(useAuthStore.getState().session).toEqual(mockSession)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('应该清除会话信息', () => {
      useAuthStore.getState().setSession(null)

      expect(useAuthStore.getState().session).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('应该设置加载状态为 true', () => {
      useAuthStore.getState().setLoading(true)

      expect(useAuthStore.getState().isLoading).toBe(true)
    })

    it('应该设置加载状态为 false', () => {
      useAuthStore.getState().setLoading(false)

      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('应该设置错误信息', () => {
      const errorMessage = '登录失败'

      useAuthStore.getState().setError(errorMessage)

      expect(useAuthStore.getState().error).toBe(errorMessage)
    })

    it('应该清除错误信息', () => {
      useAuthStore.getState().setError(null)

      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('clearError', () => {
    it('应该清除错误信息', () => {
      useAuthStore.getState().setError('测试错误')
      useAuthStore.getState().clearError()

      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('login', () => {
    it('应该成功登录', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z'
      }

      const mockSession = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      }

      vi.mocked(signIn).mockResolvedValue(mockSession)

      await useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'Test1234'
      })

      expect(signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test1234'
      })

      const store = useAuthStore.getState()
      expect(store.user).toEqual(mockUser)
      expect(store.session).toEqual(mockSession)
      expect(store.isAuthenticated).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该处理登录错误', async () => {
      const mockError = new Error('Invalid login credentials')

      vi.mocked(signIn).mockRejectedValue(mockError)

      try {
        await useAuthStore.getState().login({
          email: 'test@example.com',
          password: 'wrong-password'
        })
        throw new Error('Expected login to throw an error')
      } catch (error) {
        if ((error as Error).message === 'Expected login to throw an error') {
          throw error
        }
        expect(error).toBeInstanceOf(Error)
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
      expect(store.error).not.toBeNull()
    })
  })

  describe('register', () => {
    it('应该成功注册', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z'
      }

      const mockSession = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      }

      vi.mocked(signUp).mockResolvedValue(mockSession)

      await useAuthStore.getState().register({
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Test User'
      })

      expect(signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Test User'
      })

      const store = useAuthStore.getState()
      expect(store.user).toEqual(mockUser)
      expect(store.session).toEqual(mockSession)
      expect(store.isAuthenticated).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该处理注册错误', async () => {
      const mockError = new Error('User already registered')

      vi.mocked(signUp).mockRejectedValue(mockError)

      try {
        await useAuthStore.getState().register({
          email: 'test@example.com',
          password: 'Test1234'
        })
        throw new Error('Expected register to throw an error')
      } catch (error) {
        if ((error as Error).message === 'Expected register to throw an error') {
          throw error
        }
        expect(error).toBeInstanceOf(Error)
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
      expect(store.error).not.toBeNull()
    })
  })

  describe('logout', () => {
    it('应该成功登出', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined)

      await useAuthStore.getState().logout()

      expect(signOut).toHaveBeenCalled()

      const store = useAuthStore.getState()
      expect(store.user).toBeNull()
      expect(store.session).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该处理登出错误', async () => {
      const mockError = new Error('Sign out failed')

      vi.mocked(signOut).mockRejectedValue(mockError)

      try {
        await useAuthStore.getState().logout()
        throw new Error('Expected logout to throw an error')
      } catch (error) {
        if ((error as Error).message === 'Expected logout to throw an error') {
          throw error
        }
        expect(error).toBeInstanceOf(Error)
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
      expect(store.error).not.toBeNull()
    })
  })

  describe('resetUserPassword', () => {
    it('应该成功重置密码', async () => {
      vi.mocked(resetPassword).mockResolvedValue(undefined)

      await useAuthStore.getState().resetUserPassword({
        email: 'test@example.com'
      })

      expect(resetPassword).toHaveBeenCalledWith({
        email: 'test@example.com'
      })

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该处理重置密码错误', async () => {
      const mockError = new Error('Email not found')

      vi.mocked(resetPassword).mockRejectedValue(mockError)

      try {
        await useAuthStore.getState().resetUserPassword({
          email: 'test@example.com'
        })
        throw new Error('Expected resetUserPassword to throw an error')
      } catch (error) {
        if ((error as Error).message === 'Expected resetUserPassword to throw an error') {
          throw error
        }
        expect(error).toBeInstanceOf(Error)
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
      expect(store.error).not.toBeNull()
    })
  })

  describe('updateUserPassword', () => {
    it('应该成功更新密码', async () => {
      vi.mocked(updatePassword).mockResolvedValue(undefined)

      await useAuthStore.getState().updateUserPassword({
        newPassword: 'NewPassword123'
      })

      expect(updatePassword).toHaveBeenCalledWith({
        newPassword: 'NewPassword123'
      })

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该处理更新密码错误', async () => {
      const mockError = new Error('Password update failed')

      vi.mocked(updatePassword).mockRejectedValue(mockError)

      try {
        await useAuthStore.getState().updateUserPassword({
          newPassword: 'NewPassword123'
        })
        throw new Error('Expected updateUserPassword to throw an error')
      } catch (error) {
        if ((error as Error).message === 'Expected updateUserPassword to throw an error') {
          throw error
        }
        expect(error).toBeInstanceOf(Error)
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
      expect(store.error).not.toBeNull()
    })
  })

  describe('initializeAuth', () => {
    it('应该初始化认证状态监听', () => {
      const mockUnsubscribe = vi.fn()
      vi.mocked(onAuthStateChange).mockReturnValue(mockUnsubscribe)

      const unsubscribe = useAuthStore.getState().initializeAuth()

      expect(onAuthStateChange).toHaveBeenCalled()
      expect(unsubscribe).toBe(mockUnsubscribe)
    })
  })

  describe('checkAuth', () => {
    it('应该成功检查认证状态', async () => {
      vi.mocked(checkAuthStatus).mockResolvedValue(true)

      await useAuthStore.getState().checkAuth()

      expect(checkAuthStatus).toHaveBeenCalled()

      const store = useAuthStore.getState()
      expect(store.isLoading).toBe(false)
    })

    it('应该处理检查错误', async () => {
      vi.mocked(checkAuthStatus).mockRejectedValue(
        new Error('Check failed')
      )

      await useAuthStore.getState().checkAuth()

      const store = useAuthStore.getState()
      expect(store.user).toBeNull()
      expect(store.session).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
    })
  })
})
