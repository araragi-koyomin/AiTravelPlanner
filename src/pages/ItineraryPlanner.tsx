import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/Card'
import { VoiceInput } from '@/components/voice'
import {
  ItineraryFormData,
  ItineraryFormErrors,
  TravelPreference,
  TravelersType,
  AccommodationPreference,
  PaceType,
  TravelersTypeLabels,
  AccommodationPreferenceLabels,
  PaceTypeLabels,
  getPreferenceLabel,
  DEFAULT_FORM_DATA
} from '@/types/itinerary'
import { validateItineraryForm, isFormValid } from '@/utils/itineraryValidation'
import { generateItinerary, getAIErrorMessage } from '@/services/ai'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/services/supabase'
import { parseVoiceToItinerary, mapParsedToFormData } from '@/utils/voiceParser'

const FORM_STORAGE_KEY = 'itineraryFormData'

export function ItineraryPlanner() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState<ItineraryFormData>(DEFAULT_FORM_DATA)
  const [errors, setErrors] = useState<ItineraryFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showVoiceInput, setShowVoiceInput] = useState(false)

  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.preferences && Array.isArray(parsed.preferences)) {
          parsed.preferences = parsed.preferences.filter(
            (p: string) => Object.values(TravelPreference).includes(p as TravelPreference)
          ) as TravelPreference[]
        }
        setFormData(parsed)
      } catch {
        localStorage.removeItem(FORM_STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
    } catch (error) {
      console.warn('无法保存表单数据到 localStorage:', error)
    }
  }, [formData])

  const handleInputChange = useCallback(
    (field: keyof ItineraryFormData, value: string | TravelPreference[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setTouched((prev) => ({ ...prev, [field]: true }))

      const newFormData = { ...formData, [field]: value }
      const newErrors = validateItineraryForm(newFormData)
      setErrors(newErrors)
    },
    [formData]
  )

  const handleBlur = useCallback(
    (field: keyof ItineraryFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const newErrors = validateItineraryForm(formData)
      setErrors(newErrors)
    },
    [formData]
  )

  const handlePreferenceToggle = useCallback(
    (preference: TravelPreference) => {
      const newPreferences = formData.preferences.includes(preference)
        ? formData.preferences.filter((p) => p !== preference)
        : [...formData.preferences, preference]
      handleInputChange('preferences', newPreferences)
    },
    [formData.preferences, handleInputChange]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!isAuthenticated || !user) {
        setSubmitError('请先登录后再生成行程')
        navigate('/login')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSubmitError('登录状态已过期，请重新登录')
        navigate('/login')
        return
      }

      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError || !refreshedSession) {
        console.error('刷新 session 失败:', refreshError)
        setSubmitError('登录状态已过期，请重新登录')
        navigate('/login')
        return
      }

      console.log('当前用户 ID:', user.id)
      console.log('Session access_token 存在:', !!refreshedSession.access_token)

      const validationErrors = validateItineraryForm(formData)
      setErrors(validationErrors)
      setTouched({
        destination: true,
        startDate: true,
        endDate: true,
        budget: true,
        participants: true,
        preferences: true
      })

      if (Object.keys(validationErrors).length > 0) {
        return
      }

      setIsSubmitting(true)
      setSubmitError(null)

      try {
        const result = await generateItinerary({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: Number(formData.budget),
          participants: Number(formData.participants),
          preferences: formData.preferences,
          specialRequirements: formData.specialRequirements || undefined,
          travelersType: formData.travelersType,
          accommodation: formData.accommodation,
          pace: formData.pace,
          userId: user.id
        })

        if (result.success && result.itinerary) {
          localStorage.removeItem(FORM_STORAGE_KEY)
          navigate(`/itineraries/${result.itinerary.id}`)
        } else {
          setSubmitError(result.error || '生成行程失败，请稍后重试')
        }
      } catch (error) {
        console.error('生成行程失败:', error)
        setSubmitError(getAIErrorMessage(error))
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, navigate, isAuthenticated, user]
  )

  const handleReset = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA)
    setErrors({})
    setTouched({})
    localStorage.removeItem(FORM_STORAGE_KEY)
  }, [])

  const handleVoiceResult = useCallback((text: string) => {
    const parsed = parseVoiceToItinerary(text)
    const formUpdate = mapParsedToFormData(parsed)
    
    setFormData((prev) => ({
      ...prev,
      destination: formUpdate.destination || prev.destination,
      startDate: formUpdate.startDate || prev.startDate,
      endDate: formUpdate.endDate || prev.endDate,
      budget: formUpdate.budget || prev.budget,
      participants: formUpdate.participants || prev.participants,
      specialRequirements: formUpdate.specialRequirements || prev.specialRequirements,
      travelersType: formUpdate.travelersType || prev.travelersType,
      accommodation: formUpdate.accommodation || prev.accommodation,
      pace: formUpdate.pace || prev.pace,
      preferences: formUpdate.preferences || prev.preferences
    }))

    setTouched({
      destination: true,
      startDate: true,
      endDate: true,
      budget: true,
      participants: true,
      preferences: true,
      travelersType: true,
      accommodation: true,
      pace: true
    })

    const newFormData = {
      ...formData,
      destination: formUpdate.destination || formData.destination,
      startDate: formUpdate.startDate || formData.startDate,
      endDate: formUpdate.endDate || formData.endDate,
      budget: formUpdate.budget || formData.budget,
      participants: formUpdate.participants || formData.participants,
      preferences: formUpdate.preferences || formData.preferences
    }
    const newErrors = validateItineraryForm(newFormData)
    setErrors(newErrors)
    setShowVoiceInput(false)
  }, [formData])

  const today = new Date().toISOString().split('T')[0]
  const minEndDate = formData.startDate || today

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">创建旅行计划</CardTitle>
          <CardDescription>
            填写您的旅行需求，AI 将为您生成个性化的旅行计划
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVoiceInput(!showVoiceInput)}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {showVoiceInput ? '关闭语音输入' : '语音输入'}
            </Button>
            <span className="text-sm text-gray-500">
              使用语音快速填写表单
            </span>
          </div>

          {showVoiceInput && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                语音输入行程需求
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                例如："我想去北京旅游，从2024年5月1日到5月3日，预算5000元，2个人"
              </p>
              <VoiceInput
                onResult={handleVoiceResult}
                onError={(error) => setSubmitError(error)}
                placeholder="点击麦克风开始说话..."
                maxDuration={30000}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                role="alert"
              >
                {submitError}
              </div>
            )}
            <div>
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                目的地 <span className="text-red-500">*</span>
              </label>
              <Input
                id="destination"
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                onBlur={() => handleBlur('destination')}
                placeholder="请输入目的地，如：日本东京"
                error={touched.destination && !!errors.destination}
                aria-describedby={errors.destination ? 'destination-error' : undefined}
              />
              {touched.destination && errors.destination && (
                <p id="destination-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.destination}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  出发日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  onBlur={() => handleBlur('startDate')}
                  min={today}
                  error={touched.startDate && !!errors.startDate}
                  aria-describedby={errors.startDate ? 'startDate-error' : undefined}
                />
                {touched.startDate && errors.startDate && (
                  <p id="startDate-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  返回日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  onBlur={() => handleBlur('endDate')}
                  min={minEndDate}
                  error={touched.endDate && !!errors.endDate}
                  aria-describedby={errors.endDate ? 'endDate-error' : undefined}
                />
                {touched.endDate && errors.endDate && (
                  <p id="endDate-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  预算（元） <span className="text-red-500">*</span>
                </label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  onBlur={() => handleBlur('budget')}
                  placeholder="请输入预算"
                  min="1"
                  max="1000000"
                  error={touched.budget && !!errors.budget}
                  aria-describedby={errors.budget ? 'budget-error' : undefined}
                />
                {touched.budget && errors.budget && (
                  <p id="budget-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.budget}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="participants"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  同行人数 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="participants"
                  type="number"
                  value={formData.participants}
                  onChange={(e) => handleInputChange('participants', e.target.value)}
                  onBlur={() => handleBlur('participants')}
                  placeholder="请输入同行人数"
                  min="1"
                  max="20"
                  error={touched.participants && !!errors.participants}
                  aria-describedby={errors.participants ? 'participants-error' : undefined}
                />
                {touched.participants && errors.participants && (
                  <p id="participants-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.participants}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  人员构成
                </label>
                <select
                  value={formData.travelersType}
                  onChange={(e) => handleInputChange('travelersType', e.target.value as TravelersType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(TravelersTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住宿偏好
                </label>
                <select
                  value={formData.accommodation}
                  onChange={(e) => handleInputChange('accommodation', e.target.value as AccommodationPreference)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(AccommodationPreferenceLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  行程节奏
                </label>
                <select
                  value={formData.pace}
                  onChange={(e) => handleInputChange('pace', e.target.value as PaceType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(PaceTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                旅行偏好 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(TravelPreference).map((preference) => (
                  <label
                    key={preference}
                    className={`
                      flex items-center justify-center px-4 py-2 rounded-lg border cursor-pointer transition-colors
                      ${formData.preferences.includes(preference)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferences.includes(preference)}
                      onChange={() => handlePreferenceToggle(preference)}
                      className="sr-only"
                      aria-label={getPreferenceLabel(preference)}
                    />
                    <span className="text-sm font-medium">{getPreferenceLabel(preference)}</span>
                  </label>
                ))}
              </div>
              {touched.preferences && errors.preferences && (
                <p id="preferences-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.preferences}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="specialRequirements"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                特殊需求（可选）
              </label>
              <textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                placeholder="如有特殊需求，请在此说明，如：带小孩、老人、需要无障碍设施等"
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                aria-describedby="special-requirements-count"
              />
              <p id="special-requirements-count" className="mt-1 text-xs text-gray-500">
                {formData.specialRequirements.length}/500 字符
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              {!isAuthenticated && (
                <p className="text-sm text-amber-600 w-full mb-2">
                  请先 <button type="button" onClick={() => navigate('/login')} className="text-primary-500 hover:underline">登录</button> 后再生成行程
                </p>
              )}
              <Button
                type="submit"
                disabled={!isFormValid(errors, formData) || isSubmitting || !isAuthenticated}
                className="flex-1"
              >
                {isSubmitting ? 'AI 正在生成行程...' : '生成行程'}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                重置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
