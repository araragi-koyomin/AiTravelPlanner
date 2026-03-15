import {
  TravelPreference,
  ItineraryFormData,
  ItineraryFormErrors
} from '@/types/itinerary'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateDestination(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: '请输入目的地'
    }
  }

  if (value.trim().length < 2) {
    return {
      isValid: false,
      error: '目的地至少需要 2 个字符'
    }
  }

  return { isValid: true }
}

export function validateDate(
  value: string,
  type: 'start' | 'end',
  startDate?: string
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: type === 'start' ? '请选择出发日期' : '请选择返回日期'
    }
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: '请输入有效的日期'
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  if (date < today) {
    return {
      isValid: false,
      error: '日期不能早于今天'
    }
  }

  if (type === 'end' && startDate) {
    const start = new Date(startDate)
    if (date <= start) {
      return {
        isValid: false,
        error: '返回日期必须晚于出发日期'
      }
    }
  }

  return { isValid: true }
}

export function validateBudget(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: '请输入预算'
    }
  }

  const budget = parseFloat(value)

  if (isNaN(budget)) {
    return {
      isValid: false,
      error: '请输入有效的金额'
    }
  }

  if (budget <= 0) {
    return {
      isValid: false,
      error: '预算必须大于 0'
    }
  }

  if (budget > 1000000) {
    return {
      isValid: false,
      error: '预算不能超过 1,000,000 元'
    }
  }

  return { isValid: true }
}

export function validateParticipants(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: '请输入同行人数'
    }
  }

  const participants = parseInt(value, 10)

  if (isNaN(participants)) {
    return {
      isValid: false,
      error: '请输入有效的人数'
    }
  }

  if (participants < 1) {
    return {
      isValid: false,
      error: '同行人数至少为 1 人'
    }
  }

  if (participants > 20) {
    return {
      isValid: false,
      error: '同行人数不能超过 20 人'
    }
  }

  return { isValid: true }
}

export function validatePreferences(preferences: TravelPreference[]): ValidationResult {
  if (!preferences || preferences.length === 0) {
    return {
      isValid: false,
      error: '请至少选择一个旅行偏好'
    }
  }

  return { isValid: true }
}

export function validateItineraryForm(formData: ItineraryFormData): ItineraryFormErrors {
  const errors: ItineraryFormErrors = {}

  const destinationResult = validateDestination(formData.destination)
  if (!destinationResult.isValid) {
    errors.destination = destinationResult.error
  }

  const startDateResult = validateDate(formData.startDate, 'start')
  if (!startDateResult.isValid) {
    errors.startDate = startDateResult.error
  }

  const endDateResult = validateDate(formData.endDate, 'end', formData.startDate)
  if (!endDateResult.isValid) {
    errors.endDate = endDateResult.error
  }

  const budgetResult = validateBudget(formData.budget)
  if (!budgetResult.isValid) {
    errors.budget = budgetResult.error
  }

  const participantsResult = validateParticipants(formData.participants)
  if (!participantsResult.isValid) {
    errors.participants = participantsResult.error
  }

  const preferencesResult = validatePreferences(formData.preferences)
  if (!preferencesResult.isValid) {
    errors.preferences = preferencesResult.error
  }

  return errors
}

export function isFormValid(errors: ItineraryFormErrors, formData: ItineraryFormData): boolean {
  return (
    Object.keys(errors).length === 0 &&
    formData.destination.trim() !== '' &&
    formData.startDate.trim() !== '' &&
    formData.endDate.trim() !== '' &&
    formData.budget.trim() !== '' &&
    formData.participants.trim() !== '' &&
    formData.preferences.length > 0
  )
}
