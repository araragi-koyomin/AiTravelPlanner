import type { ItineraryItem } from '@/services/itinerary'

export type HistoryActionType = 'add' | 'update' | 'delete' | 'reorder' | 'move'

export interface HistoryEntry {
  type: HistoryActionType
  itemId: string
  previousData?: Partial<ItineraryItem>
  newData?: Partial<ItineraryItem>
  previousIndex?: number
  newIndex?: number
  previousDay?: number
  newDay?: number
  timestamp: number
}

export interface HistoryManagerOptions {
  maxHistorySize?: number
}

const DEFAULT_MAX_HISTORY_SIZE = 20

export class HistoryManager {
  private history: HistoryEntry[] = []
  private historyIndex: number = -1
  private maxHistorySize: number

  constructor(options: HistoryManagerOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || DEFAULT_MAX_HISTORY_SIZE
  }

  push(entry: Omit<HistoryEntry, 'timestamp'>): void {
    const newEntry: HistoryEntry = {
      ...entry,
      timestamp: Date.now()
    }

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    this.history.push(newEntry)

    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    } else {
      this.historyIndex++
    }
  }

  undo(): HistoryEntry | null {
    if (!this.canUndo()) {
      return null
    }

    const entry = this.history[this.historyIndex]
    this.historyIndex--
    return entry
  }

  redo(): HistoryEntry | null {
    if (!this.canRedo()) {
      return null
    }

    this.historyIndex++
    return this.history[this.historyIndex]
  }

  canUndo(): boolean {
    return this.historyIndex >= 0
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  clear(): void {
    this.history = []
    this.historyIndex = -1
  }

  getHistory(): HistoryEntry[] {
    return this.history.map(entry => ({ ...entry }))
  }

  getHistoryIndex(): number {
    return this.historyIndex
  }

  getUndoCount(): number {
    return this.historyIndex + 1
  }

  getRedoCount(): number {
    return this.history.length - this.historyIndex - 1
  }

  getCurrentEntry(): HistoryEntry | null {
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      return this.history[this.historyIndex]
    }
    return null
  }
}

export function createHistoryManager(options?: HistoryManagerOptions): HistoryManager {
  return new HistoryManager(options)
}

export function generateItemId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function isTempId(id: string): boolean {
  return id.startsWith('temp_')
}
