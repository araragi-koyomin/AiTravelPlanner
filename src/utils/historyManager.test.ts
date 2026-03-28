import { describe, it, expect, beforeEach } from 'vitest'
import {
  HistoryManager,
  createHistoryManager,
  generateItemId,
  isTempId
} from './historyManager'

describe('historyManager', () => {
  describe('HistoryManager 类', () => {
    let manager: HistoryManager

    beforeEach(() => {
      manager = new HistoryManager()
    })

    describe('初始化', () => {
      it('应该正确初始化历史管理器', () => {
        expect(manager).toBeInstanceOf(HistoryManager)
        expect(manager.canUndo()).toBe(false)
        expect(manager.canRedo()).toBe(false)
        expect(manager.getHistory()).toEqual([])
        expect(manager.getHistoryIndex()).toBe(-1)
      })

      it('应该正确初始化带自定义最大历史大小', () => {
        const customManager = new HistoryManager({ maxHistorySize: 10 })
        expect(customManager).toBeInstanceOf(HistoryManager)
      })
    })

    describe('push 操作', () => {
      it('应该正确 push 操作记录到历史', () => {
        const entry = {
          type: 'update' as const,
          itemId: 'item-1',
          previousData: { name: '旧名称' },
          newData: { name: '新名称' }
        }

        manager.push(entry)

        expect(manager.canUndo()).toBe(true)
        expect(manager.getHistory().length).toBe(1)
        expect(manager.getHistoryIndex()).toBe(0)
      })

      it('应该正确 push 多条操作记录', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: { name: '更新1' } })
        manager.push({ type: 'update', itemId: 'item-2', newData: { name: '更新2' } })
        manager.push({ type: 'update', itemId: 'item-3', newData: { name: '更新3' } })

        expect(manager.getHistory().length).toBe(3)
        expect(manager.getHistoryIndex()).toBe(2)
        expect(manager.canUndo()).toBe(true)
        expect(manager.canRedo()).toBe(false)
      })

      it('应该在超过最大历史大小时删除最旧记录', () => {
        const smallManager = new HistoryManager({ maxHistorySize: 3 })

        smallManager.push({ type: 'update', itemId: 'item-1', newData: {} })
        smallManager.push({ type: 'update', itemId: 'item-2', newData: {} })
        smallManager.push({ type: 'update', itemId: 'item-3', newData: {} })
        smallManager.push({ type: 'update', itemId: 'item-4', newData: {} })

        expect(smallManager.getHistory().length).toBe(3)
        expect(smallManager.getHistory()[0].itemId).toBe('item-2')
      })

      it('应该在 push 新记录后清除重做历史', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.push({ type: 'update', itemId: 'item-2', newData: {} })
        manager.undo()
        
        expect(manager.canRedo()).toBe(true)

        manager.push({ type: 'update', itemId: 'item-3', newData: {} })

        expect(manager.canRedo()).toBe(false)
        expect(manager.getHistory().length).toBe(2)
      })

      it('应该自动添加时间戳', () => {
        const beforeTime = Date.now()
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        const afterTime = Date.now()

        const history = manager.getHistory()
        expect(history[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
        expect(history[0].timestamp).toBeLessThanOrEqual(afterTime)
      })
    })

    describe('undo 功能', () => {
      it('应该正确执行 undo 操作', () => {
        manager.push({ type: 'update', itemId: 'item-1', previousData: { name: '旧' }, newData: { name: '新' } })
        
        const entry = manager.undo()
        
        expect(entry).not.toBeNull()
        expect(entry?.type).toBe('update')
        expect(entry?.itemId).toBe('item-1')
        expect(manager.getHistoryIndex()).toBe(-1)
      })

      it('应该返回 null 当没有可撤销的操作', () => {
        const entry = manager.undo()
        
        expect(entry).toBeNull()
      })

      it('应该正确更新历史索引', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.push({ type: 'update', itemId: 'item-2', newData: {} })
        manager.push({ type: 'update', itemId: 'item-3', newData: {} })

        expect(manager.getHistoryIndex()).toBe(2)
        
        manager.undo()
        expect(manager.getHistoryIndex()).toBe(1)
        
        manager.undo()
        expect(manager.getHistoryIndex()).toBe(0)
      })

      it('应该连续执行多次 undo', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: { name: '更新1' } })
        manager.push({ type: 'update', itemId: 'item-2', newData: { name: '更新2' } })
        manager.push({ type: 'update', itemId: 'item-3', newData: { name: '更新3' } })

        const entry1 = manager.undo()
        expect(entry1?.itemId).toBe('item-3')

        const entry2 = manager.undo()
        expect(entry2?.itemId).toBe('item-2')

        const entry3 = manager.undo()
        expect(entry3?.itemId).toBe('item-1')

        expect(manager.canUndo()).toBe(false)
      })
    })

    describe('redo 功能', () => {
      it('应该正确执行 redo 操作', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: { name: '新' } })
        manager.undo()
        
        const entry = manager.redo()
        
        expect(entry).not.toBeNull()
        expect(entry?.type).toBe('update')
        expect(entry?.itemId).toBe('item-1')
        expect(manager.getHistoryIndex()).toBe(0)
      })

      it('应该返回 null 当没有可重做的操作', () => {
        const entry = manager.redo()
        
        expect(entry).toBeNull()
      })

      it('应该正确更新历史索引', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.push({ type: 'update', itemId: 'item-2', newData: {} })
        manager.undo()
        manager.undo()

        expect(manager.getHistoryIndex()).toBe(-1)
        
        manager.redo()
        expect(manager.getHistoryIndex()).toBe(0)
        
        manager.redo()
        expect(manager.getHistoryIndex()).toBe(1)
      })

      it('应该连续执行多次 redo', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.push({ type: 'update', itemId: 'item-2', newData: {} })
        manager.push({ type: 'update', itemId: 'item-3', newData: {} })
        manager.undo()
        manager.undo()
        manager.undo()

        expect(manager.canRedo()).toBe(true)

        manager.redo()
        expect(manager.getHistoryIndex()).toBe(0)

        manager.redo()
        expect(manager.getHistoryIndex()).toBe(1)

        manager.redo()
        expect(manager.getHistoryIndex()).toBe(2)

        expect(manager.canRedo()).toBe(false)
      })
    })

    describe('canUndo/canRedo', () => {
      it('canUndo 应该返回 true 当有可撤销操作', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        
        expect(manager.canUndo()).toBe(true)
      })

      it('canUndo 应该返回 false 当没有可撤销操作', () => {
        expect(manager.canUndo()).toBe(false)
        
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.undo()
        
        expect(manager.canUndo()).toBe(false)
      })

      it('canRedo 应该返回 true 当有可重做操作', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.undo()
        
        expect(manager.canRedo()).toBe(true)
      })

      it('canRedo 应该返回 false 当没有可重做操作', () => {
        expect(manager.canRedo()).toBe(false)
        
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        
        expect(manager.canRedo()).toBe(false)
      })
    })

    describe('clear 功能', () => {
      it('应该正确清除所有历史记录', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.push({ type: 'update', itemId: 'item-2', newData: {} })
        manager.push({ type: 'update', itemId: 'item-3', newData: {} })

        manager.clear()

        expect(manager.getHistory()).toEqual([])
        expect(manager.canUndo()).toBe(false)
        expect(manager.canRedo()).toBe(false)
      })

      it('应该重置历史索引', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.undo()

        manager.clear()

        expect(manager.getHistoryIndex()).toBe(-1)
      })
    })

    describe('辅助方法', () => {
      it('getHistory 应该返回历史记录的副本', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        
        const history = manager.getHistory()
        history[0].itemId = 'modified'
        
        expect(manager.getHistory()[0].itemId).toBe('item-1')
      })

      it('getUndoCount 应该返回可撤销的操作数', () => {
        expect(manager.getUndoCount()).toBe(0)
        
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        expect(manager.getUndoCount()).toBe(1)
        
        manager.push({ type: 'update', itemId: 'item-2', newData: {} })
        expect(manager.getUndoCount()).toBe(2)
        
        manager.undo()
        expect(manager.getUndoCount()).toBe(1)
      })

      it('getRedoCount 应该返回可重做的操作数', () => {
        expect(manager.getRedoCount()).toBe(0)
        
        manager.push({ type: 'update', itemId: 'item-1', newData: {} })
        manager.push({ type: 'update', itemId: 'item-2', newData: {} })
        manager.undo()
        
        expect(manager.getRedoCount()).toBe(1)
        
        manager.undo()
        expect(manager.getRedoCount()).toBe(2)
      })

      it('getCurrentEntry 应该返回当前历史条目', () => {
        manager.push({ type: 'update', itemId: 'item-1', newData: { name: '更新1' } })
        manager.push({ type: 'update', itemId: 'item-2', newData: { name: '更新2' } })

        const current = manager.getCurrentEntry()
        expect(current?.itemId).toBe('item-2')

        manager.undo()
        expect(manager.getCurrentEntry()?.itemId).toBe('item-1')

        manager.undo()
        expect(manager.getCurrentEntry()).toBeNull()
      })
    })
  })

  describe('辅助函数', () => {
    describe('generateItemId', () => {
      it('应该生成唯一 ID', () => {
        const id1 = generateItemId()
        const id2 = generateItemId()
        
        expect(id1).not.toBe(id2)
      })

      it('应该生成以 temp_ 开头的 ID', () => {
        const id = generateItemId()
        
        expect(id.startsWith('temp_')).toBe(true)
      })

      it('应该包含时间戳', () => {
        const beforeTime = Date.now()
        const id = generateItemId()
        const afterTime = Date.now()
        
        const timestampMatch = id.match(/temp_(\d+)_/)
        expect(timestampMatch).not.toBeNull()
        
        const timestamp = parseInt(timestampMatch![1], 10)
        expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
        expect(timestamp).toBeLessThanOrEqual(afterTime)
      })
    })

    describe('isTempId', () => {
      it('应该正确识别临时 ID', () => {
        expect(isTempId('temp_1234567890_abc123')).toBe(true)
        expect(isTempId('temp_abc')).toBe(true)
      })

      it('应该正确识别非临时 ID', () => {
        expect(isTempId('item-1')).toBe(false)
        expect(isTempId('123e4567-e89b-12d3-a456-426614174000')).toBe(false)
        expect(isTempId('')).toBe(false)
      })
    })

    describe('createHistoryManager', () => {
      it('应该创建 HistoryManager 实例', () => {
        const manager = createHistoryManager()
        
        expect(manager).toBeInstanceOf(HistoryManager)
      })

      it('应该传递选项给 HistoryManager', () => {
        const manager = createHistoryManager({ maxHistorySize: 5 })
        
        expect(manager).toBeInstanceOf(HistoryManager)
      })
    })
  })
})
