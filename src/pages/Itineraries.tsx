import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  getItineraries,
  deleteItinerary,
  toggleFavorite,
  duplicateItinerary,
  type Itinerary
} from '@/services/itinerary'
import { useAuthStore } from '@/stores/authStore'
import { ItinerariesPageSkeleton } from '@/components/ui/Skeleton'
import { ItinerarySearchBar } from '@/components/itinerary/ItinerarySearchBar'
import { ItineraryFilters } from '@/components/itinerary/ItineraryFilters'
import { ItinerarySortDropdown } from '@/components/itinerary/ItinerarySortDropdown'
import { ViewToggle } from '@/components/itinerary/ViewToggle'
import { ItineraryCard } from '@/components/itinerary/ItineraryCard'
import { CopyItineraryModal } from '@/components/itinerary/CopyItineraryModal'
import { ItineraryBatchActions } from '@/components/itinerary/ItineraryBatchActions'
import { withSyncStatus } from '@/stores/syncStore'
import { Pagination } from '@/components/itinerary/Pagination'
import { SyncStatusIndicator } from '@/components/sync'
import {
  useItineraryListStore,
  sortItineraries,
  filterItineraries,
  paginateItineraries,
  getTotalPages
} from '@/stores/itineraryListStore'
import { useItinerariesRealtime } from '@/hooks/useRealtime'
import { Plus } from 'lucide-react'

export function Itineraries() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    viewMode,
    searchKeyword,
    filters,
    sort,
    selectedIds,
    isBatchMode,
    page,
    pageSize,
    setViewMode,
    setSearchKeyword,
    setFilters,
    resetFilters,
    setSort,
    toggleSelectId,
    selectAll,
    clearSelection,
    setBatchMode,
    setPage
  } = useItineraryListStore()

  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [copyingItinerary, setCopyingItinerary] = useState<Itinerary | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)

  useItinerariesRealtime({
    userId: user?.id || '',
    enabled: !!user?.id,
    onInsert: (newItinerary) => {
      setItineraries((prev) => {
        if (prev.some((i) => i.id === newItinerary.id)) {
          return prev
        }
        return [newItinerary, ...prev]
      })
    },
    onUpdate: (updatedItinerary) => {
      setItineraries((prev) =>
        prev.map((item) =>
          item.id === updatedItinerary.id ? updatedItinerary : item
        )
      )
    },
    onDelete: (deletedId) => {
      setItineraries((prev) => prev.filter((item) => item.id !== deletedId))
    }
  })

  const loadItineraries = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getItineraries(user.id)
      setItineraries(data)
    } catch (err) {
      console.error('加载行程列表失败:', err)
      setError('加载行程列表失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadItineraries()
  }, [loadItineraries])

  const destinations = useMemo(() => {
    const uniqueDestinations = new Set<string>()
    itineraries.forEach((item) => {
      uniqueDestinations.add(item.destination)
    })
    return Array.from(uniqueDestinations).sort()
  }, [itineraries])

  const filteredItineraries = useMemo(() => {
    return filterItineraries(itineraries, filters, searchKeyword)
  }, [itineraries, filters, searchKeyword])

  const sortedItineraries = useMemo(() => {
    return sortItineraries(filteredItineraries, sort)
  }, [filteredItineraries, sort])

  const totalPages = useMemo(() => {
    return getTotalPages(sortedItineraries.length, pageSize)
  }, [sortedItineraries.length, pageSize])

  const paginatedItineraries = useMemo(() => {
    return paginateItineraries(sortedItineraries, page, pageSize)
  }, [sortedItineraries, page, pageSize])

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages)
    }
  }, [totalPages, page, setPage])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('确定要删除这个行程吗？此操作不可撤销。')) {
        return
      }

      try {
        await withSyncStatus(() => deleteItinerary(id))
        setItineraries((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        console.error('删除行程失败:', err)
        alert('删除行程失败，请重试')
      }
    },
    []
  )

  const handleToggleFavorite = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await withSyncStatus(() => toggleFavorite(id))
      setItineraries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_favorite: !currentStatus } : item
        )
      )
    } catch (err) {
      console.error('更新收藏状态失败:', err)
      alert('更新收藏状态失败，请重试')
    }
  }, [])

  const handleCopy = useCallback((id: string) => {
    const itinerary = itineraries.find((item) => item.id === id)
    if (itinerary) {
      setCopyingItinerary(itinerary)
      setCopyModalOpen(true)
    }
  }, [itineraries])

  const handleCopyConfirm = useCallback(
    async (newTitle: string) => {
      if (!copyingItinerary) return

      try {
        setIsCopying(true)
        const newItinerary = await withSyncStatus(() => duplicateItinerary(copyingItinerary.id, newTitle))
        setItineraries((prev) => [newItinerary, ...prev])
        setCopyModalOpen(false)
        setCopyingItinerary(null)
        navigate(`/itineraries/${newItinerary.id}`)
      } catch (err) {
        console.error('复制行程失败:', err)
        alert('复制行程失败，请重试')
      } finally {
        setIsCopying(false)
      }
    },
    [copyingItinerary, navigate]
  )

  const handleView = useCallback(
    (id: string) => {
      navigate(`/itineraries/${id}`)
    },
    [navigate]
  )

  const handleSelectAll = useCallback(() => {
    const allIds = paginatedItineraries.map((item) => item.id)
    selectAll(allIds)
  }, [paginatedItineraries, selectAll])

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 个行程吗？此操作不可撤销。`)) {
      return
    }

    try {
      setIsBatchDeleting(true)
      await Promise.all(selectedIds.map((id) => withSyncStatus(() => deleteItinerary(id))))
      setItineraries((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      clearSelection()
      setBatchMode(false)
    } catch (err) {
      console.error('批量删除失败:', err)
      alert('批量删除失败，请重试')
    } finally {
      setIsBatchDeleting(false)
    }
  }, [selectedIds, clearSelection, setBatchMode])

  const handleBatchFavorite = useCallback(
    async (isFavorite: boolean) => {
      if (selectedIds.length === 0) return

      try {
        await Promise.all(
          selectedIds.map(async (id) => {
            const itinerary = itineraries.find((item) => item.id === id)
            if (itinerary && itinerary.is_favorite !== isFavorite) {
              await withSyncStatus(() => toggleFavorite(id))
            }
          })
        )
        setItineraries((prev) =>
          prev.map((item) =>
            selectedIds.includes(item.id) ? { ...item, is_favorite: isFavorite } : item
          )
        )
        clearSelection()
      } catch (err) {
        console.error('批量更新收藏状态失败:', err)
        alert('批量更新收藏状态失败，请重试')
      }
    },
    [selectedIds, itineraries, clearSelection]
  )

  const handleSearchClear = useCallback(() => {
    setSearchKeyword('')
  }, [setSearchKeyword])

  if (loading) {
    return <ItinerariesPageSkeleton />
  }

  if (error) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">加载失败</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadItineraries} className="w-full">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`container py-12 ${isBatchMode ? 'pb-24' : ''}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的行程</h1>
          <p className="mt-2 text-gray-600">管理您的旅行计划</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncStatusIndicator showLabel={false} showLastSync={false} />
          {!isBatchMode && (
            <Link to="/itineraries/new">
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                创建新行程
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <ItinerarySearchBar
              value={searchKeyword}
              onChange={setSearchKeyword}
              onClear={handleSearchClear}
            />
          </div>
          <div className="flex items-center gap-2">
            <ItinerarySortDropdown sort={sort} onChange={setSort} />
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            <ItineraryBatchActions
              selectedCount={selectedIds.length}
              totalCount={paginatedItineraries.length}
              isBatchMode={isBatchMode}
              onEnterBatchMode={() => setBatchMode(true)}
              onExitBatchMode={() => setBatchMode(false)}
              onSelectAll={handleSelectAll}
              onClearSelection={clearSelection}
              onBatchDelete={handleBatchDelete}
              onBatchFavorite={handleBatchFavorite}
              isLoading={isBatchDeleting}
            />
          </div>
        </div>

        <ItineraryFilters
          filters={filters}
          onChange={setFilters}
          destinations={destinations}
          onReset={resetFilters}
        />
      </div>

      {sortedItineraries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{searchKeyword || filters.dateRange?.type !== 'all' ? '没有找到行程' : '创建新行程'}</CardTitle>
            <CardDescription>
              {searchKeyword || filters.dateRange?.type !== 'all'
                ? '尝试调整搜索条件或筛选条件'
                : '开始规划您的下一次旅行'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 text-6xl">✈️</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {searchKeyword || filters.dateRange?.type !== 'all' ? '没有匹配的行程' : '还没有行程'}
                </h3>
                <p className="mb-6 text-gray-600">
                  {searchKeyword || filters.dateRange?.type !== 'all'
                    ? '尝试使用不同的关键词或清除筛选条件'
                    : '创建您的第一个旅行计划，让 AI 帮助您规划完美的行程'}
                </p>
                {!searchKeyword && filters.dateRange?.type === 'all' && (
                  <Link to="/itineraries/new">
                    <Button>创建行程</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            共 {sortedItineraries.length} 个行程
            {sortedItineraries.length !== itineraries.length && ` (已筛选，原 ${itineraries.length} 个)`}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedItineraries.map((itinerary) => (
                <ItineraryCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  viewMode={viewMode}
                  isSelected={selectedIds.includes(itinerary.id)}
                  isBatchMode={isBatchMode}
                  onSelect={toggleSelectId}
                  onView={handleView}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedItineraries.map((itinerary) => (
                <ItineraryCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  viewMode={viewMode}
                  isSelected={selectedIds.includes(itinerary.id)}
                  isBatchMode={isBatchMode}
                  onSelect={toggleSelectId}
                  onView={handleView}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <CopyItineraryModal
        isOpen={copyModalOpen}
        onClose={() => {
          setCopyModalOpen(false)
          setCopyingItinerary(null)
        }}
        onConfirm={handleCopyConfirm}
        originalTitle={copyingItinerary?.title || ''}
        isLoading={isCopying}
      />
    </div>
  )
}
