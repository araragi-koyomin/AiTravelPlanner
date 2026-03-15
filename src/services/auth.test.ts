/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange,
  checkAuthStatus,
  getAuthErrorMessage
} from '@/services/auth'
import { supabase } from '@/services/supabase'

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  },
  SupabaseErrorClass: class extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'SupabaseError'
    }
  },
  handleSupabaseError: vi.fn((error: unknown) => {
    if (error instanceof Error) {
      return error.message
    }
    return 'Unknown error'
  }),
  getCurrentSession: vi.fn()
}))

const createMockError = (message: string) => ({
  message,
  name: 'AuthError',
  code: 'auth_error' as const,
  status: 400
} as AuthError)

describe('认证服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('signIn', () => {
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
        token_type: 'bearer' as const,
        user: mockUser
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockUser } as {
          session: Session
          user: User
        },
        error: null
      })

      const result = await signIn({
        email: 'test@example.com',
        password: 'Test1234'
      })

      expect(result).toEqual(mockSession)
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test1234'
      })
    })

    it('应该处理登录错误', async () => {
      const mockError = createMockError('Invalid login credentials')

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null } as any,
        error: mockError
      })

      await expect(
        signIn({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      ).rejects.toThrow('Unknown error')
    })

    it('应该处理没有会话的情况', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null } as any,
        error: null
      })

      await expect(
        signIn({
          email: 'test@example.com',
          password: 'Test1234'
        })
      ).rejects.toThrow('登录失败，请检查邮箱和密码')
    })
  })

  describe('signUp', () => {
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
        token_type: 'bearer' as const,
        user: mockUser
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { session: mockSession, user: mockUser } as {
          session: Session
          user: User
        },
        error: null
      })

      const result = await signUp({
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Test User'
      })

      expect(result).toEqual(mockSession)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test1234',
        options: {
          data: {
            name: 'Test User'
          }
        }
      })
    })

    it('应该处理注册错误', async () => {
      const mockError = createMockError('User already registered')

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { session: null, user: null } as any,
        error: mockError
      })

      await expect(
        signUp({
          email: 'test@example.com',
          password: 'Test1234'
        })
      ).rejects.toThrow('Unknown error')
    })

    it('应该处理没有会话的情况（需要邮箱验证）', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { session: null, user: null } as any,
        error: null
      })

      await expect(
        signUp({
          email: 'test@example.com',
          password: 'Test1234'
        })
      ).rejects.toThrow('注册成功，请检查邮箱验证')
    })
  })

  describe('signOut', () => {
    it('应该成功登出', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      })

      await signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('应该处理登出错误', async () => {
      const mockError = createMockError('Sign out failed')

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError
      })

      await expect(signOut()).rejects.toThrow('Unknown error')
    })
  })

  describe('resetPassword', () => {
    it('应该成功发送重置密码邮件', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null
      })

      await resetPassword({ email: 'test@example.com' })

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
    })

    it('应该处理重置密码错误', async () => {
      const mockError = createMockError('Email not found')

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {} as any,
        error: mockError
      })

      await expect(
        resetPassword({ email: 'test@example.com' })
      ).rejects.toThrow('Unknown error')
    })
  })

  describe('updatePassword', () => {
    it('应该成功更新密码', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: {} as User },
        error: null
      })

      await updatePassword({ newPassword: 'NewPassword123' })

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123'
      })
    })

    it('应该处理更新密码错误', async () => {
      const mockError = createMockError('Password update failed')

      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      await expect(
        updatePassword({ newPassword: 'NewPassword123' })
      ).rejects.toThrow('Unknown error')
    })
  })

  describe('getCurrentUser', () => {
    it('应该成功获取当前用户', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z'
      }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })

    it('应该处理获取用户错误', async () => {
      const mockError = createMockError('User not found')

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      await expect(getCurrentUser()).rejects.toThrow('Unknown error')
    })
  })

  describe('getCurrentSession', () => {
    it('应该成功获取当前会话', async () => {
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
        token_type: 'bearer' as const,
        user: mockUser
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await getCurrentSession()

      expect(result).toEqual(mockSession)
      expect(supabase.auth.getSession).toHaveBeenCalled()
    })

    it('应该处理获取会话错误', async () => {
      const mockError = createMockError('Session not found')

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      await expect(getCurrentSession()).rejects.toThrow('Unknown error')
    })
  })

  describe('onAuthStateChange', () => {
    it('应该正确设置认证状态监听', () => {
      const mockSubscription = {
        id: 'test-subscription-id',
        callback: vi.fn(),
        unsubscribe: vi.fn()
      }

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription }
      })

      const callback = vi.fn()
      const unsubscribe = onAuthStateChange(callback)

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('checkAuthStatus', () => {
    it('应该返回 true 当用户已认证', async () => {
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
        token_type: 'bearer' as const,
        user: mockUser
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await checkAuthStatus()

      expect(result).toBe(true)
    })

    it('应该返回 false 当用户未认证', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await checkAuthStatus()

      expect(result).toBe(false)
    })

    it('应该处理检查错误并返回 false', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error('Check failed')
      )

      const result = await checkAuthStatus()

      expect(result).toBe(false)
    })
  })

  describe('getAuthErrorMessage', () => {
    it('应该返回用户友好的错误消息', () => {
      const error = new Error('Invalid login credentials')
      const message = getAuthErrorMessage(error)

      expect(message).toBe('邮箱或密码错误')
    })

    it('应该返回默认错误消息当错误未映射', () => {
      const error = new Error('Unknown error')
      const message = getAuthErrorMessage(error)

      expect(message).toBe('Unknown error')
    })

    it('应该处理 SupabaseErrorClass', () => {
      const error = {
        name: 'SupabaseError',
        message: 'Invalid login credentials'
      }
      const message = getAuthErrorMessage(error)

      expect(message).toBe('邮箱或密码错误')
    })

    it('应该处理没有 message 属性的错误', () => {
      const error = {}
      const message = getAuthErrorMessage(error)

      expect(message).toBe('操作失败，请稍后重试')
    })
  })
})
