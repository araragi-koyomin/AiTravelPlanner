import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AccountSection } from './AccountSection'
import * as authStore from '@/stores/authStore'
import * as authService from '@/services/auth'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/services/auth', () => ({
  updatePassword: vi.fn()
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

describe('AccountSection', () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      logout: mockLogout,
      isLoading: false
    } as unknown as ReturnType<typeof authStore.useAuthStore>)
    vi.mocked(authService.updatePassword).mockResolvedValue(undefined)
    mockLogout.mockResolvedValue(undefined)
  })

  describe('rendering', () => {
    it('should render title and description', () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.getByText('账户设置')).toBeInTheDocument()
      expect(screen.getByText('管理您的账户信息')).toBeInTheDocument()
    })

    it('should display user email', () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should display "未设置" when email is undefined', () => {
      renderWithRouter(<AccountSection userEmail={undefined} />)

      expect(screen.getByText('未设置')).toBeInTheDocument()
    })

    it('should display user nickname when provided', () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" userNickname="测试用户" />)

      expect(screen.getByText('测试用户')).toBeInTheDocument()
    })

    it('should not display nickname section when not provided', () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.queryByText('昵称')).not.toBeInTheDocument()
    })

    it('should display change password button', () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.getByRole('button', { name: '修改密码' })).toBeInTheDocument()
    })

    it('should display logout button', () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.getByRole('button', { name: '退出登录' })).toBeInTheDocument()
    })
  })

  describe('change password', () => {
    it('should show form when clicking change password button', () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))

      expect(screen.getByText('修改密码')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入新密码')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请再次输入新密码')).toBeInTheDocument()
    })

    it('should validate empty password', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))
      fireEvent.click(screen.getByRole('button', { name: '确认修改' }))

      expect(await screen.findByText('请输入新密码')).toBeInTheDocument()
    })

    it('should validate password length (< 6 characters)', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))

      const input = screen.getByPlaceholderText('请输入新密码')
      fireEvent.change(input, { target: { value: '12345' } })

      fireEvent.click(screen.getByRole('button', { name: '确认修改' }))

      expect(await screen.findByText('密码至少需要 6 个字符')).toBeInTheDocument()
    })

    it('should validate password confirmation mismatch', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))

      const passwordInput = screen.getByPlaceholderText('请输入新密码')
      const confirmInput = screen.getByPlaceholderText('请再次输入新密码')

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password456' } })

      fireEvent.click(screen.getByRole('button', { name: '确认修改' }))

      expect(await screen.findByText('两次输入的密码不一致')).toBeInTheDocument()
    })

    it('should successfully change password', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))

      const passwordInput = screen.getByPlaceholderText('请输入新密码')
      const confirmInput = screen.getByPlaceholderText('请再次输入新密码')

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })

      fireEvent.click(screen.getByRole('button', { name: '确认修改' }))

      await waitFor(() => {
        expect(authService.updatePassword).toHaveBeenCalledWith({ newPassword: 'newpassword123' })
      })

      expect(await screen.findByText('密码修改成功')).toBeInTheDocument()
    })

    it('should handle password change failure', async () => {
      vi.mocked(authService.updatePassword).mockRejectedValue(new Error('Password change failed'))

      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))

      const passwordInput = screen.getByPlaceholderText('请输入新密码')
      const confirmInput = screen.getByPlaceholderText('请再次输入新密码')

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })

      fireEvent.click(screen.getByRole('button', { name: '确认修改' }))

      expect(await screen.findByText('Password change failed')).toBeInTheDocument()
    })

    it('should display success message after successful change', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))

      const passwordInput = screen.getByPlaceholderText('请输入新密码')
      const confirmInput = screen.getByPlaceholderText('请再次输入新密码')

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })

      fireEvent.click(screen.getByRole('button', { name: '确认修改' }))

      expect(await screen.findByText('密码修改成功')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('请输入新密码')).not.toBeInTheDocument()
    })

    it('should be able to cancel password change', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '修改密码' }))
      fireEvent.click(screen.getByRole('button', { name: '取消' }))

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('请输入新密码')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: '修改密码' })).toBeInTheDocument()
      })
    })
  })

  describe('logout', () => {
    it('should call logout when clicking logout button', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '退出登录' }))

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled()
      })
    })

    it('should navigate to login page after logout', async () => {
      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '退出登录' }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle logout failure', async () => {
      mockLogout.mockRejectedValue(new Error('Logout failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: '退出登录' }))

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('登出失败:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should disable buttons when loading', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        logout: mockLogout,
        isLoading: true
      } as unknown as ReturnType<typeof authStore.useAuthStore>)

      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.getByRole('button', { name: '登出中...' })).toBeDisabled()
    })
  })

  describe('loading state', () => {
    it('should show loading text on logout button when loading', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        logout: mockLogout,
        isLoading: true
      } as unknown as ReturnType<typeof authStore.useAuthStore>)

      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.getByRole('button', { name: '登出中...' })).toBeInTheDocument()
    })

    it('should disable change password button when loading', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        logout: mockLogout,
        isLoading: true
      } as unknown as ReturnType<typeof authStore.useAuthStore>)

      renderWithRouter(<AccountSection userEmail="test@example.com" />)

      expect(screen.getByRole('button', { name: '修改密码' })).toBeDisabled()
    })
  })
})
