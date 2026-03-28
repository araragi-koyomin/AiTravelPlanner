import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { ItineraryItem } from '@/services/itinerary'
import { ActivityTypeLabels, type ActivityType, type LocationData } from '@/types/itinerary'
import { MapPin, Clock, DollarSign, Lightbulb, FileText, Timer, X, Check, Trash2 } from 'lucide-react'

interface ItemEditorProps {
  item: ItineraryItem
  onSave: (data: Partial<ItineraryItem>) => void
  onCancel: () => void
  onDelete?: () => void
  isNew?: boolean
}

interface FormData {
  name: string
  time: string
  type: ActivityType
  location: LocationData
  description: string
  cost: string
  duration: string
  tips: string
}

interface FormErrors {
  name?: string
  time?: string
  cost?: string
}

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/

export function ItemEditor({ item, onSave, onCancel, onDelete, isNew = false }: ItemEditorProps) {
  const [formData, setFormData] = useState<FormData>({
    name: item.name || '',
    time: item.time || '09:00',
    type: item.type || 'attraction',
    location: item.location || { address: '', lat: 0, lng: 0 },
    description: item.description || '',
    cost: item.cost?.toString() || '',
    duration: item.duration?.toString() || '',
    tips: item.tips || ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setFormData({
      name: item.name || '',
      time: item.time || '09:00',
      type: item.type || 'attraction',
      location: item.location || { address: '', lat: 0, lng: 0 },
      description: item.description || '',
      cost: item.cost?.toString() || '',
      duration: item.duration?.toString() || '',
      tips: item.tips || ''
    })
    setErrors({})
    setIsDirty(false)
  }, [item.id, item.cost, item.description, item.duration, item.location, item.name, item.time, item.tips, item.type])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '名称不能为空'
    }

    if (!TIME_REGEX.test(formData.time)) {
      newErrors.time = '时间格式不正确，请使用 HH:MM 格式'
    }

    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      newErrors.cost = '费用必须是数字'
    }

    if (formData.cost && parseFloat(formData.cost) < 0) {
      newErrors.cost = '费用不能为负数'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return

    const data: Partial<ItineraryItem> = {
      name: formData.name.trim(),
      time: formData.time,
      type: formData.type,
      location: formData.location,
      description: formData.description.trim() || null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      duration: formData.duration ? parseInt(formData.duration, 10) : null,
      tips: formData.tips.trim() || null
    }

    onSave(data)
  }, [formData, validateForm, onSave])

  const handleFieldChange = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const handleLocationChange = useCallback((field: keyof LocationData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
    setIsDirty(true)
  }, [])

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {isNew ? '添加行程项' : '编辑行程项'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="请输入名称"
                error={!!errors.name}
                className="pl-10"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              时间 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => handleFieldChange('time', e.target.value)}
                error={!!errors.time}
                className="pl-10"
              />
            </div>
            {errors.time && (
              <p className="mt-1 text-sm text-red-500">{errors.time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleFieldChange('type', e.target.value as ActivityType)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {Object.entries(ActivityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              费用 (元)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleFieldChange('cost', e.target.value)}
                placeholder="0"
                error={!!errors.cost}
                className="pl-10"
              />
            </div>
            {errors.cost && (
              <p className="mt-1 text-sm text-red-500">{errors.cost}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              时长 (分钟)
            </label>
            <div className="relative">
              <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => handleFieldChange('duration', e.target.value)}
                placeholder="60"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            地点
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={formData.location.address}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              placeholder="请输入地址"
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              type="number"
              step="0.000001"
              value={formData.location.lat || ''}
              onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
              placeholder="纬度"
              className="text-xs h-8"
            />
            <Input
              type="number"
              step="0.000001"
              value={formData.location.lng || ''}
              onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
              placeholder="经度"
              className="text-xs h-8"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="请输入描述"
            rows={2}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Lightbulb className="inline h-4 w-4 mr-1 text-amber-500" />
            游玩建议
          </label>
          <textarea
            value={formData.tips}
            onChange={(e) => handleFieldChange('tips', e.target.value)}
            placeholder="请输入游玩建议"
            rows={2}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isDirty}
          >
            <Check className="h-4 w-4 mr-1" />
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
