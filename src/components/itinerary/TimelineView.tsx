import type { DailyScheduleBuilt, ItineraryItem } from '@/services/itinerary'
import { ActivityTypeLabels } from '@/types/itinerary'
import { ChevronDown, ChevronUp, MapPin, Clock, DollarSign } from 'lucide-react'

interface TimelineViewProps {
  dailySchedule: DailyScheduleBuilt[]
  expandedDays: Set<number>
  onToggleDay: (dayIndex: number) => void
}

export function TimelineView({ dailySchedule, expandedDays, onToggleDay }: TimelineViewProps) {
  return (
    <div className="space-y-8">
      {dailySchedule.map((day, dayIndex) => {
        const isExpanded = expandedDays.has(dayIndex)

        return (
          <div key={day.date} className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl shadow-lg">
                {day.date.slice(8, 10)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{day.theme}</h3>
                <p className="text-gray-600">{day.dayOfWeek} · {day.date}</p>
              </div>
              <button
                onClick={() => onToggleDay(dayIndex)}
                className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>

            {isExpanded && (
              <div className="ml-8 relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" />

                {day.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 ml-4">暂无行程安排</p>
                ) : (
                  <div className="space-y-6">
                    {day.items.map((item) => (
                      <TimelineItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

interface TimelineItemCardProps {
  item: ItineraryItem
}

function TimelineItemCard({ item }: TimelineItemCardProps) {
  return (
    <div className="relative flex gap-4">
      <div className="flex-shrink-0 relative z-10">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
          {item.time.slice(0, 2)}
        </div>
      </div>

      <div className="flex-grow p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-blue-600">
            {item.time}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
            {ActivityTypeLabels[item.type]}
          </span>
        </div>
        <h4 className="font-semibold text-gray-900 mb-2">
          {item.name}
        </h4>
        {item.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{item.address}</span>
          </div>
        )}
        {item.description && (
          <p className="text-sm text-gray-600 mb-3">
            {item.description}
          </p>
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
