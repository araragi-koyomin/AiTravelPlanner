import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ApiKeyType, ApiKeyConfig, ApiKeyField } from '@/types/settings'
import { maskApiKey, hasApiKey, API_KEY_CONFIGS } from '@/types/settings'

interface ApiKeyValues {
  [key: string]: string
}

interface ApiKeyItemProps {
  config: ApiKeyConfig
  currentValues: ApiKeyValues
  onUpdate: (values: ApiKeyValues) => Promise<void>
  onDelete: () => Promise<void>
  onShowKey: (field: string) => Promise<string | null>
  isLoading?: boolean
}

function ApiKeyItem({ config, currentValues, onUpdate, onDelete, onShowKey, isLoading }: ApiKeyItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showingFields, setShowingFields] = useState<Set<string>>(new Set())
  const [fieldValues, setFieldValues] = useState<ApiKeyValues>({})
  const [displayValues, setDisplayValues] = useState<ApiKeyValues>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasAllRequiredKeys = config.fields
    .filter(f => f.required)
    .every(f => hasApiKey(currentValues[f.key]))

  const handleEdit = () => {
    setIsEditing(true)
    setFieldValues({})
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFieldValues({})
    setError(null)
  }

  const handleSave = async () => {
    const missingRequired = config.fields
      .filter(f => f.required)
      .filter(f => !fieldValues[f.key]?.trim())

    if (missingRequired.length > 0) {
      setError(`${missingRequired.map(f => f.label).join('、')} 不能为空`)
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await onUpdate(fieldValues)
      setIsEditing(false)
      setFieldValues({})
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleShowField = async (field: string) => {
    if (showingFields.has(field)) {
      setShowingFields(prev => {
        const next = new Set(prev)
        next.delete(field)
        return next
      })
      setDisplayValues(prev => ({ ...prev, [field]: '' }))
      return
    }

    try {
      const key = await onShowKey(field)
      if (key) {
        setDisplayValues(prev => ({ ...prev, [field]: maskApiKey(key) }))
        setShowingFields(prev => new Set(prev).add(field))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取 Key 失败')
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除此 API Key 配置吗？')) {
      return
    }

    setIsDeleting(true)
    setError(null)
    try {
      await onDelete()
      setShowingFields(new Set())
      setDisplayValues({})
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setIsDeleting(false)
    }
  }

  const renderField = (field: ApiKeyField, isEditingMode: boolean) => {
    const hasKey = hasApiKey(currentValues[field.key])
    const isShowing = showingFields.has(field.key)

    if (isEditingMode) {
      return (
        <div key={field.key} className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <Input
            type="password"
            placeholder={field.placeholder}
            value={fieldValues[field.key] || ''}
            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
            disabled={isSaving || isLoading}
          />
        </div>
      )
    }

    return (
      <div key={field.key} className="flex items-center gap-2">
        <span className="text-sm text-gray-600 w-24">{field.label}:</span>
        {hasKey ? (
          <>
            <div className="flex-1 rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
              {isShowing ? displayValues[field.key] : '••••••••••••••••'}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShowField(field.key)}
              disabled={isLoading}
            >
              {isShowing ? '隐藏' : '显示'}
            </Button>
          </>
        ) : (
          <span className="text-sm text-gray-400">未配置</span>
        )}
      </div>
    )
  }

  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{config.label}</h4>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                hasAllRequiredKeys
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {hasAllRequiredKeys ? '已配置' : '未配置'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{config.description}</p>
        </div>
        <a
          href={config.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 text-sm text-primary-600 hover:text-primary-700"
        >
          获取 API Key →
        </a>
      </div>

      {error && (
        <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="mt-3 space-y-3">
          {config.fields.map(field => renderField(field, true))}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading}
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving || isLoading}
            >
              取消
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {hasAllRequiredKeys && (
            <div className="space-y-2 mb-3">
              {config.fields.map(field => renderField(field, false))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={hasAllRequiredKeys ? 'outline' : 'primary'}
              onClick={handleEdit}
              disabled={isLoading}
            >
              {hasAllRequiredKeys ? '编辑' : '添加'}
            </Button>
            {hasAllRequiredKeys && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
              >
                {isDeleting ? '删除中...' : '删除'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ApiKeySectionProps {
  settings: {
    zhipu_api_key: string | null
    xunfei_api_key: string | null
    xunfei_app_id: string | null
    xunfei_api_secret: string | null
    amap_api_key: string | null
    amap_security_js_code: string | null
  } | null
  onUpdateKey: (type: ApiKeyType, values: Record<string, string>) => Promise<void>
  onDeleteKey: (type: ApiKeyType) => Promise<void>
  onShowKey: (type: ApiKeyType, field: string) => Promise<string | null>
  isLoading?: boolean
}

export function ApiKeySection({ settings, onUpdateKey, onDeleteKey, onShowKey, isLoading }: ApiKeySectionProps) {
  const getCurrentValues = (type: ApiKeyType): ApiKeyValues => {
    switch (type) {
      case 'zhipu':
        return { apiKey: settings?.zhipu_api_key || '' }
      case 'xunfei':
        return {
          appId: settings?.xunfei_app_id || '',
          apiKey: settings?.xunfei_api_key || '',
          apiSecret: settings?.xunfei_api_secret || ''
        }
      case 'amap':
        return {
          key: settings?.amap_api_key || '',
          securityJsCode: settings?.amap_security_js_code || ''
        }
      default:
        return {}
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">API Key 管理</h3>
      <p className="mt-1 text-sm text-gray-500">
        配置第三方服务的 API Key 以启用相关功能
      </p>
      <div className="mt-4">
        {[
          { type: 'zhipu' as ApiKeyType, config: API_KEY_CONFIGS.find(c => c.type === 'zhipu')! },
          { type: 'xunfei' as ApiKeyType, config: API_KEY_CONFIGS.find(c => c.type === 'xunfei')! },
          { type: 'amap' as ApiKeyType, config: API_KEY_CONFIGS.find(c => c.type === 'amap')! }
        ].map(({ type, config }) => (
          <ApiKeyItem
            key={type}
            config={config}
            currentValues={getCurrentValues(type)}
            onUpdate={(values) => onUpdateKey(type, values)}
            onDelete={() => onDeleteKey(type)}
            onShowKey={(field) => onShowKey(type, field)}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}
