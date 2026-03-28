import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ItineraryItem } from '@/services/itinerary'
import { ActivityTypeLabels } from '@/types/itinerary'
import { Button } from '@/components/ui/Button'
import { MapPin, Clock, DollarSign, Lightbulb, GripVertical, Edit2, Trash2 } from 'lucide-react'

interface DraggableItemListProps {
  items: ItineraryItem[]
  day: number
  isEditMode: boolean
  onReorder: (day: number, fromIndex: number, toIndex: number) => void
  onEdit: (itemId: string) => void
  onDelete: (itemId: string) => void
  editingItemId?: string | null
}

interface SortableItemProps {
  item: ItineraryItem
  isEditMode: boolean
  onEdit: (itemId: string) => void
  onDelete: (itemId: string) => void
  isEditing?: boolean
}

function SortableItem({ item, isEditMode, onEdit, onDelete, isEditing }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className={`
          flex gap-4 p-4 bg-gray-50 rounded-lg
          ${isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''}
          ${isEditing ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
        `}
      >
        {isEditMode && (
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 flex items-center cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white shadow-sm">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-blue-600">
              {item.time}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
              {ActivityTypeLabels[item.type]}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1 truncate">
            {item.name}
          </h4>
          {item.location?.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.location.address}</span>
            </div>
          )}
          {item.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {item.description}
            </p>
          )}
          {item.tips && (
            <div className="flex items-start gap-2 text-sm text-amber-700 mb-2 bg-amber-50 p-2 rounded">
              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{item.tips}</span>
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

        {isEditMode && (
          <div className="flex-shrink-0 flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item.id)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function DraggableItemList({
  items,
  day,
  isEditMode,
  onReorder,
  onEdit,
  onDelete,
  editingItemId
}: DraggableItemListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const sortedItems = [...items].sort((a, b) => a.order_idx - b.order_idx)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex(item => item.id === active.id)
      const newIndex = sortedItems.findIndex(item => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(day, oldIndex, newIndex)
      }
    }
  }

  if (!isEditMode) {
    return (
      <div className="space-y-4">
        {sortedItems.map(item => (
          <SortableItem
            key={item.id}
            item={item}
            isEditMode={false}
            onEdit={onEdit}
            onDelete={onDelete}
            isEditing={editingItemId === item.id}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sortedItems.map(item => (
            <SortableItem
              key={item.id}
              item={item}
              isEditMode={true}
              onEdit={onEdit}
              onDelete={onDelete}
              isEditing={editingItemId === item.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
