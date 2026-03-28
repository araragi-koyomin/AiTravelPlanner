import { memo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { MapPin, Calendar, Users, DollarSign, Heart, Trash2, Eye, Copy, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import type { Itinerary } from '@/services/itinerary'
import type { ViewMode } from '@/stores/itineraryListStore'
import { ItineraryStatusLabels } from '@/types/itinerary'

interface ItineraryCardProps {
  itinerary: Itinerary
  viewMode: ViewMode
  isSelected?: boolean
  isBatchMode?: boolean
  onSelect?: (id: string) => void
  onView: (id: string) => void
  onDelete: (id: string) => void
  onCopy: (id: string) => void
  onToggleFavorite: (id: string, currentStatus: boolean) => void
}

export const ItineraryCard = memo(function ItineraryCard({
  itinerary,
  viewMode,
  isSelected = false,
  isBatchMode = false,
  onSelect,
  onView,
  onDelete,
  onCopy,
  onToggleFavorite
}: ItineraryCardProps) {
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  const calculateDays = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }, [])

  const handleCardClick = useCallback(() => {
    if (isBatchMode && onSelect) {
      onSelect(itinerary.id)
    } else {
      onView(itinerary.id)
    }
  }, [isBatchMode, onSelect, itinerary.id, onView])

  const handleSelectChange = useCallback(
    (_checked: boolean) => {
      if (onSelect) {
        onSelect(itinerary.id)
      }
    },
    [onSelect, itinerary.id]
  )

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
          isSelected ? 'bg-primary/5 border-primary' : ''
        }`}
        onClick={handleCardClick}
      >
        {isBatchMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            onClick={(e) => e.stopPropagation()}
            aria-label={`选择 ${itinerary.title}`}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{itinerary.title}</h3>
            {itinerary.is_favorite && <Heart className="h-4 w-4 fill-red-500 text-red-500" />}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {itinerary.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ¥{itinerary.budget.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{ItineraryStatusLabels[itinerary.status as keyof typeof ItineraryStatusLabels] || itinerary.status}</Badge>
          <Badge variant="secondary">{calculateDays(itinerary.start_date, itinerary.end_date)}天</Badge>

          {!isBatchMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(itinerary.id)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  查看
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopy(itinerary.id)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(itinerary.id, itinerary.is_favorite)
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {itinerary.is_favorite ? '取消收藏' : '收藏'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(itinerary.id)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card
      className={`relative group hover:shadow-lg transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleCardClick}
    >
      {isBatchMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            onClick={(e) => e.stopPropagation()}
            aria-label={`选择 ${itinerary.title}`}
          />
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(itinerary.id, itinerary.is_favorite)
        }}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={itinerary.is_favorite ? '取消收藏' : '收藏'}
      >
        <Heart
          className={`h-5 w-5 ${
            itinerary.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
          }`}
        />
      </button>

      <CardHeader>
        <div className="flex items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">{itinerary.title}</CardTitle>
        </div>
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
            onClick={(e) => {
              e.stopPropagation()
              onView(itinerary.id)
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            查看
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onCopy(itinerary.id)
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(itinerary.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
