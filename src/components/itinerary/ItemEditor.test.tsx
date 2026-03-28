import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ItemEditor } from './ItemEditor'
import type { ItineraryItem } from '@/services/itinerary'

const createMockItem = (overrides: Partial<ItineraryItem> = {}): ItineraryItem => ({
  id: 'item-1',
  itinerary_id: 'itinerary-1',
  day: 1,
  time: '09:00',
  type: 'attraction',
  name: '测试景点',
  location: { address: '测试地址', lat: 35.6, lng: 139.7 },
  description: '这是一个测试描述',
  cost: 100,
  duration: 60,
  tips: '测试提示',
  image_url: null,
  order_idx: 0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

describe('ItemEditor', () => {
  const defaultProps = {
    item: createMockItem(),
    onSave: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正常渲染组件', () => {
      render(<ItemEditor {...defaultProps} />)

      expect(screen.getByText('编辑行程项')).toBeInTheDocument()
    })

    it('应该渲染名称字段', () => {
      render(<ItemEditor {...defaultProps} />)

      expect(screen.getByPlaceholderText('请输入名称')).toBeInTheDocument()
    })

    it('应该正确显示现有数据', () => {
      render(<ItemEditor {...defaultProps} item={createMockItem({ name: '故宫博物院' })} />)

      expect(screen.getByDisplayValue('故宫博物院')).toBeInTheDocument()
    })

    it('应该显示删除按钮当 onDelete 提供时', () => {
      const onDelete = vi.fn()
      render(<ItemEditor {...defaultProps} onDelete={onDelete} />)

      const deleteButtons = screen.getAllByRole('button')
      expect(deleteButtons.length).toBeGreaterThan(2)
    })

    it('应该不显示删除按钮当 onDelete 未提供', () => {
      render(<ItemEditor {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(3)
    })

    it('应该在 isNew 为 true 时显示新增提示', () => {
      render(<ItemEditor {...defaultProps} isNew={true} />)

      expect(screen.getByText('添加行程项')).toBeInTheDocument()
    })
  })

  describe('表单交互', () => {
    it('应该更新名称字段值', () => {
      render(<ItemEditor {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('测试景点')
      fireEvent.change(nameInput, { target: { value: '新景点名称' } })

      expect(screen.getByDisplayValue('新景点名称')).toBeInTheDocument()
    })

    it('应该更新时间字段值', () => {
      render(<ItemEditor {...defaultProps} />)

      const timeInput = screen.getByDisplayValue('09:00')
      fireEvent.change(timeInput, { target: { value: '14:30' } })

      expect(screen.getByDisplayValue('14:30')).toBeInTheDocument()
    })

    it('应该更新费用字段值', () => {
      render(<ItemEditor {...defaultProps} />)

      const costInput = screen.getByDisplayValue('100')
      fireEvent.change(costInput, { target: { value: '200' } })

      expect(screen.getByDisplayValue('200')).toBeInTheDocument()
    })
  })

  describe('表单验证', () => {
    it('应该验证名称必填', async () => {
      render(<ItemEditor {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('测试景点')
      fireEvent.change(nameInput, { target: { value: '' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('名称不能为空')).toBeInTheDocument()
      })
    })

    it('应该显示名称错误信息', async () => {
      render(<ItemEditor {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('测试景点')
      fireEvent.change(nameInput, { target: { value: '' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('名称不能为空')).toBeInTheDocument()
      })
    })

    it('应该验证时间格式（HH:MM）', async () => {
      render(<ItemEditor {...defaultProps} />)

      const timeInput = screen.getByDisplayValue('09:00')
      fireEvent.change(timeInput, { target: { value: 'invalid' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/时间格式不正确/)).toBeInTheDocument()
      })
    })

    it('应该显示时间格式错误信息', async () => {
      render(<ItemEditor {...defaultProps} />)

      const timeInput = screen.getByDisplayValue('09:00')
      fireEvent.change(timeInput, { target: { value: '25:00' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/时间格式不正确/)).toBeInTheDocument()
      })
    })

    it('应该验证费用非负', async () => {
      render(<ItemEditor {...defaultProps} />)

      const costInput = screen.getByDisplayValue('100')
      fireEvent.change(costInput, { target: { value: '-50' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('费用不能为负数')).toBeInTheDocument()
      })
    })

    it('应该在有错误时不提交表单', async () => {
      const onSave = vi.fn()
      render(<ItemEditor {...defaultProps} onSave={onSave} />)

      const nameInput = screen.getByDisplayValue('测试景点')
      fireEvent.change(nameInput, { target: { value: '' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(onSave).not.toHaveBeenCalled()
      })
    })
  })

  describe('保存功能', () => {
    it('点击保存按钮应该调用 onSave', async () => {
      const onSave = vi.fn()
      render(<ItemEditor {...defaultProps} onSave={onSave} />)

      const nameInput = screen.getByDisplayValue('测试景点')
      fireEvent.change(nameInput, { target: { value: '新景点名称' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1)
      })
    })

    it('应该传递正确的数据给 onSave', async () => {
      const onSave = vi.fn()
      render(<ItemEditor {...defaultProps} onSave={onSave} />)

      const nameInput = screen.getByDisplayValue('测试景点')
      fireEvent.change(nameInput, { target: { value: '新景点名称' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '新景点名称',
            time: '09:00',
            type: 'attraction'
          })
        )
      })
    })

    it('保存按钮应该在未修改时禁用', () => {
      render(<ItemEditor {...defaultProps} />)

      const saveButton = screen.getByRole('button', { name: '保存' })
      expect(saveButton).toBeDisabled()
    })

    it('保存按钮应该在修改后启用', () => {
      render(<ItemEditor {...defaultProps} />)

      const nameInput = screen.getByDisplayValue('测试景点')
      fireEvent.change(nameInput, { target: { value: '新景点名称' } })

      const saveButton = screen.getByRole('button', { name: '保存' })
      expect(saveButton).not.toBeDisabled()
    })
  })

  describe('取消功能', () => {
    it('点击取消按钮应该调用 onCancel', () => {
      const onCancel = vi.fn()
      render(<ItemEditor {...defaultProps} onCancel={onCancel} />)

      fireEvent.click(screen.getByRole('button', { name: '取消' }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('删除功能', () => {
    it('点击删除按钮应该调用 onDelete', () => {
      const onDelete = vi.fn()
      render(<ItemEditor {...defaultProps} onDelete={onDelete} />)

      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find(btn => btn.querySelector('svg.lucide-trash2'))
      fireEvent.click(deleteButton!)

      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })
})
