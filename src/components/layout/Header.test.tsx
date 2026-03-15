import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'
import * as authStore from '@/stores/authStore'

const mockUseAuthStore = vi.spyOn(authStore, 'useAuthStore')

const mockNavigate = vi.fn()

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, size }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    size?: string
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  )
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, className }: {
      children: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} data-to={to}>
        {children}
      </a>
    )
  }
})

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该显示登录和注册链接当用户未登录', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getByText('登录')).toBeInTheDocument()
    expect(screen.getByText('注册')).toBeInTheDocument()
    expect(screen.queryByText('行程')).not.toBeInTheDocument()
    expect(screen.queryByText('登出')).not.toBeInTheDocument()
  })

  it('应该显示用户信息和登出按钮当用户已登录', () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    }

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getByText('T')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('登出')).toBeInTheDocument()
    expect(screen.queryByText('登录')).not.toBeInTheDocument()
    expect(screen.queryByText('注册')).not.toBeInTheDocument()
  })

  it('应该显示行程链接当用户已登录', () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    }

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getByText('行程')).toBeInTheDocument()
  })

  it('应该使用邮箱前缀作为用户名当没有 user_metadata.name', () => {
    const mockUser = {
      id: 'test-id',
      email: 'testuser@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    }

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getByText('T')).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('应该调用 logout 并导航到登录页当点击登出按钮', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined)

    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    }

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    const logoutButton = screen.getByText('登出')
    await fireEvent.click(logoutButton)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('应该显示登出中状态当正在登出', () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined)

    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z'
    }

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
      user: mockUser,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    const logoutButton = screen.getByText('登出中...')
    expect(logoutButton).toBeInTheDocument()
    expect(logoutButton).toBeDisabled()
  })

  it('应该显示应用标题和导航链接', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getByText('AI Travel Planner')).toBeInTheDocument()
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('关于')).toBeInTheDocument()
  })
})
