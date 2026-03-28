import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface AddItemButtonProps {
  day: number
  onClick: (day: number) => void
  disabled?: boolean
}

export function AddItemButton({ day, onClick, disabled = false }: AddItemButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(day)}
      disabled={disabled}
      className="w-full border-dashed border-gray-300 text-gray-500 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50"
    >
      <Plus className="h-4 w-4 mr-1" />
      添加行程项
    </Button>
  )
}
