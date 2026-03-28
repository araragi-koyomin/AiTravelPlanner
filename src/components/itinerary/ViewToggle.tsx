import { Button } from '@/components/ui/Button'
import { Grid, List } from 'lucide-react'
import type { ViewMode } from '@/stores/itineraryListStore'

interface ViewToggleProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onChange('grid')}
        className="rounded-r-none"
        aria-label="网格视图"
        aria-pressed={viewMode === 'grid'}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="rounded-l-none"
        aria-label="列表视图"
        aria-pressed={viewMode === 'list'}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}
