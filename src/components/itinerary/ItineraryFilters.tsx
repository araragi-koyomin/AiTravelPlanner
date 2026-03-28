import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import { Badge } from '@/components/ui/Badge'
import { Filter, X, Calendar, MapPin, Heart, Tag } from 'lucide-react'
import type { ItineraryFilterOptions, DateRangeType } from '@/stores/itineraryListStore'
import type { ItineraryStatus } from '@/types/itinerary'
import { ItineraryStatusLabels } from '@/types/itinerary'

interface ItineraryFiltersProps {
  filters: ItineraryFilterOptions
  onChange: (filters: ItineraryFilterOptions) => void
  destinations: string[]
  onReset: () => void
}

const dateRangeOptions: { value: DateRangeType; label: string }[] = [
  { value: 'all', label: '全部行程' },
  { value: 'upcoming', label: '即将出发' },
  { value: 'ongoing', label: '进行中' },
  { value: 'ended', label: '已结束' },
  { value: 'custom', label: '自定义日期' }
]

const favoriteOptions: { value: boolean | undefined; label: string }[] = [
  { value: undefined, label: '全部' },
  { value: true, label: '已收藏' },
  { value: false, label: '未收藏' }
]

const statusOptions: ItineraryStatus[] = ['draft', 'generated', 'in_progress', 'completed', 'archived']

export function ItineraryFilters({
  filters,
  onChange,
  destinations,
  onReset
}: ItineraryFiltersProps) {
  const [customStartDate, setCustomStartDate] = useState(
    filters.dateRange?.startDate || ''
  )
  const [customEndDate, setCustomEndDate] = useState(
    filters.dateRange?.endDate || ''
  )

  const activeFilterCount = countActiveFilters(filters)

  const handleDateRangeTypeChange = useCallback(
    (type: DateRangeType) => {
      onChange({
        ...filters,
        dateRange: {
          type,
          startDate: type === 'custom' ? customStartDate : undefined,
          endDate: type === 'custom' ? customEndDate : undefined
        }
      })
    },
    [filters, onChange, customStartDate, customEndDate]
  )

  const handleCustomDateChange = useCallback(() => {
    onChange({
      ...filters,
      dateRange: {
        type: 'custom',
        startDate: customStartDate,
        endDate: customEndDate
      }
    })
  }, [filters, onChange, customStartDate, customEndDate])

  const handleDestinationToggle = useCallback(
    (destination: string) => {
      const currentDestinations = filters.destinations || []
      const newDestinations = currentDestinations.includes(destination)
        ? currentDestinations.filter((d) => d !== destination)
        : [...currentDestinations, destination]

      onChange({
        ...filters,
        destinations: newDestinations.length > 0 ? newDestinations : undefined
      })
    },
    [filters, onChange]
  )

  const handleFavoriteChange = useCallback(
    (value: boolean | undefined) => {
      onChange({
        ...filters,
        isFavorite: value
      })
    },
    [filters, onChange]
  )

  const handleStatusToggle = useCallback(
    (status: ItineraryStatus) => {
      const currentStatus = filters.status || []
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status]

      onChange({
        ...filters,
        status: newStatus.length > 0 ? newStatus : undefined
      })
    },
    [filters, onChange]
  )

  const handleReset = useCallback(() => {
    setCustomStartDate('')
    setCustomEndDate('')
    onReset()
  }, [onReset])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" />
              日期
              {filters.dateRange?.type !== 'all' && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {dateRangeOptions.find((o) => o.value === filters.dateRange?.type)?.label}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>按日期筛选</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dateRangeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleDateRangeTypeChange(option.value)}
                className={filters.dateRange?.type === option.value ? 'bg-accent' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            {filters.dateRange?.type === 'custom' && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    placeholder="开始日期"
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    placeholder="结束日期"
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleCustomDateChange} className="w-full">
                    应用
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {destinations.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <MapPin className="h-4 w-4" />
                目的地
                {filters.destinations && filters.destinations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {filters.destinations.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>选择目的地</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {destinations.map((destination) => (
                <DropdownMenuItem
                  key={destination}
                  onClick={() => handleDestinationToggle(destination)}
                  className={filters.destinations?.includes(destination) ? 'bg-accent' : ''}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 border rounded ${
                        filters.destinations?.includes(destination)
                          ? 'bg-primary border-primary'
                          : ''
                      }`}
                    />
                    {destination}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Heart className="h-4 w-4" />
              收藏
              {filters.isFavorite !== undefined && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {filters.isFavorite ? '已收藏' : '未收藏'}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>收藏状态</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {favoriteOptions.map((option) => (
              <DropdownMenuItem
                key={String(option.value)}
                onClick={() => handleFavoriteChange(option.value)}
                className={filters.isFavorite === option.value ? 'bg-accent' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Tag className="h-4 w-4" />
              状态
              {filters.status && filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>行程状态</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusToggle(status)}
                className={filters.status?.includes(status) ? 'bg-accent' : ''}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 border rounded ${
                      filters.status?.includes(status) ? 'bg-primary border-primary' : ''
                    }`}
                  />
                  {ItineraryStatusLabels[status]}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-gray-500">
            <X className="h-4 w-4" />
            清除筛选
          </Button>
        )}
      </div>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>已应用 {activeFilterCount} 个筛选条件</span>
        </div>
      )}
    </div>
  )
}

function countActiveFilters(filters: ItineraryFilterOptions): number {
  let count = 0

  if (filters.dateRange?.type !== 'all' && filters.dateRange?.type !== undefined) {
    count++
  }

  if (filters.destinations && filters.destinations.length > 0) {
    count++
  }

  if (filters.isFavorite !== undefined) {
    count++
  }

  if (filters.status && filters.status.length > 0) {
    count++
  }

  return count
}
