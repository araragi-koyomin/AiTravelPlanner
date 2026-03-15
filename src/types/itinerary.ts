export enum TravelPreference {
  FOOD = 'food',
  ATTRACTION = 'attraction',
  SHOPPING = 'shopping',
  CULTURE = 'culture',
  NATURE = 'nature',
  ANIME = 'anime',
  HISTORY = 'history',
  NIGHTLIFE = 'nightlife'
}

export const TravelPreferenceLabels: Record<TravelPreference, string> = {
  [TravelPreference.FOOD]: '美食',
  [TravelPreference.ATTRACTION]: '景点',
  [TravelPreference.SHOPPING]: '购物',
  [TravelPreference.CULTURE]: '文化',
  [TravelPreference.NATURE]: '自然',
  [TravelPreference.ANIME]: '动漫',
  [TravelPreference.HISTORY]: '历史',
  [TravelPreference.NIGHTLIFE]: '夜生活'
}

export interface ItineraryRequest {
  destination: string
  startDate: string
  endDate: string
  budget: number
  participants: number
  preferences: TravelPreference[]
  specialRequirements?: string
}

export interface ItineraryFormData {
  destination: string
  startDate: string
  endDate: string
  budget: string
  participants: string
  preferences: TravelPreference[]
  specialRequirements: string
}

export interface ItineraryFormErrors {
  destination?: string
  startDate?: string
  endDate?: string
  budget?: string
  participants?: string
  preferences?: string
}

export interface AIItineraryResponse {
  summary: {
    destination: string
    duration: string
    totalBudget: number
    participants: number
    estimatedCost: number
  }
  dailySchedule: DailySchedule[]
  budgetBreakdown: BudgetBreakdown
  tips: string[]
  emergencyContacts: {
    police: string
    hospital: string
    embassy: string
  }
}

export interface DailySchedule {
  date: string
  dayOfWeek: string
  theme: string
  activities: Activity[]
}

export interface Activity {
  time: string
  type: 'transport' | 'accommodation' | 'attraction' | 'restaurant' | 'activity'
  name: string
  address: string
  latitude?: number
  longitude?: number
  description: string
  cost: number
  duration: number
  tips: string
}

export interface BudgetBreakdown {
  transport: number
  accommodation: number
  food: number
  tickets: number
  shopping: number
  other: number
  total: number
}

export function getPreferenceLabel(preference: TravelPreference): string {
  return TravelPreferenceLabels[preference]
}

export function getPreferenceLabels(preferences: TravelPreference[]): string[] {
  return preferences.map(getPreferenceLabel)
}

export const DEFAULT_FORM_DATA: ItineraryFormData = {
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  participants: '',
  preferences: [],
  specialRequirements: ''
}
