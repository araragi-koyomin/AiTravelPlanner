import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Settings } from './Settings'
import * as authStore from '@/stores/authStore'
import * as useSettingsHook from '@/hooks/useSettings'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/hooks/useSettings', () => ({
  useSettings: vi.fn()
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { name: '测试用户' }
}

const mockSettings = {
  id: 'settings-id',
  user_id: 'test-user-id',
  zhipu_api_key: 'encrypted-zhipu-key',
  xunfei_api_key: null,
  xunfei_app_id: null,
  xunfei_api_secret: null,
  amap_api_key: 'encrypted-amap-key',
  amap_security_js_code: null,
  theme: 'light' as const,
  language: 'zh' as const,
  notifications: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockUpdateApiKey = vi.fn()
const mockUpdateXunfeiCredentials = vi.fn()
const mockUpdateAmapCredentials = vi.fn()
const mockDeleteApiKey = vi.fn()
const mockGetDecryptedApiKey = vi.fn()
const mockGetDecryptedXunfeiCredentials = vi.fn()
const mockGetDecryptedAmapCredentials = vi.fn()
const mockUpdateTheme = vi.fn()
const mockUpdateLanguage = vi.fn()
const mockUpdateNotifications = vi.fn()
const mockClearError = vi.fn()

const defaultUseSettingsReturn = {
  settings: mockSettings,
  isLoading: false,
  error: null,
  updateApiKey: mockUpdateApiKey,
  updateXunfeiCredentials: mockUpdateXunfeiCredentials,
  updateAmapCredentials: mockUpdateAmapCredentials,
  deleteApiKey: mockDeleteApiKey,
  getDecryptedApiKey: mockGetDecryptedApiKey,
  getDecryptedXunfeiCredentials: mockGetDecryptedXunfeiCredentials,
  getDecryptedAmapCredentials: mockGetDecryptedAmapCredentials,
  updateTheme: mockUpdateTheme,
  updateLanguage: mockUpdateLanguage,
  updateNotifications: mockUpdateNotifications,
  refreshSettings: vi.fn(),
  clearError: mockClearError
}

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isInitializing: false
    } as unknown as ReturnType<typeof authStore.useAuthStore>)
    
    vi.mocked(useSettingsHook.useSettings).mockReturnValue(defaultUseSettingsReturn)
    
    mockUpdateApiKey.mockResolvedValue(undefined)
    mockDeleteApiKey.mockResolvedValue(undefined)
    mockGetDecryptedApiKey.mockResolvedValue('decrypted-key')
    mockUpdateTheme.mockResolvedValue(undefined)
    mockUpdateLanguage.mockResolvedValue(undefined)
    mockUpdateNotifications.mockResolvedValue(undefined)
  })

  describe('route guard', () => {
    it('should redirect to login page when not authenticated', async () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isInitializing: false
      } as unknown as ReturnType<typeof authStore.useAuthStore>)

      renderWithRouter(<Settings />)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('should display page when authenticated', async () => {
      renderWithRouter(<Settings />)

      await waitFor(() => {
        expect(screen.getByText('设置')).toBeInTheDocument()
      })
    })

    it('should show loading state when initializing', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isInitializing: true
      } as unknown as ReturnType<typeof authStore.useAuthStore>)

      renderWithRouter(<Settings />)

      expect(screen.getByText('加载设置...')).toBeInTheDocument()
    })
  })

  describe('page rendering', () => {
    it('should display page title', async () => {
      renderWithRouter(<Settings />)

      expect(screen.getByText('设置')).toBeInTheDocument()
      expect(screen.getByText('管理您的账户设置和偏好')).toBeInTheDocument()
    })

    it('should render all settings sections', async () => {
      renderWithRouter(<Settings />)

      expect(screen.getByText('API Key 管理')).toBeInTheDocument()
      expect(screen.getByText('外观设置')).toBeInTheDocument()
      expect(screen.getByText('语言设置')).toBeInTheDocument()
      expect(screen.getByText('通知设置')).toBeInTheDocument()
      expect(screen.getByText('账户设置')).toBeInTheDocument()
    })

    it('should show loading state when settings are loading', () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        ...defaultUseSettingsReturn,
        isLoading: true,
        settings: null
      })

      renderWithRouter(<Settings />)

      expect(screen.getByText('加载设置...')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should display error message', async () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        ...defaultUseSettingsReturn,
        error: 'Network error'
      })

      renderWithRouter(<Settings />)

      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('should clear error when clicking close button', async () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        ...defaultUseSettingsReturn,
        error: 'Network error'
      })

      renderWithRouter(<Settings />)

      fireEvent.click(screen.getByText('关闭'))

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('component integration', () => {
    it('should pass correct props to ApiKeySection', async () => {
      renderWithRouter(<Settings />)

      expect(screen.getByText('API Key 管理')).toBeInTheDocument()
    })

    it('should pass correct props to ThemeSection', async () => {
      renderWithRouter(<Settings />)

      const lightButton = screen.getByRole('button', { name: '浅色' })
      expect(lightButton).toHaveClass('bg-primary-600')
    })

    it('should pass correct props to LanguageSection', async () => {
      renderWithRouter(<Settings />)

      const zhButton = screen.getByRole('button', { name: '中文' })
      expect(zhButton).toHaveClass('bg-primary-600')
    })

    it('should pass correct props to NotificationSection', async () => {
      renderWithRouter(<Settings />)

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('should pass correct props to AccountSection', async () => {
      renderWithRouter(<Settings />)

      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  describe('event handling', () => {
    it('should handle API Key update', async () => {
      renderWithRouter(<Settings />)

      const editButtons = screen.getAllByRole('button', { name: '编辑' })
      fireEvent.click(editButtons[0])

      const input = screen.getByPlaceholderText('请输入智谱AI API Key')
      fireEvent.change(input, { target: { value: 'new-key' } })

      fireEvent.click(screen.getByRole('button', { name: '保存' }))

      await waitFor(() => {
        expect(mockUpdateApiKey).toHaveBeenCalledWith('zhipu', 'new-key')
      })
    })

    it('should handle theme change', async () => {
      renderWithRouter(<Settings />)

      fireEvent.click(screen.getByRole('button', { name: '深色' }))

      await waitFor(() => {
        expect(mockUpdateTheme).toHaveBeenCalledWith('dark')
      })
    })

    it('should handle language change', async () => {
      renderWithRouter(<Settings />)

      fireEvent.click(screen.getByRole('button', { name: 'English' }))

      await waitFor(() => {
        expect(mockUpdateLanguage).toHaveBeenCalledWith('en')
      })
    })

    it('should handle notifications toggle', async () => {
      renderWithRouter(<Settings />)

      fireEvent.click(screen.getByRole('switch'))

      await waitFor(() => {
        expect(mockUpdateNotifications).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('default values', () => {
    it('should use default theme when settings is null', () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        ...defaultUseSettingsReturn,
        settings: null
      })

      renderWithRouter(<Settings />)

      expect(screen.getByRole('button', { name: '浅色' })).toBeInTheDocument()
    })

    it('should use default language when settings is null', () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        ...defaultUseSettingsReturn,
        settings: null
      })

      renderWithRouter(<Settings />)

      expect(screen.getByRole('button', { name: '中文' })).toBeInTheDocument()
    })

    it('should use default notifications when settings is null', () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        ...defaultUseSettingsReturn,
        settings: null
      })

      renderWithRouter(<Settings />)

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })
  })
})
