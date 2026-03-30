import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ExportModal } from './ExportModal'
import type { Itinerary, DailyScheduleBuilt, BudgetBreakdown } from '@/services/itinerary'

interface ExportButtonProps {
  itinerary: Itinerary
  dailySchedule: DailyScheduleBuilt[]
  budgetBreakdown: BudgetBreakdown
  disabled?: boolean
  containerRef?: React.RefObject<HTMLElement | null>
}

export function ExportButton({
  itinerary,
  dailySchedule,
  budgetBreakdown,
  disabled = false,
  containerRef
}: ExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        导出
      </Button>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itinerary={itinerary}
        dailySchedule={dailySchedule}
        budgetBreakdown={budgetBreakdown}
        containerRef={containerRef}
      />
    </>
  )
}
