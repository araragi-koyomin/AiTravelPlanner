import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ItineraryStatus } from '@/types/itinerary'

export type ItinerarySortField = 'created_at' | 'start_date' | 'budget' | 'days' | 'title'
export type ItinerarySortOrder = 'asc' | 'desc'
export type ViewMode = 'grid' | 'list'

export interface ItinerarySortOptions {
  field: ItinerarySortField
  order: ItinerarySortOrder
}

export type DateRangeType = 'all' | 'upcoming' | 'ongoing' | 'ended' | 'custom'

export interface ItineraryFilterOptions {
  dateRange?: {
    type: DateRangeType
    startDate?: string
    endDate?: string
  }
  destinations?: string[]
  isFavorite?: boolean
  status?: ItineraryStatus[]
}

interface ItineraryListState {
  viewMode: ViewMode
  searchKeyword: string
  filters: ItineraryFilterOptions
  sort: ItinerarySortOptions
  selectedIds: string[]
  isBatchMode: boolean
  page: number
  pageSize: number

  setViewMode: (mode: ViewMode) => void
  setSearchKeyword: (keyword: string) => void
  setFilters: (filters: ItineraryFilterOptions) => void
  updateFilters: (filters: Partial<ItineraryFilterOptions>) => void
  resetFilters: () => void
  setSort: (sort: ItinerarySortOptions) => void
  toggleSortOrder: () => void
  setSelectedIds: (ids: string[]) => void
  toggleSelectId: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  setBatchMode: (mode: boolean) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  reset: () => void
}

const initialFilters: ItineraryFilterOptions = {
  dateRange: { type: 'all' },
  destinations: [],
  isFavorite: undefined,
  status: undefined
}

const initialState = {
  viewMode: 'grid' as ViewMode,
  searchKeyword: '',
  filters: initialFilters,
  sort: { field: 'created_at' as ItinerarySortField, order: 'desc' as ItinerarySortOrder },
  selectedIds: [],
  isBatchMode: false,
  page: 1,
  pageSize: 12
}

export const useItineraryListStore = create<ItineraryListState>()(
  persist(
    (set) => ({
      ...initialState,

      setViewMode: (mode) => set({ viewMode: mode }),

      setSearchKeyword: (keyword) => set({ searchKeyword: keyword, page: 1 }),

      setFilters: (filters) => set({ filters, page: 1 }),

      updateFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          page: 1
        })),

      resetFilters: () => set({ filters: initialFilters, page: 1 }),

      setSort: (sort) => set({ sort }),

      toggleSortOrder: () =>
        set((state) => ({
          sort: {
            ...state.sort,
            order: state.sort.order === 'asc' ? 'desc' : 'asc'
          }
        })),

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      toggleSelectId: (id) =>
        set((state) => {
          const isSelected = state.selectedIds.includes(id)
          return {
            selectedIds: isSelected
              ? state.selectedIds.filter((i) => i !== id)
              : [...state.selectedIds, id]
          }
        }),

      selectAll: (ids) => set({ selectedIds: ids }),

      clearSelection: () => set({ selectedIds: [] }),

      setBatchMode: (mode) => set({ isBatchMode: mode, selectedIds: [] }),

      setPage: (page) => set({ page }),

      setPageSize: (size) => set({ pageSize: size, page: 1 }),

      reset: () => set(initialState)
    }),
    {
      name: 'itinerary-list-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sort: state.sort,
        pageSize: state.pageSize
      })
    }
  )
)

export function sortItineraries<T extends { id: string; created_at: string; start_date: string; end_date: string; budget: number; title: string }>(
  itineraries: T[],
  sort: ItinerarySortOptions
): T[] {
  const sorted = [...itineraries]

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sort.field) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'start_date':
        comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        break
      case 'budget':
        comparison = a.budget - b.budget
        break
      case 'title':
        comparison = a.title.localeCompare(b.title, 'zh-CN')
        break
      case 'days': {
        const aDays = calculateDays(a.start_date, a.end_date || a.start_date)
        const bDays = calculateDays(b.start_date, b.end_date || b.start_date)
        comparison = aDays - bDays
        break
      }
      default:
        comparison = 0
    }

    return sort.order === 'asc' ? comparison : -comparison
  })

  return sorted
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function filterItineraries<
  T extends {
    id: string
    destination: string
    start_date: string
    end_date: string
    is_favorite: boolean
    status?: string
    title: string
    special_requirements?: string | null
  }
>(itineraries: T[], filters: ItineraryFilterOptions, searchKeyword: string): T[] {
  let filtered = [...itineraries]

  if (searchKeyword.trim()) {
    const keyword = searchKeyword.toLowerCase().trim()
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.destination.toLowerCase().includes(keyword) ||
        (item.special_requirements?.toLowerCase().includes(keyword) ?? false)
    )
  }

  if (filters.dateRange && filters.dateRange.type !== 'all') {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const today = now.toISOString().split('T')[0]

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    filtered = filtered.filter((item) => {
      switch (filters.dateRange?.type) {
        case 'upcoming':
          return item.start_date >= today && item.start_date <= nextWeekStr
        case 'ongoing':
          return item.start_date <= today && item.end_date >= today
        case 'ended':
          return item.end_date < today
        case 'custom':
          if (filters.dateRange?.startDate && item.start_date < filters.dateRange.startDate) {
            return false
          }
          if (filters.dateRange?.endDate && item.end_date > filters.dateRange.endDate) {
            return false
          }
          return true
        default:
          return true
      }
    })
  }

  if (filters.destinations && filters.destinations.length > 0) {
    filtered = filtered.filter((item) =>
      filters.destinations!.some((dest) => item.destination.includes(dest))
    )
  }

  if (filters.isFavorite !== undefined) {
    filtered = filtered.filter((item) => item.is_favorite === filters.isFavorite)
  }

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((item) => filters.status!.includes(item.status as ItineraryStatus))
  }

  return filtered
}

export function paginateItineraries<T>(itineraries: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return itineraries.slice(start, end)
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize)
}
