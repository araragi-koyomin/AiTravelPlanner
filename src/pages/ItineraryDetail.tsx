import { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  getItineraryById,
  getItineraryItems,
  buildDailySchedule,
  buildBudgetBreakdown,
  batchCreateItineraryItems,
  batchUpdateItineraryItems,
  batchDeleteItineraryItems,
  type DailyScheduleBuilt,
  type ItineraryItem
} from '@/services/itinerary'
import { useAuthStore } from '@/stores/authStore'
import { useItineraryEditStore } from '@/stores/itineraryEditStore'
import { ItineraryDetailSkeleton } from '@/components/ui/Skeleton'
import { MapPin, Calendar, Users, DollarSign, Clock, UserCircle, Home, Gauge, Map } from 'lucide-react'
import { ListView } from '@/components/itinerary/ListView'
import { TimelineView } from '@/components/itinerary/TimelineView'
import { EditToolbar } from '@/components/itinerary/EditToolbar'
import { UnsavedChangesModal } from '@/components/itinerary/UnsavedChangesModal'
import { ExportButton } from '@/components/export'
import {
  TravelersTypeLabels,
  AccommodationPreferenceLabels,
  PaceTypeLabels,
  type TravelersType,
  type AccommodationPreference,
  type PaceType
} from '@/types/itinerary'

const ItineraryMapView = lazy(() => import('@/components/itinerary/ItineraryMapView').then(m => ({ default: m.ItineraryMapView })))

export function ItineraryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [itinerary, setItinerary] = useState<Awaited<ReturnType<typeof getItineraryById>>>(null)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'map'>('list')
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())
  const [mapInView, setMapInView] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingExit, setPendingExit] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const {
    isEditMode,
    hasUnsavedChanges,
    editingItemId,
    items: editItems,
    isSaving,
    enterEditMode,
    exitEditMode,
    setEditingItem,
    updateItem,
    addItem,
    deleteItem,
    reorderItems,
    undo,
    redo,
    canUndo,
    canRedo,
    getChangedItems,
    markAsSaved
  } = useItineraryEditStore()

  const loadItinerary = useCallback(async () => {
    if (!id) {
      navigate('/itineraries')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [itineraryData, itemsData] = await Promise.all([
        getItineraryById(id),
        getItineraryItems(id)
      ])

      if (!itineraryData) {
        setError('行程不存在')
        return
      }

      if (itineraryData.user_id !== user?.id) {
        setError('无权访问此行程')
        return
      }

      setItinerary(itineraryData)
      setItems(itemsData)
      setExpandedDays(new Set(itemsData.length > 0 ? [0] : []))
    } catch (err) {
      console.error('加载行程失败:', err)
      setError('加载行程失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, user?.id])

  useEffect(() => {
    loadItinerary()
  }, [loadItinerary])

  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMapInView(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(mapContainerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [viewMode])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditMode, undo, redo])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex)
      } else {
        newSet.add(dayIndex)
      }
      return newSet
    })
  }

  const toggleAllDays = () => {
    if (dailySchedule.length === 0) return
    if (expandedDays.size === dailySchedule.length) {
      setExpandedDays(new Set())
    } else {
      setExpandedDays(new Set(dailySchedule.map((_, index) => index)))
    }
  }

  const handleEnterEditMode = useCallback(() => {
    if (!id || !itinerary) return
    enterEditMode(id, items)
    const totalDays = Math.ceil(
      (new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
    setExpandedDays(new Set(Array.from({ length: totalDays }, (_, i) => i)))
  }, [id, items, enterEditMode, itinerary])

  const handleExitEditMode = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true)
      setPendingExit(true)
    } else {
      exitEditMode()
    }
  }, [hasUnsavedChanges, exitEditMode])

  const handleSave = useCallback(async () => {
    const { added, updated, deleted } = getChangedItems()

    try {
      if (added.length > 0) {
        const itemsToCreate = added.map(item => ({
          itinerary_id: item.itinerary_id,
          day: item.day,
          time: item.time,
          type: item.type,
          name: item.name,
          location: item.location,
          description: item.description,
          cost: item.cost,
          duration: item.duration,
          tips: item.tips,
          image_url: item.image_url,
          order_idx: item.order_idx
        }))
        await batchCreateItineraryItems(itemsToCreate)
      }

      if (updated.length > 0) {
        const updates = updated.map(item => ({
          id: item.id,
          data: {
            day: item.day,
            time: item.time,
            type: item.type,
            name: item.name,
            location: item.location,
            description: item.description,
            cost: item.cost,
            duration: item.duration,
            tips: item.tips,
            order_idx: item.order_idx
          }
        }))
        await batchUpdateItineraryItems(updates)
      }

      if (deleted.length > 0) {
        await batchDeleteItineraryItems(deleted.map(item => item.id))
      }

      markAsSaved()

      await loadItinerary()

      if (pendingExit) {
        exitEditMode()
        setPendingExit(false)
      }
    } catch (err) {
      console.error('保存失败:', err)
      alert('保存失败，请重试')
    }
  }, [getChangedItems, markAsSaved, loadItinerary, pendingExit, exitEditMode])

  const handleDiscardChanges = useCallback(() => {
    exitEditMode()
    setShowUnsavedModal(false)
    setPendingExit(false)
  }, [exitEditMode])

  const handleAddItem = useCallback((day: number) => {
    addItem(day, {
      time: '09:00',
      type: 'attraction',
      name: '',
      location: { address: '', lat: 0, lng: 0 },
      description: null,
      cost: null,
      duration: null,
      tips: null,
      image_url: null
    })
  }, [addItem])

  const displayItems = isEditMode ? editItems.filter(i => !i.isDeleted) : items

  const dailySchedule: DailyScheduleBuilt[] = useMemo(() => {
    if (!itinerary) return []
    return buildDailySchedule(itinerary.start_date, itinerary.end_date, displayItems)
  }, [itinerary, displayItems])

  const budgetBreakdown = useMemo(() => {
    return buildBudgetBreakdown(displayItems)
  }, [displayItems])

  const stats = useMemo(() => {
    if (!itinerary) return null

    const startDate = new Date(itinerary.start_date)
    const endDate = new Date(itinerary.end_date)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const itemsByType: Record<string, number> = {}
    displayItems.forEach(item => {
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1
    })

    return {
      totalDays,
      totalCost: budgetBreakdown.total,
      totalItems: displayItems.length,
      itemsByType
    }
  }, [itinerary, displayItems, budgetBreakdown])

  if (loading) {
    return <ItineraryDetailSkeleton />
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
            <Button onClick={() => navigate('/itineraries')} className="w-full">
              返回行程列表
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!itinerary) {
    return null
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => {
              if (hasUnsavedChanges) {
                setShowUnsavedModal(true)
                setPendingExit(true)
              } else {
                navigate('/itineraries')
              }
            }}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{itinerary.title}</h1>
          <p className="mt-2 text-gray-600">{itinerary.destination}</p>
        </div>
        <div className="flex items-center gap-2">
          <EditToolbar
            isEditMode={isEditMode}
            hasUnsavedChanges={hasUnsavedChanges}
            canUndo={canUndo()}
            canRedo={canRedo()}
            isSaving={isSaving}
            onEnterEdit={handleEnterEditMode}
            onExitEdit={handleExitEditMode}
            onSave={handleSave}
            onUndo={undo}
            onRedo={redo}
          />
          {!isEditMode && itinerary && (
            <ExportButton
              itinerary={itinerary}
              dailySchedule={dailySchedule}
              budgetBreakdown={budgetBreakdown}
            />
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>行程概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">行程天数</p>
                <p className="font-semibold">{stats?.totalDays} 天</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">目的地</p>
                <p className="font-semibold">{itinerary.destination}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">同行人数</p>
                <p className="font-semibold">{itinerary.participants} 人</p>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">预算</p>
                <p className="font-semibold">¥{itinerary.budget.toLocaleString()}</p>
              </div>
            </div>
          </div>
          {(itinerary.travelers_type || itinerary.accommodation_pref || itinerary.pace) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              {itinerary.travelers_type && (
                <div className="flex items-center">
                  <UserCircle className="h-5 w-5 text-indigo-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">人员构成</p>
                    <p className="font-semibold">
                      {TravelersTypeLabels[itinerary.travelers_type as TravelersType] || itinerary.travelers_type}
                    </p>
                  </div>
                </div>
              )}
              {itinerary.accommodation_pref && (
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-teal-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">住宿偏好</p>
                    <p className="font-semibold">
                      {AccommodationPreferenceLabels[itinerary.accommodation_pref as AccommodationPreference] || itinerary.accommodation_pref}
                    </p>
                  </div>
                </div>
              )}
              {itinerary.pace && (
                <div className="flex items-center">
                  <Gauge className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">行程节奏</p>
                    <p className="font-semibold">
                      {PaceTypeLabels[itinerary.pace as PaceType] || itinerary.pace}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">每日行程</h2>
        {!isEditMode && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              列表视图
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'primary' : 'outline'}
              onClick={() => setViewMode('timeline')}
            >
              时间轴视图
            </Button>
            <Button
              variant={viewMode === 'map' ? 'primary' : 'outline'}
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-1" />
              地图视图
            </Button>
          </div>
        )}
      </div>

      {!isEditMode && viewMode !== 'map' && (
        <div className="mb-4">
          <Button variant="ghost" onClick={toggleAllDays}>
            {expandedDays.size === dailySchedule.length ? '折叠全部' : '展开全部'}
          </Button>
        </div>
      )}

      {isEditMode || viewMode === 'list' ? (
        <ListView
          dailySchedule={dailySchedule}
          expandedDays={expandedDays}
          onToggleDay={toggleDay}
          isEditMode={isEditMode}
          editingItemId={editingItemId}
          onEditItem={setEditingItem}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onAddItem={handleAddItem}
          onReorderItems={reorderItems}
        />
      ) : viewMode === 'timeline' ? (
        <TimelineView
          dailySchedule={dailySchedule}
          expandedDays={expandedDays}
          onToggleDay={toggleDay}
        />
      ) : (
        <div ref={mapContainerRef}>
          {mapInView ? (
            <Suspense fallback={<div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg"><ItineraryDetailSkeleton /></div>}>
              <ItineraryMapView items={displayItems} />
            </Suspense>
          ) : (
            <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">滚动到此处加载地图</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>预算分解</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/itineraries/${id}/expenses`)}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              费用管理
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <BudgetRow label="交通" amount={budgetBreakdown.transport} total={budgetBreakdown.total} />
            <BudgetRow label="住宿" amount={budgetBreakdown.accommodation} total={budgetBreakdown.total} />
            <BudgetRow label="餐饮" amount={budgetBreakdown.food} total={budgetBreakdown.total} />
            <BudgetRow label="门票" amount={budgetBreakdown.tickets} total={budgetBreakdown.total} />
            <BudgetRow label="购物" amount={budgetBreakdown.shopping} total={budgetBreakdown.total} />
            <BudgetRow label="其他" amount={budgetBreakdown.other} total={budgetBreakdown.total} />
            <div className="border-t pt-3 mt-3 flex justify-between font-bold">
              <span>总计</span>
              <span>¥{budgetBreakdown.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>行程统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">活动数量</p>
                <p className="font-semibold">{stats?.totalItems} 个</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">预估花费</p>
                <p className="font-semibold">¥{stats?.totalCost.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">日均花费</p>
                <p className="font-semibold">
                  ¥{stats && stats.totalDays > 0
                    ? Math.round(stats.totalCost / stats.totalDays).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => {
          setShowUnsavedModal(false)
          setPendingExit(false)
        }}
        onSave={handleSave}
        onDiscard={handleDiscardChanges}
        isSaving={isSaving}
      />
    </div>
  )
}

interface BudgetRowProps {
  label: string
  amount: number
  total: number
}

function BudgetRow({ label, amount, total }: BudgetRowProps) {
  const percentage = total > 0 ? Math.round((amount / total) * 100) : 0

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">{label}</span>
        <span className="text-xs text-gray-400">({percentage}%)</span>
      </div>
      <span className="font-semibold">¥{amount.toLocaleString()}</span>
    </div>
  )
}
