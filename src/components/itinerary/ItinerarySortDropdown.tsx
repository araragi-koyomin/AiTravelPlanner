import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { ItinerarySortOptions, ItinerarySortField } from '@/stores/itineraryListStore'

interface ItinerarySortDropdownProps {
  sort: ItinerarySortOptions
  onChange: (sort: ItinerarySortOptions) => void
}

const sortFieldOptions: { value: ItinerarySortField; label: string }[] = [
  { value: 'created_at', label: '创建时间' },
  { value: 'start_date', label: '出发日期' },
  { value: 'budget', label: '预算' },
  { value: 'days', label: '行程天数' },
  { value: 'title', label: '标题' }
]

export function ItinerarySortDropdown({ sort, onChange }: ItinerarySortDropdownProps) {
  const handleFieldChange = (field: ItinerarySortField) => {
    if (sort.field === field) {
      onChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })
    } else {
      onChange({ field, order: 'desc' })
    }
  }

  const currentFieldLabel = sortFieldOptions.find((o) => o.value === sort.field)?.label || '创建时间'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">{currentFieldLabel}</span>
          {sort.order === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>排序方式</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortFieldOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleFieldChange(option.value)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {sort.field === option.value && (
              sort.order === 'asc' ? (
                <ArrowUp className="h-4 w-4 text-primary" />
              ) : (
                <ArrowDown className="h-4 w-4 text-primary" />
              )
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
