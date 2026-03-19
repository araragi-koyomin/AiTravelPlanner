import type { DailyScheduleBuilt, ItineraryItem } from '@/services/itinerary'
import { ActivityTypeLabels } from '@/types/itinerary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Lightbulb } from 'lucide-react'

interface ListViewProps {
  dailySchedule: DailyScheduleBuilt[]
  expandedDays: Set<number>
  onToggleDay: (dayIndex: number) => void
}

export function ListView({ dailySchedule, expandedDays, onToggleDay }: ListViewProps) {
  return (
    <div className="space-y-4">
      {dailySchedule.map((day, dayIndex) => {
        const isExpanded = expandedDays.has(dayIndex)

        return (
          <Card key={day.date}>
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onToggleDay(dayIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">
                    D{day.day}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{day.theme}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {day.dayOfWeek} · {day.date}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                {day.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无行程安排</p>
                ) : (
                  <div className="space-y-4">
                    {day.items.map((item) => (
                      <ItineraryItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

interface ItineraryItemCardProps {
  item: ItineraryItem
}

function ItineraryItemCard({ item }: ItineraryItemCardProps) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white shadow-sm">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-blue-600">
            {item.time}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
            {ActivityTypeLabels[item.type]}
          </span>
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">
          {item.name}
        </h4>
        {item.location?.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <MapPin className="h-4 w-4" />
            <span>{item.location.address}</span>
          </div>
        )}
        {item.description && (
          <p className="text-sm text-gray-600 mb-2">
            {item.description}
          </p>
        )}
        {item.tips && (
          <div className="flex items-start gap-2 text-sm text-amber-700 mb-2 bg-amber-50 p-2 rounded">
            <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{item.tips}</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-semibold">
              ¥{(item.cost || 0).toLocaleString()}
            </span>
          </div>
          {item.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600">
                {item.duration} 分钟
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
