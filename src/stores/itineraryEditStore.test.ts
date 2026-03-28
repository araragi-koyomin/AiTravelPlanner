import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useItineraryEditStore } from './itineraryEditStore'
import type { ItineraryItem } from '@/services/itinerary'
import {
  createHistoryManager,
  generateItemId,
  isTempId
} from '@/utils/historyManager'

vi.mock('@/utils/historyManager', () => ({
  createHistoryManager: vi.fn(),
  generateItemId: vi.fn(),
  isTempId: vi.fn()
}))

const createMockItem = (overrides: Partial<ItineraryItem> = {}): ItineraryItem => ({
  id: 'item-1',
  itinerary_id: 'itinerary-1',
  day: 1,
  time: '09:00',
  type: 'attraction',
  name: '测试景点',
  location: { address: '测试地址', lat: 0, lng: 0 },
  description: null,
  cost: null,
  duration: null,
  tips: null,
  image_url: null,
  order_idx: 0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

const createMockNewItem = () => ({
  name: '新景点',
  type: 'attraction' as const,
  time: '09:00',
  location: { address: '新地址', lat: 0, lng: 0 },
  description: null,
  cost: null,
  duration: null,
  tips: null,
  image_url: null
})

describe('itineraryEditStore', () => {
  let mockHistoryManager: {
    push: ReturnType<typeof vi.fn>
    undo: ReturnType<typeof vi.fn>
    redo: ReturnType<typeof vi.fn>
    canUndo: ReturnType<typeof vi.fn>
    canRedo: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
    getHistory: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockHistoryManager = {
      push: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn().mockReturnValue(false),
      canRedo: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
      getHistory: vi.fn().mockReturnValue([])
    }

    vi.mocked(createHistoryManager).mockReturnValue(mockHistoryManager as any)
    vi.mocked(generateItemId).mockReturnValue('temp_1234567890_abc')
    vi.mocked(isTempId).mockReturnValue(false)

    useItineraryEditStore.setState({
      isEditMode: false,
      hasUnsavedChanges: false,
      editingItemId: null,
      items: [],
      originalItems: [],
      itineraryId: null,
      historyManager: mockHistoryManager as any,
      isSaving: false,
      saveError: null
    })
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useItineraryEditStore.getState()

      expect(state.isEditMode).toBe(false)
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.editingItemId).toBeNull()
      expect(state.items).toEqual([])
      expect(state.originalItems).toEqual([])
      expect(state.itineraryId).toBeNull()
      expect(state.isSaving).toBe(false)
      expect(state.saveError).toBeNull()
    })

    it('isEditMode 应该为 false', () => {
      expect(useItineraryEditStore.getState().isEditMode).toBe(false)
    })

    it('hasUnsavedChanges 应该为 false', () => {
      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(false)
    })

    it('editingItemId 应该为 null', () => {
      expect(useItineraryEditStore.getState().editingItemId).toBeNull()
    })

    it('items 应该为空数组', () => {
      expect(useItineraryEditStore.getState().items).toEqual([])
    })

    it('originalItems 应该为空数组', () => {
      expect(useItineraryEditStore.getState().originalItems).toEqual([])
    })

    it('itineraryId 应该为 null', () => {
      expect(useItineraryEditStore.getState().itineraryId).toBeNull()
    })
  })

  describe('enterEditMode', () => {
    it('应该正确进入编辑模式', () => {
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      const state = useItineraryEditStore.getState()
      expect(state.isEditMode).toBe(true)
    })

    it('应该设置 itineraryId', () => {
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      expect(useItineraryEditStore.getState().itineraryId).toBe('itinerary-1')
    })

    it('应该设置 items', () => {
      const items = [createMockItem({ id: 'item-1' }), createMockItem({ id: 'item-2' })]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      const state = useItineraryEditStore.getState()
      expect(state.items).toHaveLength(2)
      expect(state.items[0].id).toBe('item-1')
      expect(state.items[1].id).toBe('item-2')
    })

    it('应该设置 originalItems', () => {
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      const state = useItineraryEditStore.getState()
      expect(state.originalItems).toEqual(items)
    })

    it('应该清除历史记录', () => {
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      expect(mockHistoryManager.clear).toHaveBeenCalled()
    })

    it('应该设置 isEditMode 为 true', () => {
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      expect(useItineraryEditStore.getState().isEditMode).toBe(true)
    })

    it('应该设置 hasUnsavedChanges 为 false', () => {
      useItineraryEditStore.setState({ hasUnsavedChanges: true })
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(false)
    })

    it('应该为每个 item 添加 isEditing 和 isDirty 属性', () => {
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      const state = useItineraryEditStore.getState()
      expect(state.items[0].isEditing).toBe(false)
      expect(state.items[0].isDirty).toBe(false)
    })

    it('应该重置 isSaving 和 saveError', () => {
      useItineraryEditStore.setState({ isSaving: true, saveError: '之前的错误' })
      const items = [createMockItem()]

      useItineraryEditStore.getState().enterEditMode('itinerary-1', items)

      const state = useItineraryEditStore.getState()
      expect(state.isSaving).toBe(false)
      expect(state.saveError).toBeNull()
    })
  })

  describe('exitEditMode', () => {
    it('应该正确退出编辑模式', () => {
      useItineraryEditStore.setState({ isEditMode: true })
      
      useItineraryEditStore.getState().exitEditMode()

      expect(useItineraryEditStore.getState().isEditMode).toBe(false)
    })

    it('应该重置所有状态', () => {
      const items = [createMockItem()]
      useItineraryEditStore.setState({
        isEditMode: true,
        hasUnsavedChanges: true,
        editingItemId: 'item-1',
        items: items.map(i => ({ ...i, isEditing: true, isDirty: true })),
        originalItems: items,
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().exitEditMode()

      const state = useItineraryEditStore.getState()
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.editingItemId).toBeNull()
      expect(state.items).toEqual([])
      expect(state.originalItems).toEqual([])
      expect(state.itineraryId).toBeNull()
    })

    it('应该设置 isEditMode 为 false', () => {
      useItineraryEditStore.setState({ isEditMode: true })

      useItineraryEditStore.getState().exitEditMode()

      expect(useItineraryEditStore.getState().isEditMode).toBe(false)
    })

    it('应该清除 editingItemId', () => {
      useItineraryEditStore.setState({ editingItemId: 'item-1' })

      useItineraryEditStore.getState().exitEditMode()

      expect(useItineraryEditStore.getState().editingItemId).toBeNull()
    })

    it('应该清除历史记录', () => {
      useItineraryEditStore.getState().exitEditMode()

      expect(mockHistoryManager.clear).toHaveBeenCalled()
    })
  })

  describe('setEditingItem', () => {
    beforeEach(() => {
      const items = [createMockItem({ id: 'item-1' }), createMockItem({ id: 'item-2' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isEditing: false, isDirty: false })),
        itineraryId: 'itinerary-1'
      })
    })

    it('应该正确设置编辑中的项目 ID', () => {
      useItineraryEditStore.getState().setEditingItem('item-1')

      expect(useItineraryEditStore.getState().editingItemId).toBe('item-1')
    })

    it('应该更新 items 中的 isEditing 状态', () => {
      useItineraryEditStore.getState().setEditingItem('item-1')

      const state = useItineraryEditStore.getState()
      expect(state.items[0].isEditing).toBe(true)
      expect(state.items[1].isEditing).toBe(false)
    })

    it('应该清除之前的编辑状态', () => {
      useItineraryEditStore.setState({
        editingItemId: 'item-1',
        items: useItineraryEditStore.getState().items.map((i, idx) => ({
          ...i,
          isEditing: idx === 0
        }))
      })

      useItineraryEditStore.getState().setEditingItem('item-2')

      const state = useItineraryEditStore.getState()
      expect(state.items[0].isEditing).toBe(false)
      expect(state.items[1].isEditing).toBe(true)
    })

    it('应该支持设置为 null', () => {
      useItineraryEditStore.getState().setEditingItem('item-1')
      useItineraryEditStore.getState().setEditingItem(null)

      const state = useItineraryEditStore.getState()
      expect(state.editingItemId).toBeNull()
      expect(state.items.every(i => !i.isEditing)).toBe(true)
    })
  })

  describe('updateItem', () => {
    beforeEach(() => {
      const items = [createMockItem({ id: 'item-1', name: '原始名称' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isEditing: false, isDirty: false })),
        originalItems: items,
        itineraryId: 'itinerary-1'
      })
    })

    it('应该正确更新行程项', () => {
      useItineraryEditStore.getState().updateItem('item-1', { name: '新名称' })

      const state = useItineraryEditStore.getState()
      expect(state.items[0].name).toBe('新名称')
    })

    it('应该设置 hasUnsavedChanges 为 true', () => {
      useItineraryEditStore.getState().updateItem('item-1', { name: '新名称' })

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(true)
    })

    it('应该设置 isDirty 为 true', () => {
      useItineraryEditStore.getState().updateItem('item-1', { name: '新名称' })

      expect(useItineraryEditStore.getState().items[0].isDirty).toBe(true)
    })

    it('应该记录历史', () => {
      useItineraryEditStore.getState().updateItem('item-1', { name: '新名称' })

      expect(mockHistoryManager.push).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'update',
          itemId: 'item-1',
          previousData: expect.objectContaining({ name: '原始名称' }),
          newData: { name: '新名称' }
        })
      )
    })

    it('应该不更新不存在的项目', () => {
      const originalItems = useItineraryEditStore.getState().items

      useItineraryEditStore.getState().updateItem('non-existent', { name: '新名称' })

      expect(useItineraryEditStore.getState().items).toEqual(originalItems)
    })

    it('应该支持部分更新', () => {
      useItineraryEditStore.getState().updateItem('item-1', { name: '新名称' })

      const state = useItineraryEditStore.getState()
      expect(state.items[0].name).toBe('新名称')
      expect(state.items[0].time).toBe('09:00')
      expect(state.items[0].type).toBe('attraction')
    })

    it('应该记录完整的 previousData', () => {
      useItineraryEditStore.getState().updateItem('item-1', { name: '新名称' })

      const callArgs = mockHistoryManager.push.mock.calls[0][0]
      expect(callArgs.previousData).toHaveProperty('name')
      expect(callArgs.previousData).toHaveProperty('time')
      expect(callArgs.previousData).toHaveProperty('type')
      expect(callArgs.previousData).toHaveProperty('location')
    })
  })

  describe('addItem', () => {
    beforeEach(() => {
      const items = [createMockItem({ id: 'item-1', day: 1, order_idx: 0 })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isEditing: false, isDirty: false })),
        itineraryId: 'itinerary-1'
      })
    })

    it('应该正确添加新行程项', () => {
      const newId = useItineraryEditStore.getState().addItem(1, createMockNewItem())

      const state = useItineraryEditStore.getState()
      expect(state.items).toHaveLength(2)
      expect(newId).toBe('temp_1234567890_abc')
    })

    it('应该生成临时 ID', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      expect(generateItemId).toHaveBeenCalled()
    })

    it('应该设置 isNew 为 true', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      const state = useItineraryEditStore.getState()
      const newItem = state.items.find(i => i.isNew)
      expect(newItem?.isNew).toBe(true)
    })

    it('应该设置 isDirty 为 true', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      const state = useItineraryEditStore.getState()
      const newItem = state.items.find(i => i.isNew)
      expect(newItem?.isDirty).toBe(true)
    })

    it('应该自动计算 order_idx', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      const state = useItineraryEditStore.getState()
      const newItem = state.items.find(i => i.isNew)
      expect(newItem?.order_idx).toBe(1)
    })

    it('应该设置 isEditing 为 true', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      const state = useItineraryEditStore.getState()
      const newItem = state.items.find(i => i.isNew)
      expect(newItem?.isEditing).toBe(true)
    })

    it('应该设置 editingItemId', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      expect(useItineraryEditStore.getState().editingItemId).toBe('temp_1234567890_abc')
    })

    it('应该设置 hasUnsavedChanges 为 true', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(true)
    })

    it('应该记录历史', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      expect(mockHistoryManager.push).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'add',
          itemId: 'temp_1234567890_abc'
        })
      )
    })

    it('应该在没有 itineraryId 时抛出错误', () => {
      useItineraryEditStore.setState({ itineraryId: null })

      expect(() => {
        useItineraryEditStore.getState().addItem(1, createMockNewItem())
      }).toThrow('No itinerary ID set')
    })

    it('应该正确处理空日期的 order_idx', () => {
      useItineraryEditStore.setState({ items: [] })

      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      const state = useItineraryEditStore.getState()
      const newItem = state.items.find(i => i.isNew)
      expect(newItem?.order_idx).toBe(0)
    })

    it('应该使用默认值填充缺失字段', () => {
      useItineraryEditStore.getState().addItem(1, createMockNewItem())

      const state = useItineraryEditStore.getState()
      const newItem = state.items.find(i => i.isNew)
      expect(newItem?.time).toBe('09:00')
      expect(newItem?.type).toBe('attraction')
    })
  })

  describe('deleteItem', () => {
    beforeEach(() => {
      vi.mocked(isTempId).mockReturnValue(false)
    })

    it('应该正确标记项目为已删除', () => {
      const items = [createMockItem({ id: 'item-1' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isDirty: false })),
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('item-1')

      const state = useItineraryEditStore.getState()
      expect(state.items[0].isDeleted).toBe(true)
    })

    it('应该设置 isDeleted 为 true', () => {
      const items = [createMockItem({ id: 'item-1' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isDirty: false })),
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('item-1')

      expect(useItineraryEditStore.getState().items[0].isDeleted).toBe(true)
    })

    it('应该设置 hasUnsavedChanges 为 true', () => {
      const items = [createMockItem({ id: 'item-1' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i })),
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('item-1')

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(true)
    })

    it('应该记录历史', () => {
      const items = [createMockItem({ id: 'item-1', name: '测试景点' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i })),
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('item-1')

      expect(mockHistoryManager.push).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'delete',
          itemId: 'item-1',
          previousData: expect.objectContaining({ name: '测试景点' })
        })
      )
    })

    it('应该不删除不存在的项目', () => {
      const items = [createMockItem({ id: 'item-1' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i })),
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('non-existent')

      expect(useItineraryEditStore.getState().items).toHaveLength(1)
    })

    it('应该正确处理新增项目的删除（直接移除）', () => {
      vi.mocked(isTempId).mockReturnValue(true)
      const items = [createMockItem({ id: 'temp_123' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isNew: true })),
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('temp_123')

      const state = useItineraryEditStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('应该清除正在编辑的项目', () => {
      const items = [createMockItem({ id: 'item-1' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i })),
        editingItemId: 'item-1',
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('item-1')

      expect(useItineraryEditStore.getState().editingItemId).toBeNull()
    })

    it('应该设置 isDirty 为 true', () => {
      const items = [createMockItem({ id: 'item-1' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isDirty: false })),
        itineraryId: 'itinerary-1'
      })

      useItineraryEditStore.getState().deleteItem('item-1')

      expect(useItineraryEditStore.getState().items[0].isDirty).toBe(true)
    })
  })

  describe('reorderItems', () => {
    beforeEach(() => {
      const items = [
        createMockItem({ id: 'item-1', day: 1, order_idx: 0 }),
        createMockItem({ id: 'item-2', day: 1, order_idx: 1 }),
        createMockItem({ id: 'item-3', day: 1, order_idx: 2 })
      ]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isDirty: false })),
        itineraryId: 'itinerary-1'
      })
    })

    it('应该正确重排序项目', () => {
      useItineraryEditStore.getState().reorderItems(1, 0, 2)

      const state = useItineraryEditStore.getState()
      const dayItems = state.items
        .filter(i => i.day === 1 && !i.isDeleted)
        .sort((a, b) => a.order_idx - b.order_idx)

      expect(dayItems[0].id).toBe('item-2')
      expect(dayItems[1].id).toBe('item-3')
      expect(dayItems[2].id).toBe('item-1')
    })

    it('应该更新 order_idx', () => {
      useItineraryEditStore.getState().reorderItems(1, 0, 2)

      const state = useItineraryEditStore.getState()
      const item1 = state.items.find(i => i.id === 'item-1')
      expect(item1?.order_idx).toBe(2)
    })

    it('应该设置 hasUnsavedChanges 为 true', () => {
      useItineraryEditStore.getState().reorderItems(1, 0, 1)

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(true)
    })

    it('应该记录历史', () => {
      useItineraryEditStore.getState().reorderItems(1, 0, 2)

      expect(mockHistoryManager.push).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'reorder',
          itemId: 'item-1',
          previousIndex: 0,
          newIndex: 2
        })
      )
    })

    it('应该不触发排序当 fromIndex 等于 toIndex', () => {
      mockHistoryManager.push.mockClear()

      useItineraryEditStore.getState().reorderItems(1, 1, 1)

      expect(mockHistoryManager.push).not.toHaveBeenCalled()
    })

    it('应该正确处理边界情况 - fromIndex 超出范围', () => {
      const originalItems = [...useItineraryEditStore.getState().items]

      useItineraryEditStore.getState().reorderItems(1, 10, 0)

      expect(useItineraryEditStore.getState().items).toEqual(originalItems)
    })

    it('应该正确处理边界情况 - toIndex 超出范围', () => {
      const originalItems = [...useItineraryEditStore.getState().items]

      useItineraryEditStore.getState().reorderItems(1, 0, 10)

      expect(useItineraryEditStore.getState().items).toEqual(originalItems)
    })

    it('应该正确处理负数索引', () => {
      const originalItems = [...useItineraryEditStore.getState().items]

      useItineraryEditStore.getState().reorderItems(1, -1, 0)

      expect(useItineraryEditStore.getState().items).toEqual(originalItems)
    })

    it('应该设置所有移动项目的 isDirty 为 true', () => {
      useItineraryEditStore.getState().reorderItems(1, 0, 2)

      const state = useItineraryEditStore.getState()
      state.items.forEach(item => {
        expect(item.isDirty).toBe(true)
      })
    })
  })

  describe('moveItemToDay', () => {
    beforeEach(() => {
      const items = [
        createMockItem({ id: 'item-1', day: 1, order_idx: 0 }),
        createMockItem({ id: 'item-2', day: 2, order_idx: 0 })
      ]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isDirty: false })),
        itineraryId: 'itinerary-1'
      })
    })

    it('应该正确移动项目到另一天', () => {
      useItineraryEditStore.getState().moveItemToDay('item-1', 2)

      const state = useItineraryEditStore.getState()
      const item = state.items.find(i => i.id === 'item-1')
      expect(item?.day).toBe(2)
    })

    it('应该记录历史', () => {
      useItineraryEditStore.getState().moveItemToDay('item-1', 2)

      expect(mockHistoryManager.push).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'move',
          itemId: 'item-1',
          previousDay: 1,
          newDay: 2
        })
      )
    })

    it('应该设置 hasUnsavedChanges 为 true', () => {
      useItineraryEditStore.getState().moveItemToDay('item-1', 2)

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(true)
    })

    it('应该不移动当目标天与当前天相同时', () => {
      mockHistoryManager.push.mockClear()

      useItineraryEditStore.getState().moveItemToDay('item-1', 1)

      expect(mockHistoryManager.push).not.toHaveBeenCalled()
    })

    it('应该设置 isDirty 为 true', () => {
      useItineraryEditStore.getState().moveItemToDay('item-1', 2)

      const state = useItineraryEditStore.getState()
      const item = state.items.find(i => i.id === 'item-1')
      expect(item?.isDirty).toBe(true)
    })
  })

  describe('undo/redo', () => {
    beforeEach(() => {
      const items = [createMockItem({ id: 'item-1', name: '原始名称' })]
      useItineraryEditStore.setState({
        isEditMode: true,
        items: items.map(i => ({ ...i, isDirty: false })),
        originalItems: items,
        itineraryId: 'itinerary-1'
      })
    })

    describe('undo', () => {
      it('undo 应该正确恢复之前的状态', () => {
        mockHistoryManager.undo.mockReturnValue({
          type: 'update',
          itemId: 'item-1',
          previousData: { name: '原始名称' },
          newData: { name: '新名称' }
        })

        useItineraryEditStore.getState().undo()

        const state = useItineraryEditStore.getState()
        expect(state.items[0].name).toBe('原始名称')
      })

      it('undo 应该正确处理 update 操作', () => {
        mockHistoryManager.undo.mockReturnValue({
          type: 'update',
          itemId: 'item-1',
          previousData: { name: '恢复的名称' },
          newData: { name: '新名称' }
        })

        useItineraryEditStore.getState().undo()

        const state = useItineraryEditStore.getState()
        expect(state.items[0].name).toBe('恢复的名称')
      })

      it('undo 应该正确处理 add 操作', () => {
        useItineraryEditStore.setState({
          items: [
            createMockItem({ id: 'item-1' }),
            { ...createMockItem({ id: 'temp_123' }), isNew: true }
          ]
        })
        mockHistoryManager.undo.mockReturnValue({
          type: 'add',
          itemId: 'temp_123',
          newData: { id: 'temp_123', name: '新项目' }
        })

        useItineraryEditStore.getState().undo()

        const state = useItineraryEditStore.getState()
        expect(state.items).toHaveLength(1)
        expect(state.items[0].id).toBe('item-1')
      })

      it('undo 应该正确处理 delete 操作', () => {
        useItineraryEditStore.setState({
          items: [{ ...createMockItem({ id: 'item-1' }), isDeleted: true }]
        })
        vi.mocked(isTempId).mockReturnValue(false)
        mockHistoryManager.undo.mockReturnValue({
          type: 'delete',
          itemId: 'item-1',
          previousData: { name: '恢复的项目', isDeleted: true }
        })

        useItineraryEditStore.getState().undo()

        const state = useItineraryEditStore.getState()
        expect(state.items[0].isDeleted).toBe(false)
      })

      it('undo 应该在历史为空时不做任何操作', () => {
        mockHistoryManager.undo.mockReturnValue(null)

        const originalItems = [...useItineraryEditStore.getState().items]
        useItineraryEditStore.getState().undo()

        expect(useItineraryEditStore.getState().items).toEqual(originalItems)
      })
    })

    describe('redo', () => {
      it('redo 应该正确恢复撤销的状态', () => {
        mockHistoryManager.redo.mockReturnValue({
          type: 'update',
          itemId: 'item-1',
          previousData: { name: '原始名称' },
          newData: { name: '新名称' }
        })

        useItineraryEditStore.getState().redo()

        const state = useItineraryEditStore.getState()
        expect(state.items[0].name).toBe('新名称')
      })

      it('redo 应该正确处理 update 操作', () => {
        mockHistoryManager.redo.mockReturnValue({
          type: 'update',
          itemId: 'item-1',
          previousData: { name: '原始名称' },
          newData: { name: '重做的名称' }
        })

        useItineraryEditStore.getState().redo()

        const state = useItineraryEditStore.getState()
        expect(state.items[0].name).toBe('重做的名称')
      })

      it('redo 应该正确处理 add 操作', () => {
        mockHistoryManager.redo.mockReturnValue({
          type: 'add',
          itemId: 'temp_123',
          newData: { id: 'temp_123', name: '重做的项目', itinerary_id: 'itinerary-1', day: 1, order_idx: 0, time: '09:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, created_at: '2024-01-01T00:00:00Z' }
        })

        useItineraryEditStore.getState().redo()

        const state = useItineraryEditStore.getState()
        expect(state.items).toHaveLength(2)
      })

      it('redo 应该正确处理 delete 操作', () => {
        mockHistoryManager.redo.mockReturnValue({
          type: 'delete',
          itemId: 'item-1'
        })

        useItineraryEditStore.getState().redo()

        const state = useItineraryEditStore.getState()
        expect(state.items[0].isDeleted).toBe(true)
      })

      it('redo 应该在历史为空时不做任何操作', () => {
        mockHistoryManager.redo.mockReturnValue(null)

        const originalItems = [...useItineraryEditStore.getState().items]
        useItineraryEditStore.getState().redo()

        expect(useItineraryEditStore.getState().items).toEqual(originalItems)
      })
    })

    describe('canUndo/canRedo', () => {
      it('canUndo 应该正确返回是否可撤销', () => {
        mockHistoryManager.canUndo.mockReturnValue(true)

        expect(useItineraryEditStore.getState().canUndo()).toBe(true)
      })

      it('canUndo 应该返回 false 当不可撤销', () => {
        mockHistoryManager.canUndo.mockReturnValue(false)

        expect(useItineraryEditStore.getState().canUndo()).toBe(false)
      })

      it('canRedo 应该正确返回是否可重做', () => {
        mockHistoryManager.canRedo.mockReturnValue(true)

        expect(useItineraryEditStore.getState().canRedo()).toBe(true)
      })

      it('canRedo 应该返回 false 当不可重做', () => {
        mockHistoryManager.canRedo.mockReturnValue(false)

        expect(useItineraryEditStore.getState().canRedo()).toBe(false)
      })
    })
  })

  describe('getChangedItems', () => {
    it('应该正确获取新增的项目', () => {
      const items = [
        createMockItem({ id: 'item-1' }),
        { ...createMockItem({ id: 'temp_123' }), isNew: true, isDirty: true }
      ]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: [createMockItem({ id: 'item-1' })]
      })

      const result = useItineraryEditStore.getState().getChangedItems()

      expect(result.added).toHaveLength(1)
      expect(result.added[0].id).toBe('temp_123')
    })

    it('应该正确获取更新的项目', () => {
      const originalItem = createMockItem({ id: 'item-1', name: '原始名称' })
      const items = [{ ...originalItem, name: '新名称', isDirty: true }]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: [originalItem]
      })

      const result = useItineraryEditStore.getState().getChangedItems()

      expect(result.updated).toHaveLength(1)
      expect(result.updated[0].name).toBe('新名称')
    })

    it('应该正确获取删除的项目', () => {
      const items = [{ ...createMockItem({ id: 'item-1' }), isDeleted: true }]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: [createMockItem({ id: 'item-1' })]
      })

      const result = useItineraryEditStore.getState().getChangedItems()

      expect(result.deleted).toHaveLength(1)
      expect(result.deleted[0].id).toBe('item-1')
    })

    it('应该正确过滤未更改的项目', () => {
      const originalItem = createMockItem({ id: 'item-1' })
      const items = [{ ...originalItem, isDirty: false }]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: [originalItem]
      })

      const result = useItineraryEditStore.getState().getChangedItems()

      expect(result.added).toHaveLength(0)
      expect(result.updated).toHaveLength(0)
      expect(result.deleted).toHaveLength(0)
    })

    it('应该不包含已删除的新增项目', () => {
      const items = [
        { ...createMockItem({ id: 'temp_123' }), isNew: true, isDeleted: true }
      ]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: []
      })

      const result = useItineraryEditStore.getState().getChangedItems()

      expect(result.added).toHaveLength(0)
      expect(result.deleted).toHaveLength(0)
    })

    it('应该不包含未真正更改的项目', () => {
      const originalItem = createMockItem({ id: 'item-1', name: '测试' })
      const items = [{ ...originalItem }]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: [originalItem]
      })

      const result = useItineraryEditStore.getState().getChangedItems()

      expect(result.updated).toHaveLength(0)
    })
  })

  describe('markAsSaved', () => {
    it('应该正确标记为已保存', () => {
      const items = [
        { ...createMockItem({ id: 'item-1' }), isDirty: true },
        { ...createMockItem({ id: 'temp_123' }), isNew: true, isDirty: true }
      ]
      useItineraryEditStore.setState({
        items: items as any,
        hasUnsavedChanges: true
      })

      useItineraryEditStore.getState().markAsSaved()

      const state = useItineraryEditStore.getState()
      expect(state.hasUnsavedChanges).toBe(false)
    })

    it('应该设置 hasUnsavedChanges 为 false', () => {
      useItineraryEditStore.setState({ hasUnsavedChanges: true })

      useItineraryEditStore.getState().markAsSaved()

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(false)
    })

    it('应该清除 isNew 标记', () => {
      const items = [
        { ...createMockItem({ id: 'temp_123' }), isNew: true }
      ]
      useItineraryEditStore.setState({ items: items as any })

      useItineraryEditStore.getState().markAsSaved()

      const state = useItineraryEditStore.getState()
      expect(state.items[0].isNew).toBe(false)
    })

    it('应该清除 isDirty 标记', () => {
      const items = [
        { ...createMockItem({ id: 'item-1' }), isDirty: true }
      ]
      useItineraryEditStore.setState({ items: items as any })

      useItineraryEditStore.getState().markAsSaved()

      const state = useItineraryEditStore.getState()
      expect(state.items[0].isDirty).toBe(false)
    })

    it('应该清除历史记录', () => {
      useItineraryEditStore.getState().markAsSaved()

      expect(mockHistoryManager.clear).toHaveBeenCalled()
    })

    it('应该过滤掉已删除的项目', () => {
      const items = [
        createMockItem({ id: 'item-1' }),
        { ...createMockItem({ id: 'item-2' }), isDeleted: true }
      ]
      useItineraryEditStore.setState({ items: items as any })

      useItineraryEditStore.getState().markAsSaved()

      const state = useItineraryEditStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].id).toBe('item-1')
    })

    it('应该更新 originalItems', () => {
      const items = [createMockItem({ id: 'item-1' })]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: []
      })

      useItineraryEditStore.getState().markAsSaved()

      const state = useItineraryEditStore.getState()
      expect(state.originalItems).toHaveLength(1)
    })
  })

  describe('resetToOriginal', () => {
    it('应该正确重置到原始状态', () => {
      const originalItem = createMockItem({ id: 'item-1', name: '原始名称' })
      const items = [{ ...originalItem, name: '修改的名称', isDirty: true }]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: [originalItem],
        hasUnsavedChanges: true
      })

      useItineraryEditStore.getState().resetToOriginal()

      const state = useItineraryEditStore.getState()
      expect(state.items[0].name).toBe('原始名称')
    })

    it('应该恢复 originalItems', () => {
      const originalItem = createMockItem({ id: 'item-1' })
      useItineraryEditStore.setState({
        items: [{ ...originalItem, name: '修改的' }] as any,
        originalItems: [originalItem]
      })

      useItineraryEditStore.getState().resetToOriginal()

      const state = useItineraryEditStore.getState()
      expect(state.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'item-1' })
        ])
      )
    })

    it('应该清除历史记录', () => {
      useItineraryEditStore.getState().resetToOriginal()

      expect(mockHistoryManager.clear).toHaveBeenCalled()
    })

    it('应该设置 hasUnsavedChanges 为 false', () => {
      useItineraryEditStore.setState({ hasUnsavedChanges: true })

      useItineraryEditStore.getState().resetToOriginal()

      expect(useItineraryEditStore.getState().hasUnsavedChanges).toBe(false)
    })

    it('应该清除 editingItemId', () => {
      useItineraryEditStore.setState({ editingItemId: 'item-1' })

      useItineraryEditStore.getState().resetToOriginal()

      expect(useItineraryEditStore.getState().editingItemId).toBeNull()
    })

    it('应该清除所有编辑状态', () => {
      const originalItem = createMockItem({ id: 'item-1' })
      const items = [{ ...originalItem, isEditing: true, isDirty: true }]
      useItineraryEditStore.setState({
        items: items as any,
        originalItems: [originalItem]
      })

      useItineraryEditStore.getState().resetToOriginal()

      const state = useItineraryEditStore.getState()
      expect(state.items[0].isEditing).toBe(false)
      expect(state.items[0].isDirty).toBe(false)
    })
  })
})
