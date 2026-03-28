import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, X } from 'lucide-react'

interface ItinerarySearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  debounceMs?: number
}

export function ItinerarySearchBar({
  value,
  onChange,
  onClear,
  placeholder = '搜索行程标题、目的地...',
  debounceMs = 300
}: ItinerarySearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange, value])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onClear()
  }, [onClear])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear()
      }
    },
    [handleClear]
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="搜索行程"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          aria-label="清空搜索"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
