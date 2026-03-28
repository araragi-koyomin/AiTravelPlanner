import { create } from 'zustand'
import type { ItineraryItem } from '@/services/itinerary'
import {
  HistoryManager,
  createHistoryManager,
  generateItemId,
  isTempId
} from '@/utils/historyManager'

export interface ItineraryItemEdit extends ItineraryItem {
  isEditing?: boolean
  isDirty?: boolean
  isNew?: boolean
  isDeleted?: boolean
}

export interface ItineraryEditStore {
  isEditMode: boolean
  hasUnsavedChanges: boolean
  editingItemId: string | null
  items: ItineraryItemEdit[]
  originalItems: ItineraryItem[]
  itineraryId: string | null
  historyManager: HistoryManager
  isSaving: boolean
  saveError: string | null

  enterEditMode: (itineraryId: string, items: ItineraryItem[]) => void
  exitEditMode: () => void
  setEditingItem: (itemId: string | null) => void

  updateItem: (id: string, data: Partial<ItineraryItem>) => void
  addItem: (day: number, item: Omit<ItineraryItem, 'id' | 'itinerary_id' | 'day' | 'created_at' | 'order_idx'>) => string
  deleteItem: (id: string) => void
  reorderItems: (day: number, fromIndex: number, toIndex: number) => void
  moveItemToDay: (itemId: string, targetDay: number, targetIndex?: number) => void

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  getChangedItems: () => {
    added: ItineraryItemEdit[]
    updated: ItineraryItemEdit[]
    deleted: ItineraryItemEdit[]
  }

  resetToOriginal: () => void
  markAsSaved: () => void
}

export const useItineraryEditStore = create<ItineraryEditStore>((set, get) => ({
  isEditMode: false,
  hasUnsavedChanges: false,
  editingItemId: null,
  items: [],
  originalItems: [],
  itineraryId: null,
  historyManager: createHistoryManager(),
  isSaving: false,
  saveError: null,

  enterEditMode: (itineraryId, items) => {
    const historyManager = get().historyManager
    historyManager.clear()

    set({
      isEditMode: true,
      hasUnsavedChanges: false,
      editingItemId: null,
      items: items.map(item => ({ ...item, isEditing: false, isDirty: false })),
      originalItems: items,
      itineraryId,
      isSaving: false,
      saveError: null
    })
  },

  exitEditMode: () => {
    set({
      isEditMode: false,
      hasUnsavedChanges: false,
      editingItemId: null,
      items: [],
      originalItems: [],
      itineraryId: null,
      isSaving: false,
      saveError: null
    })
    get().historyManager.clear()
  },

  setEditingItem: (itemId) => {
    set(state => ({
      editingItemId: itemId,
      items: state.items.map(item => ({
        ...item,
        isEditing: item.id === itemId
      }))
    }))
  },

  updateItem: (id, data) => {
    const state = get()
    const item = state.items.find(i => i.id === id)

    if (!item) return

    const historyManager = state.historyManager
    historyManager.push({
      type: 'update',
      itemId: id,
      previousData: {
        name: item.name,
        time: item.time,
        type: item.type,
        location: item.location,
        description: item.description,
        cost: item.cost,
        duration: item.duration,
        tips: item.tips
      },
      newData: data
    })

    set(state => ({
      hasUnsavedChanges: true,
      items: state.items.map(item =>
        item.id === id
          ? { ...item, ...data, isDirty: true }
          : item
      )
    }))
  },

  addItem: (day, itemData) => {
    const state = get()
    const itineraryId = state.itineraryId

    if (!itineraryId) {
      throw new Error('No itinerary ID set')
    }

    const dayItems = state.items.filter(i => i.day === day && !i.isDeleted)
    const maxOrderIdx = dayItems.length > 0
      ? Math.max(...dayItems.map(i => i.order_idx))
      : -1

    const newItem: ItineraryItemEdit = {
      id: generateItemId(),
      itinerary_id: itineraryId,
      day,
      time: itemData.time || '09:00',
      type: itemData.type || 'attraction',
      name: itemData.name || '',
      location: itemData.location || { address: '', lat: 0, lng: 0 },
      description: itemData.description || null,
      cost: itemData.cost ?? null,
      duration: itemData.duration ?? null,
      tips: itemData.tips || null,
      image_url: itemData.image_url || null,
      order_idx: maxOrderIdx + 1,
      created_at: new Date().toISOString(),
      isEditing: true,
      isDirty: true,
      isNew: true
    }

    state.historyManager.push({
      type: 'add',
      itemId: newItem.id,
      newData: { ...newItem }
    })

    set(state => ({
      hasUnsavedChanges: true,
      editingItemId: newItem.id,
      items: [...state.items, newItem]
    }))

    return newItem.id
  },

  deleteItem: (id) => {
    const state = get()
    const item = state.items.find(i => i.id === id)

    if (!item) return

    state.historyManager.push({
      type: 'delete',
      itemId: id,
      previousData: { ...item }
    })

    if (isTempId(id)) {
      set(state => ({
        hasUnsavedChanges: true,
        items: state.items.filter(i => i.id !== id)
      }))
    } else {
      set(state => ({
        hasUnsavedChanges: true,
        items: state.items.map(i =>
          i.id === id ? { ...i, isDeleted: true, isDirty: true } : i
        )
      }))
    }

    if (state.editingItemId === id) {
      set({ editingItemId: null })
    }
  },

  reorderItems: (day, fromIndex, toIndex) => {
    const state = get()
    const dayItems = state.items
      .filter(i => i.day === day && !i.isDeleted)
      .sort((a, b) => a.order_idx - b.order_idx)

    if (fromIndex < 0 || fromIndex >= dayItems.length || toIndex < 0 || toIndex >= dayItems.length) {
      return
    }

    if (fromIndex === toIndex) return

    const movedItem = dayItems[fromIndex]

    state.historyManager.push({
      type: 'reorder',
      itemId: movedItem.id,
      previousIndex: fromIndex,
      newIndex: toIndex
    })

    const newOrder = [...dayItems]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)

    const updatedItems = newOrder.map((item, index) => ({
      ...item,
      order_idx: index,
      isDirty: true
    }))

    set(state => ({
      hasUnsavedChanges: true,
      items: state.items.map(item => {
        const updated = updatedItems.find(u => u.id === item.id)
        return updated ? { ...item, order_idx: updated.order_idx, isDirty: true } : item
      })
    }))
  },

  moveItemToDay: (itemId, targetDay, targetIndex) => {
    const state = get()
    const item = state.items.find(i => i.id === itemId)

    if (!item || item.day === targetDay) return

    const previousDay = item.day
    const previousOrderIdx = item.order_idx

    const targetDayItems = state.items
      .filter(i => i.day === targetDay && !i.isDeleted && i.id !== itemId)
      .sort((a, b) => a.order_idx - b.order_idx)

    const insertIndex = targetIndex !== undefined ? targetIndex : targetDayItems.length

    state.historyManager.push({
      type: 'move',
      itemId,
      previousDay,
      newDay: targetDay,
      previousIndex: previousOrderIdx,
      newIndex: insertIndex
    })

    set(state => ({
      hasUnsavedChanges: true,
      items: state.items.map(i => {
        if (i.id === itemId) {
          return { ...i, day: targetDay, order_idx: insertIndex, isDirty: true }
        }
        if (i.day === targetDay && !i.isDeleted && i.order_idx >= insertIndex) {
          return { ...i, order_idx: i.order_idx + 1, isDirty: true }
        }
        return i
      })
    }))
  },

  undo: () => {
    const state = get()
    const entry = state.historyManager.undo()

    if (!entry) return

    switch (entry.type) {
      case 'update':
        if (entry.previousData) {
          set(state => ({
            items: state.items.map(item =>
              item.id === entry.itemId
                ? { ...item, ...entry.previousData, isDirty: true }
                : item
            )
          }))
        }
        break

      case 'add':
        set(state => ({
          items: state.items.filter(item => item.id !== entry.itemId)
        }))
        break

      case 'delete':
        if (entry.previousData) {
          const wasTemp = isTempId(entry.itemId)
          set(state => ({
            items: state.items.map(item =>
              item.id === entry.itemId
                ? { ...item, ...entry.previousData, isDeleted: false, isDirty: !wasTemp }
                : item
            )
          }))
        }
        break

      case 'reorder':
        if (entry.previousIndex !== undefined && entry.newIndex !== undefined) {
          const day = state.items.find(i => i.id === entry.itemId)?.day
          if (day !== undefined) {
            get().reorderItems(day, entry.newIndex, entry.previousIndex)
            state.historyManager.undo()
          }
        }
        break

      case 'move':
        if (entry.previousDay !== undefined && entry.newDay !== undefined) {
          set(state => ({
            items: state.items.map(item => {
              if (item.id === entry.itemId) {
                return { ...item, day: entry.previousDay!, isDirty: true }
              }
              return item
            })
          }))
        }
        break
    }

    const historyManager = get().historyManager
    set({ hasUnsavedChanges: historyManager.canUndo() || get().items.some(i => i.isDirty) })
  },

  redo: () => {
    const state = get()
    const entry = state.historyManager.redo()

    if (!entry) return

    switch (entry.type) {
      case 'update':
        if (entry.newData) {
          set(state => ({
            items: state.items.map(item =>
              item.id === entry.itemId
                ? { ...item, ...entry.newData, isDirty: true }
                : item
            )
          }))
        }
        break

      case 'add':
        if (entry.newData) {
          set(state => ({
            items: [...state.items, entry.newData as ItineraryItemEdit]
          }))
        }
        break

      case 'delete':
        set(state => ({
          items: state.items.map(item =>
            item.id === entry.itemId
              ? { ...item, isDeleted: true, isDirty: true }
              : item
          )
        }))
        break

      case 'reorder':
        if (entry.previousIndex !== undefined && entry.newIndex !== undefined) {
          const day = state.items.find(i => i.id === entry.itemId)?.day
          if (day !== undefined) {
            get().reorderItems(day, entry.previousIndex, entry.newIndex)
            state.historyManager.redo()
          }
        }
        break

      case 'move':
        if (entry.newDay !== undefined) {
          set(state => ({
            items: state.items.map(item => {
              if (item.id === entry.itemId) {
                return { ...item, day: entry.newDay!, isDirty: true }
              }
              return item
            })
          }))
        }
        break
    }

    set({ hasUnsavedChanges: true })
  },

  canUndo: () => {
    return get().historyManager.canUndo()
  },

  canRedo: () => {
    return get().historyManager.canRedo()
  },

  getChangedItems: () => {
    const state = get()
    const added: ItineraryItemEdit[] = []
    const updated: ItineraryItemEdit[] = []
    const deleted: ItineraryItemEdit[] = []

    for (const item of state.items) {
      if (item.isNew && !item.isDeleted) {
        added.push(item)
      } else if (item.isDeleted && !item.isNew) {
        deleted.push(item)
      } else if (item.isDirty && !item.isDeleted) {
        const original = state.originalItems.find(o => o.id === item.id)
        if (original && JSON.stringify(original) !== JSON.stringify(item)) {
          updated.push(item)
        }
      }
    }

    return { added, updated, deleted }
  },

  resetToOriginal: () => {
    const state = get()
    state.historyManager.clear()

    set(state => ({
      hasUnsavedChanges: false,
      editingItemId: null,
      items: state.originalItems.map(item => ({ ...item, isEditing: false, isDirty: false }))
    }))
  },

  markAsSaved: () => {
    set(state => ({
      hasUnsavedChanges: false,
      originalItems: state.items.filter(i => !i.isDeleted).map(i => ({
        ...i,
        isNew: false,
        isDirty: false,
        isDeleted: false,
        isEditing: false
      })) as ItineraryItem[],
      items: state.items.filter(i => !i.isDeleted).map(i => ({
        ...i,
        isNew: false,
        isDirty: false,
        isDeleted: false,
        isEditing: false
      }))
    }))
    get().historyManager.clear()
  }
}))
