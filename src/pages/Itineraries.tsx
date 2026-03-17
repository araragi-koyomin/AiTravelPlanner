import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getItineraries, deleteItinerary, toggleFavorite, type Itinerary } from '@/services/itinerary'
import { useAuthStore } from '@/stores/authStore'
import { ItinerariesPageSkeleton } from '@/components/ui/Skeleton'
import { MapPin, Calendar, Users, DollarSign, Heart, Trash2, Eye } from 'lucide-react'

export function Itineraries() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个行程吗？此操作不可撤销。')) {
      return
    }

    try {
      await deleteItinerary(id)
      setItineraries((prev: Itinerary[]) => prev.filter((item: Itinerary) => item.id !== id))
    } catch (err) {
      console.error('删除行程失败:', err)
      alert('删除行程失败，请重试')
    }
  }

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(id)
      setItineraries((prev: Itinerary[]) =>
        prev.map((item: Itinerary) =>
          item.id === id ? { ...item, is_favorite: !currentStatus } : item
        )
      )
    } catch (err) {
      console.error('更新收藏状态失败:', err)
      alert('更新收藏状态失败，请重试')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

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
    <div className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的行程</h1>
          <p className="mt-2 text-gray-600">管理您的旅行计划</p>
        </div>
        <Link to="/itineraries/new">
          <Button>创建新行程</Button>
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>创建新行程</CardTitle>
            <CardDescription>开始规划您的下一次旅行</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 text-6xl">✈️</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  还没有行程
                </h3>
                <p className="mb-6 text-gray-600">
                  创建您的第一个旅行计划，让 AI 帮助您规划完美的行程
                </p>
                <Link to="/itineraries/new">
                  <Button>创建行程</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {itineraries.map((itinerary: Itinerary) => (
            <Card key={itinerary.id} className="relative group hover:shadow-lg transition-shadow">
              <button
                onClick={() => handleToggleFavorite(itinerary.id, itinerary.is_favorite)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 ${itinerary.is_favorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-400'
                    }`}
                />
              </button>

              <CardHeader className="cursor-pointer" onClick={() => navigate(`/itineraries/${itinerary.id}`)}>
                <CardTitle className="text-lg line-clamp-1">{itinerary.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {itinerary.destination}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>
                      {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
                      <span className="ml-2 text-blue-600">
                        ({calculateDays(itinerary.start_date, itinerary.end_date)}天)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{itinerary.participants} 人同行</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>预算 ¥{itinerary.budget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/itineraries/${itinerary.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(itinerary.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
