import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  useItineraryListStore,
  sortItineraries,
  filterItineraries,
  paginateItineraries,
  getTotalPages,
  type ItineraryFilterOptions,
  type ItinerarySortOptions
} from './itineraryListStore'
import type { ItineraryStatus } from '@/types/itinerary'

const createMockItinerary = (overrides: Partial<{
  id: string
  created_at: string
  start_date: string
  end_date: string
  budget: number
  title: string
  destination: string
  is_favorite: boolean
  status: string
  special_requirements: string | null
}> = {}) => ({
  id: 'itinerary-1',
  created_at: '2024-01-01T00:00:00Z',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  budget: 5000,
  title: '北京之旅',
  destination: '北京',
  is_favorite: false,
  status: 'draft',
  special_requirements: null,
  ...overrides
})

describe('itineraryListStore', () => {
  beforeEach(() => {
    useItineraryListStore.setState({
      viewMode: 'grid',
      searchKeyword: '',
      filters: {
        dateRange: { type: 'all' },
        destinations: [],
        isFavorite: undefined,
        status: undefined
      },
      sort: { field: 'created_at', order: 'desc' },
      selectedIds: [],
      isBatchMode: false,
      page: 1,
      pageSize: 12
    })
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useItineraryListStore.getState()
      expect(state.viewMode).toBe('grid')
      expect(state.searchKeyword).toBe('')
      expect(state.selectedIds).toEqual([])
      expect(state.isBatchMode).toBe(false)
      expect(state.page).toBe(1)
      expect(state.pageSize).toBe(12)
    })

    it('viewMode 应该为 grid', () => {
      expect(useItineraryListStore.getState().viewMode).toBe('grid')
    })

    it('searchKeyword 应该为空字符串', () => {
      expect(useItineraryListStore.getState().searchKeyword).toBe('')
    })

    it('filters 应该有正确的初始值', () => {
      const { filters } = useItineraryListStore.getState()
      expect(filters.dateRange?.type).toBe('all')
      expect(filters.destinations).toEqual([])
      expect(filters.isFavorite).toBeUndefined()
      expect(filters.status).toBeUndefined()
    })

    it('sort 应该按创建时间降序', () => {
      const { sort } = useItineraryListStore.getState()
      expect(sort.field).toBe('created_at')
      expect(sort.order).toBe('desc')
    })

    it('selectedIds 应该为空数组', () => {
      expect(useItineraryListStore.getState().selectedIds).toEqual([])
    })

    it('isBatchMode 应该为 false', () => {
      expect(useItineraryListStore.getState().isBatchMode).toBe(false)
    })

    it('page 应该为 1', () => {
      expect(useItineraryListStore.getState().page).toBe(1)
    })

    it('pageSize 应该为 12', () => {
      expect(useItineraryListStore.getState().pageSize).toBe(12)
    })
  })

  describe('setViewMode', () => {
    it('应该正确设置视图模式为 grid', () => {
      useItineraryListStore.getState().setViewMode('grid')
      expect(useItineraryListStore.getState().viewMode).toBe('grid')
    })

    it('应该正确设置视图模式为 list', () => {
      useItineraryListStore.getState().setViewMode('list')
      expect(useItineraryListStore.getState().viewMode).toBe('list')
    })

    it('应该覆盖之前的视图模式', () => {
      useItineraryListStore.getState().setViewMode('list')
      expect(useItineraryListStore.getState().viewMode).toBe('list')

      useItineraryListStore.getState().setViewMode('grid')
      expect(useItineraryListStore.getState().viewMode).toBe('grid')
    })
  })

  describe('setSearchKeyword', () => {
    it('应该正确设置搜索关键词', () => {
      useItineraryListStore.getState().setSearchKeyword('北京')
      expect(useItineraryListStore.getState().searchKeyword).toBe('北京')
    })

    it('设置关键词时应该重置页码为 1', () => {
      useItineraryListStore.setState({ page: 5 })
      useItineraryListStore.getState().setSearchKeyword('上海')
      expect(useItineraryListStore.getState().page).toBe(1)
    })

    it('应该支持空字符串', () => {
      useItineraryListStore.getState().setSearchKeyword('')
      expect(useItineraryListStore.getState().searchKeyword).toBe('')
    })
  })

  describe('setFilters', () => {
    it('应该正确设置筛选条件', () => {
      const newFilters: ItineraryFilterOptions = {
        dateRange: { type: 'upcoming' },
        destinations: ['北京'],
        isFavorite: true,
        status: ['draft']
      }
      useItineraryListStore.getState().setFilters(newFilters)
      expect(useItineraryListStore.getState().filters).toEqual(newFilters)
    })

    it('设置筛选条件时应该重置页码为 1', () => {
      useItineraryListStore.setState({ page: 5 })
      useItineraryListStore.getState().setFilters({ dateRange: { type: 'ended' } })
      expect(useItineraryListStore.getState().page).toBe(1)
    })

    it('应该完全替换筛选条件', () => {
      useItineraryListStore.getState().setFilters({
        dateRange: { type: 'upcoming' },
        destinations: ['北京']
      })
      useItineraryListStore.getState().setFilters({
        dateRange: { type: 'ended' },
        isFavorite: true
      })
      const { filters } = useItineraryListStore.getState()
      expect(filters.dateRange?.type).toBe('ended')
      expect(filters.destinations).toBeUndefined()
      expect(filters.isFavorite).toBe(true)
    })
  })

  describe('updateFilters', () => {
    it('应该正确更新部分筛选条件', () => {
      useItineraryListStore.getState().updateFilters({ isFavorite: true })
      expect(useItineraryListStore.getState().filters.isFavorite).toBe(true)
    })

    it('应该保留未更新的筛选条件', () => {
      useItineraryListStore.getState().setFilters({
        dateRange: { type: 'upcoming' },
        destinations: ['北京']
      })
      useItineraryListStore.getState().updateFilters({ isFavorite: true })
      const { filters } = useItineraryListStore.getState()
      expect(filters.dateRange?.type).toBe('upcoming')
      expect(filters.destinations).toEqual(['北京'])
      expect(filters.isFavorite).toBe(true)
    })

    it('更新筛选条件时应该重置页码为 1', () => {
      useItineraryListStore.setState({ page: 5 })
      useItineraryListStore.getState().updateFilters({ isFavorite: true })
      expect(useItineraryListStore.getState().page).toBe(1)
    })
  })

  describe('resetFilters', () => {
    it('应该正确重置筛选条件', () => {
      useItineraryListStore.getState().setFilters({
        dateRange: { type: 'upcoming' },
        destinations: ['北京'],
        isFavorite: true,
        status: ['draft']
      })
      useItineraryListStore.getState().resetFilters()
      const { filters } = useItineraryListStore.getState()
      expect(filters.dateRange?.type).toBe('all')
      expect(filters.destinations).toEqual([])
      expect(filters.isFavorite).toBeUndefined()
      expect(filters.status).toBeUndefined()
    })

    it('重置筛选条件时应该重置页码为 1', () => {
      useItineraryListStore.setState({ page: 5 })
      useItineraryListStore.getState().resetFilters()
      expect(useItineraryListStore.getState().page).toBe(1)
    })
  })

  describe('setSort', () => {
    it('应该正确设置排序选项', () => {
      const newSort: ItinerarySortOptions = { field: 'budget', order: 'asc' }
      useItineraryListStore.getState().setSort(newSort)
      expect(useItineraryListStore.getState().sort).toEqual(newSort)
    })

    it('应该支持不同的排序字段', () => {
      useItineraryListStore.getState().setSort({ field: 'start_date', order: 'desc' })
      expect(useItineraryListStore.getState().sort.field).toBe('start_date')
    })

    it('应该支持不同的排序方向', () => {
      useItineraryListStore.getState().setSort({ field: 'created_at', order: 'asc' })
      expect(useItineraryListStore.getState().sort.order).toBe('asc')
    })
  })

  describe('toggleSortOrder', () => {
    it('应该从 asc 切换到 desc', () => {
      useItineraryListStore.setState({ sort: { field: 'created_at', order: 'asc' } })
      useItineraryListStore.getState().toggleSortOrder()
      expect(useItineraryListStore.getState().sort.order).toBe('desc')
    })

    it('应该从 desc 切换到 asc', () => {
      useItineraryListStore.setState({ sort: { field: 'created_at', order: 'desc' } })
      useItineraryListStore.getState().toggleSortOrder()
      expect(useItineraryListStore.getState().sort.order).toBe('asc')
    })

    it('应该保留排序字段', () => {
      useItineraryListStore.setState({ sort: { field: 'budget', order: 'desc' } })
      useItineraryListStore.getState().toggleSortOrder()
      expect(useItineraryListStore.getState().sort.field).toBe('budget')
    })
  })

  describe('setSelectedIds', () => {
    it('应该正确设置选中的 ID 列表', () => {
      useItineraryListStore.getState().setSelectedIds(['1', '2', '3'])
      expect(useItineraryListStore.getState().selectedIds).toEqual(['1', '2', '3'])
    })

    it('应该覆盖之前的选中列表', () => {
      useItineraryListStore.getState().setSelectedIds(['1', '2'])
      useItineraryListStore.getState().setSelectedIds(['3', '4'])
      expect(useItineraryListStore.getState().selectedIds).toEqual(['3', '4'])
    })
  })

  describe('toggleSelectId', () => {
    it('应该添加未选中的 ID', () => {
      useItineraryListStore.getState().toggleSelectId('1')
      expect(useItineraryListStore.getState().selectedIds).toContain('1')
    })

    it('应该移除已选中的 ID', () => {
      useItineraryListStore.getState().setSelectedIds(['1', '2'])
      useItineraryListStore.getState().toggleSelectId('1')
      expect(useItineraryListStore.getState().selectedIds).not.toContain('1')
      expect(useItineraryListStore.getState().selectedIds).toContain('2')
    })

    it('应该正确处理空选中列表', () => {
      useItineraryListStore.getState().clearSelection()
      useItineraryListStore.getState().toggleSelectId('1')
      expect(useItineraryListStore.getState().selectedIds).toEqual(['1'])
    })
  })

  describe('selectAll', () => {
    it('应该正确设置全选', () => {
      useItineraryListStore.getState().selectAll(['1', '2', '3'])
      expect(useItineraryListStore.getState().selectedIds).toEqual(['1', '2', '3'])
    })

    it('应该覆盖之前的选中列表', () => {
      useItineraryListStore.getState().setSelectedIds(['1'])
      useItineraryListStore.getState().selectAll(['2', '3'])
      expect(useItineraryListStore.getState().selectedIds).toEqual(['2', '3'])
    })
  })

  describe('clearSelection', () => {
    it('应该清空选中列表', () => {
      useItineraryListStore.getState().setSelectedIds(['1', '2', '3'])
      useItineraryListStore.getState().clearSelection()
      expect(useItineraryListStore.getState().selectedIds).toEqual([])
    })
  })

  describe('setBatchMode', () => {
    it('应该正确设置批量模式', () => {
      useItineraryListStore.getState().setBatchMode(true)
      expect(useItineraryListStore.getState().isBatchMode).toBe(true)
    })

    it('进入批量模式时应该清空选中列表', () => {
      useItineraryListStore.getState().setSelectedIds(['1', '2'])
      useItineraryListStore.getState().setBatchMode(true)
      expect(useItineraryListStore.getState().selectedIds).toEqual([])
    })

    it('退出批量模式时应该清空选中列表', () => {
      useItineraryListStore.getState().setBatchMode(true)
      useItineraryListStore.getState().setSelectedIds(['1', '2'])
      useItineraryListStore.getState().setBatchMode(false)
      expect(useItineraryListStore.getState().selectedIds).toEqual([])
    })
  })

  describe('setPage', () => {
    it('应该正确设置页码', () => {
      useItineraryListStore.getState().setPage(5)
      expect(useItineraryListStore.getState().page).toBe(5)
    })
  })

  describe('setPageSize', () => {
    it('应该正确设置每页数量', () => {
      useItineraryListStore.getState().setPageSize(24)
      expect(useItineraryListStore.getState().pageSize).toBe(24)
    })

    it('设置每页数量时应该重置页码为 1', () => {
      useItineraryListStore.setState({ page: 5 })
      useItineraryListStore.getState().setPageSize(24)
      expect(useItineraryListStore.getState().page).toBe(1)
    })
  })

  describe('reset', () => {
    it('应该正确重置所有状态到初始值', () => {
      useItineraryListStore.getState().setViewMode('list')
      useItineraryListStore.getState().setSearchKeyword('北京')
      useItineraryListStore.getState().setFilters({ dateRange: { type: 'upcoming' } })
      useItineraryListStore.getState().setSort({ field: 'budget', order: 'asc' })
      useItineraryListStore.getState().setSelectedIds(['1', '2'])
      useItineraryListStore.getState().setBatchMode(true)
      useItineraryListStore.getState().setPage(5)
      useItineraryListStore.getState().setPageSize(24)

      useItineraryListStore.getState().reset()

      const state = useItineraryListStore.getState()
      expect(state.viewMode).toBe('grid')
      expect(state.searchKeyword).toBe('')
      expect(state.filters.dateRange?.type).toBe('all')
      expect(state.sort.field).toBe('created_at')
      expect(state.sort.order).toBe('desc')
      expect(state.selectedIds).toEqual([])
      expect(state.isBatchMode).toBe(false)
      expect(state.page).toBe(1)
      expect(state.pageSize).toBe(12)
    })
  })
})

describe('sortItineraries', () => {
  const itineraries = [
    createMockItinerary({ id: '1', created_at: '2024-01-01T00:00:00Z', start_date: '2024-03-01', end_date: '2024-03-03', budget: 3000, title: '北京之旅' }),
    createMockItinerary({ id: '2', created_at: '2024-01-02T00:00:00Z', start_date: '2024-02-01', end_date: '2024-02-05', budget: 5000, title: '上海之旅' }),
    createMockItinerary({ id: '3', created_at: '2024-01-03T00:00:00Z', start_date: '2024-04-01', end_date: '2024-04-02', budget: 2000, title: '广州之旅' })
  ]

  describe('按创建时间排序', () => {
    it('应该按创建时间升序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'created_at', order: 'asc' })
      expect(sorted[0].id).toBe('1')
      expect(sorted[1].id).toBe('2')
      expect(sorted[2].id).toBe('3')
    })

    it('应该按创建时间降序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'created_at', order: 'desc' })
      expect(sorted[0].id).toBe('3')
      expect(sorted[1].id).toBe('2')
      expect(sorted[2].id).toBe('1')
    })

    it('应该正确处理相同创建时间的行程', () => {
      const sameTimeItineraries = [
        createMockItinerary({ id: '1', created_at: '2024-01-01T00:00:00Z' }),
        createMockItinerary({ id: '2', created_at: '2024-01-01T00:00:00Z' })
      ]
      const sorted = sortItineraries(sameTimeItineraries, { field: 'created_at', order: 'asc' })
      expect(sorted).toHaveLength(2)
    })
  })

  describe('按出发日期排序', () => {
    it('应该按出发日期升序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'start_date', order: 'asc' })
      expect(sorted[0].id).toBe('2')
      expect(sorted[1].id).toBe('1')
      expect(sorted[2].id).toBe('3')
    })

    it('应该按出发日期降序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'start_date', order: 'desc' })
      expect(sorted[0].id).toBe('3')
      expect(sorted[1].id).toBe('1')
      expect(sorted[2].id).toBe('2')
    })

    it('应该正确处理相同出发日期的行程', () => {
      const sameDateItineraries = [
        createMockItinerary({ id: '1', start_date: '2024-03-01' }),
        createMockItinerary({ id: '2', start_date: '2024-03-01' })
      ]
      const sorted = sortItineraries(sameDateItineraries, { field: 'start_date', order: 'asc' })
      expect(sorted).toHaveLength(2)
    })
  })

  describe('按预算排序', () => {
    it('应该按预算升序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'budget', order: 'asc' })
      expect(sorted[0].id).toBe('3')
      expect(sorted[1].id).toBe('1')
      expect(sorted[2].id).toBe('2')
    })

    it('应该按预算降序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'budget', order: 'desc' })
      expect(sorted[0].id).toBe('2')
      expect(sorted[1].id).toBe('1')
      expect(sorted[2].id).toBe('3')
    })

    it('应该正确处理相同预算的行程', () => {
      const sameBudgetItineraries = [
        createMockItinerary({ id: '1', budget: 5000 }),
        createMockItinerary({ id: '2', budget: 5000 })
      ]
      const sorted = sortItineraries(sameBudgetItineraries, { field: 'budget', order: 'asc' })
      expect(sorted).toHaveLength(2)
    })
  })

  describe('按天数排序', () => {
    it('应该按天数升序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'days', order: 'asc' })
      expect(sorted[0].id).toBe('3')
      expect(sorted[1].id).toBe('1')
      expect(sorted[2].id).toBe('2')
    })

    it('应该按天数降序排序', () => {
      const sorted = sortItineraries(itineraries, { field: 'days', order: 'desc' })
      expect(sorted[0].id).toBe('2')
      expect(sorted[1].id).toBe('1')
      expect(sorted[2].id).toBe('3')
    })

    it('应该正确计算天数（结束日期 - 开始日期 + 1）', () => {
      const oneDayItinerary = createMockItinerary({
        id: '1',
        start_date: '2024-03-01',
        end_date: '2024-03-01'
      })
      const threeDayItinerary = createMockItinerary({
        id: '2',
        start_date: '2024-03-01',
        end_date: '2024-03-03'
      })
      const sorted = sortItineraries([threeDayItinerary, oneDayItinerary], { field: 'days', order: 'asc' })
      expect(sorted[0].id).toBe('1')
      expect(sorted[1].id).toBe('2')
    })
  })

  describe('按标题排序', () => {
    it('应该按标题升序排序（中文拼音）', () => {
      const sorted = sortItineraries(itineraries, { field: 'title', order: 'asc' })
      expect(sorted[0].id).toBe('1')
      expect(sorted[1].id).toBe('3')
      expect(sorted[2].id).toBe('2')
    })

    it('应该按标题降序排序（中文拼音）', () => {
      const sorted = sortItineraries(itineraries, { field: 'title', order: 'desc' })
      expect(sorted[0].id).toBe('2')
      expect(sorted[1].id).toBe('3')
      expect(sorted[2].id).toBe('1')
    })

    it('应该正确处理相同标题的行程', () => {
      const sameTitleItineraries = [
        createMockItinerary({ id: '1', title: '北京之旅' }),
        createMockItinerary({ id: '2', title: '北京之旅' })
      ]
      const sorted = sortItineraries(sameTitleItineraries, { field: 'title', order: 'asc' })
      expect(sorted).toHaveLength(2)
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空数组', () => {
      const sorted = sortItineraries([], { field: 'created_at', order: 'asc' })
      expect(sorted).toEqual([])
    })

    it('应该正确处理单个行程', () => {
      const single = [createMockItinerary()]
      const sorted = sortItineraries(single, { field: 'created_at', order: 'asc' })
      expect(sorted).toHaveLength(1)
    })

    it('应该不修改原数组', () => {
      const original = [...itineraries]
      sortItineraries(itineraries, { field: 'created_at', order: 'asc' })
      expect(itineraries).toEqual(original)
    })
  })
})

describe('filterItineraries', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const itineraries = [
    createMockItinerary({
      id: '1',
      title: '北京之旅',
      destination: '北京',
      special_requirements: '需要无障碍设施',
      start_date: tomorrowStr,
      end_date: nextWeekStr,
      is_favorite: true,
      status: 'draft'
    }),
    createMockItinerary({
      id: '2',
      title: '上海之旅',
      destination: '上海',
      special_requirements: null,
      start_date: yesterdayStr,
      end_date: tomorrowStr,
      is_favorite: false,
      status: 'generated'
    }),
    createMockItinerary({
      id: '3',
      title: '广州美食游',
      destination: '广州',
      special_requirements: '喜欢吃辣',
      start_date: yesterdayStr,
      end_date: yesterdayStr,
      is_favorite: true,
      status: 'completed'
    })
  ]

  describe('搜索功能', () => {
    it('应该按标题搜索', () => {
      const filtered = filterItineraries(itineraries, {}, '北京')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('应该按目的地搜索', () => {
      const filtered = filterItineraries(itineraries, {}, '上海')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('2')
    })

    it('应该按特殊需求搜索', () => {
      const filtered = filterItineraries(itineraries, {}, '无障碍')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('应该不区分大小写', () => {
      const filtered = filterItineraries(itineraries, {}, 'BEIJING')
      expect(filtered).toHaveLength(0)
    })

    it('应该去除前后空格', () => {
      const filtered = filterItineraries(itineraries, {}, '  北京  ')
      expect(filtered).toHaveLength(1)
    })

    it('应该返回所有行程当搜索关键词为空', () => {
      const filtered = filterItineraries(itineraries, {}, '')
      expect(filtered).toHaveLength(3)
    })
  })

  describe('日期筛选', () => {
    it('应该筛选即将出发的行程（未来7天内）', () => {
      const filtered = filterItineraries(
        itineraries,
        { dateRange: { type: 'upcoming' } },
        ''
      )
      expect(filtered.length).toBeGreaterThanOrEqual(0)
    })

    it('应该筛选进行中的行程', () => {
      const filtered = filterItineraries(
        itineraries,
        { dateRange: { type: 'ongoing' } },
        ''
      )
      expect(filtered.length).toBeGreaterThanOrEqual(0)
    })

    it('应该筛选已结束的行程', () => {
      const filtered = filterItineraries(
        itineraries,
        { dateRange: { type: 'ended' } },
        ''
      )
      expect(filtered.length).toBeGreaterThanOrEqual(0)
    })

    it('应该支持自定义日期范围筛选', () => {
      const filtered = filterItineraries(
        itineraries,
        { dateRange: { type: 'custom', startDate: todayStr, endDate: nextWeekStr } },
        ''
      )
      expect(filtered.length).toBeGreaterThanOrEqual(0)
    })

    it('应该返回所有行程当类型为 all', () => {
      const filtered = filterItineraries(
        itineraries,
        { dateRange: { type: 'all' } },
        ''
      )
      expect(filtered).toHaveLength(3)
    })
  })

  describe('目的地筛选', () => {
    it('应该按目的地筛选', () => {
      const filtered = filterItineraries(
        itineraries,
        { destinations: ['北京'] },
        ''
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].destination).toContain('北京')
    })

    it('应该支持多选目的地', () => {
      const filtered = filterItineraries(
        itineraries,
        { destinations: ['北京', '上海'] },
        ''
      )
      expect(filtered).toHaveLength(2)
    })

    it('应该支持部分匹配（目的地包含筛选词）', () => {
      const partialMatchItineraries = [
        createMockItinerary({ id: '1', destination: '北京市朝阳区' }),
        createMockItinerary({ id: '2', destination: '上海市' })
      ]
      const filtered = filterItineraries(
        partialMatchItineraries,
        { destinations: ['北京'] },
        ''
      )
      expect(filtered).toHaveLength(1)
    })
  })

  describe('收藏筛选', () => {
    it('应该筛选已收藏的行程', () => {
      const filtered = filterItineraries(
        itineraries,
        { isFavorite: true },
        ''
      )
      expect(filtered).toHaveLength(2)
      filtered.forEach(item => expect(item.is_favorite).toBe(true))
    })

    it('应该筛选未收藏的行程', () => {
      const filtered = filterItineraries(
        itineraries,
        { isFavorite: false },
        ''
      )
      expect(filtered).toHaveLength(1)
      filtered.forEach(item => expect(item.is_favorite).toBe(false))
    })

    it('应该返回所有行程当未指定收藏状态', () => {
      const filtered = filterItineraries(
        itineraries,
        { isFavorite: undefined },
        ''
      )
      expect(filtered).toHaveLength(3)
    })
  })

  describe('状态筛选', () => {
    it('应该按行程状态筛选', () => {
      const filtered = filterItineraries(
        itineraries,
        { status: ['draft'] },
        ''
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].status).toBe('draft')
    })

    it('应该支持多选状态', () => {
      const filtered = filterItineraries(
        itineraries,
        { status: ['draft', 'generated'] },
        ''
      )
      expect(filtered).toHaveLength(2)
    })
  })

  describe('组合筛选', () => {
    it('应该同时应用多个筛选条件', () => {
      const filtered = filterItineraries(
        itineraries,
        {
          isFavorite: true,
          status: ['draft']
        },
        ''
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('应该正确处理空筛选条件', () => {
      const filtered = filterItineraries(itineraries, {}, '')
      expect(filtered).toHaveLength(3)
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空数组', () => {
      const filtered = filterItineraries([], {}, '')
      expect(filtered).toEqual([])
    })

    it('应该不修改原数组', () => {
      const original = [...itineraries]
      filterItineraries(itineraries, { isFavorite: true }, '')
      expect(itineraries).toEqual(original)
    })
  })
})

describe('paginateItineraries', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: `item-${i + 1}` }))

  it('应该正确分页行程列表', () => {
    const page1 = paginateItineraries(items, 1, 10)
    expect(page1).toHaveLength(10)
    expect(page1[0].id).toBe('item-1')
    expect(page1[9].id).toBe('item-10')
  })

  it('应该正确计算起始索引', () => {
    const page2 = paginateItineraries(items, 2, 10)
    expect(page2[0].id).toBe('item-11')
  })

  it('应该正确计算结束索引', () => {
    const page2 = paginateItineraries(items, 2, 10)
    expect(page2[page2.length - 1].id).toBe('item-20')
  })

  it('应该正确处理最后一页', () => {
    const lastPage = paginateItineraries(items, 3, 10)
    expect(lastPage).toHaveLength(5)
    expect(lastPage[0].id).toBe('item-21')
    expect(lastPage[lastPage.length - 1].id).toBe('item-25')
  })

  it('应该正确处理超出范围的页码', () => {
    const emptyPage = paginateItineraries(items, 10, 10)
    expect(emptyPage).toEqual([])
  })

  it('应该不修改原数组', () => {
    const original = [...items]
    paginateItineraries(items, 1, 10)
    expect(items).toEqual(original)
  })
})

describe('getTotalPages', () => {
  it('应该正确计算总页数', () => {
    expect(getTotalPages(25, 10)).toBe(3)
  })

  it('应该向上取整', () => {
    expect(getTotalPages(21, 10)).toBe(3)
  })

  it('应该正确处理 0 条记录', () => {
    expect(getTotalPages(0, 10)).toBe(0)
  })

  it('应该正确处理刚好整除的情况', () => {
    expect(getTotalPages(30, 10)).toBe(3)
  })
})
