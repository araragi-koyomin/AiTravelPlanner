import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  getItineraryById,
  getItineraryItems,
  buildDailySchedule,
  buildBudgetBreakdown,
  type DailyScheduleBuilt,
  type ItineraryItem
} from '@/services/itinerary'
import { useAuthStore } from '@/stores/authStore'
import { ItineraryDetailSkeleton } from '@/components/ui/Skeleton'
import { MapPin, Calendar, Users, DollarSign, Clock, UserCircle, Home, Gauge } from 'lucide-react'
import { ListView } from '@/components/itinerary/ListView'
import { TimelineView } from '@/components/itinerary/TimelineView'
import {
  TravelersTypeLabels,
  AccommodationPreferenceLabels,
  PaceTypeLabels,
  type TravelersType,
  type AccommodationPreference,
  type PaceType
} from '@/types/itinerary'

export function ItineraryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [itinerary, setItinerary] = useState<Awaited<ReturnType<typeof getItineraryById>>>(null)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())

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

  const dailySchedule: DailyScheduleBuilt[] = useMemo(() => {
    if (!itinerary) return []
    return buildDailySchedule(itinerary.start_date, itinerary.end_date, items)
  }, [itinerary, items])

  const budgetBreakdown = useMemo(() => {
    return buildBudgetBreakdown(items)
  }, [items])

  const stats = useMemo(() => {
    if (!itinerary) return null

    const startDate = new Date(itinerary.start_date)
    const endDate = new Date(itinerary.end_date)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const itemsByType: Record<string, number> = {}
    items.forEach(item => {
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1
    })

    return {
      totalDays,
      totalCost: budgetBreakdown.total,
      totalItems: items.length,
      itemsByType
    }
  }, [itinerary, items, budgetBreakdown])

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
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/itineraries')}
          className="mb-4"
        >
          ← 返回
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{itinerary.title}</h1>
        <p className="mt-2 text-gray-600">{itinerary.destination}</p>
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
        </div>
      </div>

      <div className="mb-4">
        <Button variant="ghost" onClick={toggleAllDays}>
          {expandedDays.size === dailySchedule.length ? '折叠全部' : '展开全部'}
        </Button>
      </div>

      {viewMode === 'list' ? (
        <ListView
          dailySchedule={dailySchedule}
          expandedDays={expandedDays}
          onToggleDay={toggleDay}
        />
      ) : (
        <TimelineView
          dailySchedule={dailySchedule}
          expandedDays={expandedDays}
          onToggleDay={toggleDay}
        />
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>预算分解</CardTitle>
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
