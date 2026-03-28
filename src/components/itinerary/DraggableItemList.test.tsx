import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DraggableItemList } from './DraggableItemList'
import type { ItineraryItem } from '@/services/itinerary'

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => children,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => [])
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => children,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false
  }),
  verticalListSortingStrategy: {},
  sortableKeyboardCoordinates: vi.fn()
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => '')
    }
  }
}))

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

describe('DraggableItemList', () => {
  const defaultProps = {
    items: [createMockItem()],
    day: 1,
    isEditMode: false,
    onReorder: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('非编辑模式渲染', () => {
    it('应该正常渲染组件', () => {
      render(<DraggableItemList {...defaultProps} />)

      expect(screen.getByText('测试景点')).toBeInTheDocument()
    })

    it('应该渲染所有行程项', () => {
      const items = [
        createMockItem({ id: 'item-1', name: '景点A' }),
        createMockItem({ id: 'item-2', name: '景点B' })
      ]
      render(<DraggableItemList {...defaultProps} items={items} />)

      expect(screen.getByText('景点A')).toBeInTheDocument()
      expect(screen.getByText('景点B')).toBeInTheDocument()
    })

    it('应该按 order_idx 排序', () => {
      const items = [
        createMockItem({ id: 'item-2', name: '景点B', order_idx: 1 }),
        createMockItem({ id: 'item-1', name: '景点A', order_idx: 0 })
      ]
      render(<DraggableItemList {...defaultProps} items={items} />)

      const itemA = screen.getByText('景点A')
      const itemB = screen.getByText('景点B')
      
      expect(itemA.compareDocumentPosition(itemB) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('应该不显示编辑按钮', () => {
      render(<DraggableItemList {...defaultProps} isEditMode={false} />)

      expect(screen.queryByRole('button', { name: /编辑/ })).not.toBeInTheDocument()
    })

    it('应该不显示删除按钮', () => {
      render(<DraggableItemList {...defaultProps} isEditMode={false} />)

      expect(screen.queryByRole('button', { name: /删除/ })).not.toBeInTheDocument()
    })
  })

  describe('编辑模式渲染', () => {
    it('应该显示编辑按钮', () => {
      render(<DraggableItemList {...defaultProps} isEditMode={true} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('应该显示删除按钮', () => {
      render(<DraggableItemList {...defaultProps} isEditMode={true} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('应该正确渲染所有行程项', () => {
      const items = [
        createMockItem({ id: 'item-1', name: '景点A' }),
        createMockItem({ id: 'item-2', name: '景点B' })
      ]
      render(<DraggableItemList {...defaultProps} items={items} isEditMode={true} />)

      expect(screen.getByText('景点A')).toBeInTheDocument()
      expect(screen.getByText('景点B')).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('点击编辑按钮应该调用 onEdit', () => {
      const onEdit = vi.fn()
      render(<DraggableItemList {...defaultProps} isEditMode={true} onEdit={onEdit} />)

      const buttons = screen.getAllByRole('button')
      const editButton = buttons[0]
      fireEvent.click(editButton)

      expect(onEdit).toHaveBeenCalledWith('item-1')
    })

    it('点击删除按钮应该调用 onDelete', () => {
      const onDelete = vi.fn()
      render(<DraggableItemList {...defaultProps} isEditMode={true} onDelete={onDelete} />)

      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons[1]
      fireEvent.click(deleteButton)

      expect(onDelete).toHaveBeenCalledWith('item-1')
    })

    it('应该传递正确的 itemId', () => {
      const items = [
        createMockItem({ id: 'custom-item-id', name: '自定义景点' })
      ]
      const onEdit = vi.fn()
      render(<DraggableItemList {...defaultProps} items={items} isEditMode={true} onEdit={onEdit} />)

      const buttons = screen.getAllByRole('button')
      const editButton = buttons[0]
      fireEvent.click(editButton)

      expect(onEdit).toHaveBeenCalledWith('custom-item-id')
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空列表', () => {
      render(<DraggableItemList {...defaultProps} items={[]} />)

      expect(screen.queryByText(/景点/)).not.toBeInTheDocument()
    })

    it('应该正确处理单项列表', () => {
      render(<DraggableItemList {...defaultProps} items={[createMockItem()]} />)

      expect(screen.getByText('测试景点')).toBeInTheDocument()
    })
  })

  describe('显示信息', () => {
    it('应该显示时间信息', () => {
      const items = [createMockItem({ time: '14:30' })]
      render(<DraggableItemList {...defaultProps} items={items} />)

      expect(screen.getByText('14:30')).toBeInTheDocument()
    })

    it('应该显示费用信息', () => {
      const items = [createMockItem({ cost: 500 })]
      render(<DraggableItemList {...defaultProps} items={items} />)

      expect(screen.getByText(/¥500/)).toBeInTheDocument()
    })

    it('应该显示地点信息', () => {
      const items = [createMockItem({ location: { address: '北京市东城区', lat: 39.9, lng: 116.4 } })]
      render(<DraggableItemList {...defaultProps} items={items} />)

      expect(screen.getByText('北京市东城区')).toBeInTheDocument()
    })

    it('应该显示描述信息', () => {
      const items = [createMockItem({ description: '这是一个很棒的景点' })]
      render(<DraggableItemList {...defaultProps} items={items} />)

      expect(screen.getByText('这是一个很棒的景点')).toBeInTheDocument()
    })

    it('应该显示提示信息', () => {
      const items = [createMockItem({ tips: '建议提前预约' })]
      render(<DraggableItemList {...defaultProps} items={items} />)

      expect(screen.getByText('建议提前预约')).toBeInTheDocument()
    })

    it('应该显示时长信息', () => {
      const items = [createMockItem({ duration: 120 })]
      render(<DraggableItemList {...defaultProps} items={items} />)

      expect(screen.getByText(/120 分钟/)).toBeInTheDocument()
    })
  })
})
