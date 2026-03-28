import { useState } from 'react'
import type { DailyScheduleBuilt, ItineraryItem } from '@/services/itinerary'
import { ActivityTypeLabels } from '@/types/itinerary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Lightbulb } from 'lucide-react'
import { DraggableItemList } from './DraggableItemList'
import { ItemEditor } from './ItemEditor'
import { AddItemButton } from './AddItemButton'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface ListViewProps {
  dailySchedule: DailyScheduleBuilt[]
  expandedDays: Set<number>
  onToggleDay: (dayIndex: number) => void
  isEditMode?: boolean
  editingItemId?: string | null
  onEditItem?: (itemId: string) => void
  onUpdateItem?: (id: string, data: Partial<ItineraryItem>) => void
  onDeleteItem?: (id: string) => void
  onAddItem?: (day: number) => void
  onReorderItems?: (day: number, fromIndex: number, toIndex: number) => void
}

export function ListView({
  dailySchedule,
  expandedDays,
  onToggleDay,
  isEditMode = false,
  editingItemId = null,
  onEditItem,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onReorderItems
}: ListViewProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ItineraryItem | null>(null)

  const handleDeleteClick = (itemId: string) => {
    const item = dailySchedule
      .flatMap(day => day.items)
      .find(item => item.id === itemId)

    if (item) {
      setItemToDelete(item)
      setDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = () => {
    if (itemToDelete && onDeleteItem) {
      onDeleteItem(itemToDelete.id)
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const editingItem = dailySchedule
    .flatMap(day => day.items)
    .find(item => item.id === editingItemId)

  return (
    <>
      <div className="space-y-4">
        {dailySchedule.map((day, dayIndex) => {
          const isExpanded = expandedDays.has(dayIndex)
          const isEditingThisDay = editingItem?.day === day.day

          return (
            <Card key={day.date}>
              <CardHeader
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${isEditMode ? 'cursor-default hover:bg-white' : ''}`}
                onClick={() => !isEditMode && onToggleDay(dayIndex)}
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
                  {!isEditMode && (
                    isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )
                  )}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  {day.items.length === 0 && !isEditMode ? (
                    <p className="text-gray-500 text-center py-4">暂无行程安排</p>
                  ) : (
                    <>
                      {isEditingThisDay && editingItem && onUpdateItem ? (
                        <div className="mb-4">
                          <ItemEditor
                            item={editingItem}
                            onSave={(data) => {
                              onUpdateItem(editingItem.id, data)
                              onEditItem?.('')
                            }}
                            onCancel={() => onEditItem?.('')}
                            onDelete={() => handleDeleteClick(editingItem.id)}
                          />
                        </div>
                      ) : null}

                      <DraggableItemList
                        items={day.items.filter(item => item.id !== editingItemId)}
                        day={day.day}
                        isEditMode={isEditMode}
                        onReorder={onReorderItems || (() => {})}
                        onEdit={onEditItem || (() => {})}
                        onDelete={handleDeleteClick}
                        editingItemId={editingItemId}
                      />

                      {isEditMode && onAddItem && (
                        <div className="mt-4">
                          <AddItemButton day={day.day} onClick={onAddItem} />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ''}
      />
    </>
  )
}

interface ItineraryItemCardProps {
  item: ItineraryItem
}

export function ItineraryItemCard({ item }: ItineraryItemCardProps) {
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
