import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApiKeySection } from './ApiKeySection'
import type { UserSettings } from '@/services/types'

const mockSettings: Partial<UserSettings> = {
  zhipu_api_key: 'encrypted-zhipu-key',
  xunfei_api_key: null,
  xunfei_app_id: null,
  xunfei_api_secret: null,
  amap_api_key: 'encrypted-amap-key',
  amap_security_js_code: null
}

const mockHandlers = {
  onUpdateKey: vi.fn(),
  onDeleteKey: vi.fn(),
  onShowKey: vi.fn()
}

describe('ApiKeySection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHandlers.onUpdateKey.mockResolvedValue(undefined)
    mockHandlers.onDeleteKey.mockResolvedValue(undefined)
    mockHandlers.onShowKey.mockResolvedValue('decrypted-key')
  })

  describe('rendering', () => {
    it('should render title and description', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      expect(screen.getByText('API Key 管理')).toBeInTheDocument()
      expect(screen.getByText('配置第三方服务的 API Key 以启用相关功能')).toBeInTheDocument()
    })

    it('should display three API Key configurations', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      expect(screen.getByText('智谱AI')).toBeInTheDocument()
      expect(screen.getByText('科大讯飞')).toBeInTheDocument()
      expect(screen.getByText('高德地图')).toBeInTheDocument()
    })

    it('should display correct configured status', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const configuredBadges = screen.getAllByText('已配置')
      const unconfiguredBadges = screen.getAllByText('未配置')

      expect(configuredBadges).toHaveLength(2)
      expect(unconfiguredBadges).toHaveLength(1)
    })

    it('should display get API Key links', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      expect(screen.getAllByText('获取 API Key →')).toHaveLength(3)
    })

    it('should handle null settings', () => {
      render(
        <ApiKeySection
          settings={null}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const unconfiguredBadges = screen.getAllByText('未配置')
      expect(unconfiguredBadges).toHaveLength(3)
    })
  })

  describe('adding API Key', () => {
    it('should display add button when not configured', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const addButtons = screen.getAllByRole('button', { name: '添加' })
      expect(addButtons).toHaveLength(1)
    })

    it('should show input when clicking add', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '添加' }))

      expect(screen.getByPlaceholderText('请输入科大讯飞 APP ID')).toBeInTheDocument()
    })

    it('should validate empty input', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '添加' }))
      fireEvent.click(screen.getByRole('button', { name: '保存' }))

      expect(await screen.findByText('APP ID 不能为空')).toBeInTheDocument()
      expect(mockHandlers.onUpdateKey).not.toHaveBeenCalled()
    })

    it('should successfully save API Key for zhipu', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: '编辑' })
      fireEvent.click(editButtons[0])

      const input = screen.getByPlaceholderText('请输入智谱AI API Key')
      fireEvent.change(input, { target: { value: 'new-api-key' } })

      fireEvent.click(screen.getByRole('button', { name: '保存' }))

      await waitFor(() => {
        expect(mockHandlers.onUpdateKey).toHaveBeenCalledWith('zhipu', { apiKey: 'new-api-key' })
      })
    })

    it('should handle save failure', async () => {
      mockHandlers.onUpdateKey.mockRejectedValue(new Error('Save failed'))

      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '添加' }))

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'new-app-id' } })
      fireEvent.change(inputs[1], { target: { value: 'new-api-key' } })
      fireEvent.change(inputs[2], { target: { value: 'new-api-secret' } })

      fireEvent.click(screen.getByRole('button', { name: '保存' }))

      expect(await screen.findByText('Save failed')).toBeInTheDocument()
    })

    it('should be able to cancel adding', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '添加' }))
      fireEvent.click(screen.getByRole('button', { name: '取消' }))

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('请输入科大讯飞 APP ID')).not.toBeInTheDocument()
      })
    })
  })

  describe('editing API Key', () => {
    it('should show input when clicking edit', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: '编辑' })
      fireEvent.click(editButtons[0])

      expect(screen.getByPlaceholderText('请输入智谱AI API Key')).toBeInTheDocument()
    })

    it('should successfully update API Key', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: '编辑' })
      fireEvent.click(editButtons[0])

      const input = screen.getByPlaceholderText('请输入智谱AI API Key')
      fireEvent.change(input, { target: { value: 'updated-key' } })

      fireEvent.click(screen.getByRole('button', { name: '保存' }))

      await waitFor(() => {
        expect(mockHandlers.onUpdateKey).toHaveBeenCalledWith('zhipu', { apiKey: 'updated-key' })
      })
    })

    it('should handle update failure', async () => {
      mockHandlers.onUpdateKey.mockRejectedValue(new Error('Update failed'))

      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: '编辑' })
      fireEvent.click(editButtons[0])

      const input = screen.getByPlaceholderText('请输入智谱AI API Key')
      fireEvent.change(input, { target: { value: 'updated-key' } })

      fireEvent.click(screen.getByRole('button', { name: '保存' }))

      expect(await screen.findByText('Update failed')).toBeInTheDocument()
    })

    it('should be able to cancel editing', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: '编辑' })
      fireEvent.click(editButtons[0])
      fireEvent.click(screen.getByRole('button', { name: '取消' }))

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('请输入智谱AI API Key')).not.toBeInTheDocument()
      })
    })
  })

  describe('showing/hiding API Key', () => {
    it('should display masked key by default', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      expect(screen.getAllByText('••••••••••••••••')).toHaveLength(2)
    })

    it('should call onShowKey when clicking show', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const showButtons = screen.getAllByRole('button', { name: '显示' })
      fireEvent.click(showButtons[0])

      await waitFor(() => {
        expect(mockHandlers.onShowKey).toHaveBeenCalledWith('zhipu')
      })
    })

    it('should display masked key after showing', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const showButtons = screen.getAllByRole('button', { name: '显示' })
      fireEvent.click(showButtons[0])

      await waitFor(() => {
        expect(screen.getByText('decr****-key')).toBeInTheDocument()
      })
    })

    it('should hide key when clicking hide', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const showButtons = screen.getAllByRole('button', { name: '显示' })
      fireEvent.click(showButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '隐藏' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: '隐藏' }))

      await waitFor(() => {
        const remainingShowButtons = screen.getAllByRole('button', { name: '显示' })
        expect(remainingShowButtons.length).toBe(2)
      })
    })
  })

  describe('deleting API Key', () => {
    it('should display delete button', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '删除' })
      expect(deleteButtons).toHaveLength(2)
    })

    it('should confirm before deletion', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '删除' })
      fireEvent.click(deleteButtons[0])

      expect(window.confirm).toHaveBeenCalledWith('确定要删除此 API Key 吗？')
      expect(mockHandlers.onDeleteKey).not.toHaveBeenCalled()
    })

    it('should call onDeleteKey after confirmation', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '删除' })
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockHandlers.onDeleteKey).toHaveBeenCalledWith('zhipu')
      })
    })

    it('should handle delete failure', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockHandlers.onDeleteKey.mockRejectedValue(new Error('Delete failed'))

      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '删除' })
      fireEvent.click(deleteButtons[0])

      expect(await screen.findByText('Delete failed')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should disable all buttons when loading', () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
          isLoading={true}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('security', () => {
    it('input type should be password', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '添加' }))

      const inputs = screen.getAllByPlaceholderText(/请输入科大讯飞/)
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('type', 'password')
      })
    })

    it('displayed key should be masked', async () => {
      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const showButtons = screen.getAllByRole('button', { name: '显示' })
      fireEvent.click(showButtons[0])

      await waitFor(() => {
        const maskedKey = screen.getByText('decr****-key')
        expect(maskedKey).toBeInTheDocument()
      })
    })

    it('should not show raw key in error message', async () => {
      mockHandlers.onUpdateKey.mockRejectedValue(new Error('Failed to save key: my-secret-key'))

      render(
        <ApiKeySection
          settings={mockSettings as UserSettings}
          onUpdateKey={mockHandlers.onUpdateKey}
          onDeleteKey={mockHandlers.onDeleteKey}
          onShowKey={mockHandlers.onShowKey}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: '编辑' })
      fireEvent.click(editButtons[0])

      const input = screen.getByPlaceholderText('请输入智谱AI API Key')
      fireEvent.change(input, { target: { value: 'my-secret-key' } })

      fireEvent.click(screen.getByRole('button', { name: '保存' }))

      expect(await screen.findByText(/Failed to save key/)).toBeInTheDocument()
    })
  })
})
