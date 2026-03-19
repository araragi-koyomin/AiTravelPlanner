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

export type TravelersType = 'adult' | 'family' | 'couple' | 'friends' | 'solo' | 'business'

export const TravelersTypeLabels: Record<TravelersType, string> = {
  adult: '成人出行',
  family: '亲子游',
  couple: '情侣出游',
  friends: '朋友结伴',
  solo: '独自旅行',
  business: '商务出行'
}

export type AccommodationPreference = 'budget' | 'comfort' | 'luxury'

export const AccommodationPreferenceLabels: Record<AccommodationPreference, string> = {
  budget: '经济型',
  comfort: '舒适型',
  luxury: '豪华型'
}

export type PaceType = 'relaxed' | 'moderate' | 'intense'

export const PaceTypeLabels: Record<PaceType, string> = {
  relaxed: '轻松',
  moderate: '适中',
  intense: '紧凑'
}

export type ItineraryStatus = 'draft' | 'generated' | 'in_progress' | 'completed' | 'archived'

export const ItineraryStatusLabels: Record<ItineraryStatus, string> = {
  draft: '草稿',
  generated: '已生成',
  in_progress: '进行中',
  completed: '已完成',
  archived: '已归档'
}

export interface ItineraryRequest {
  destination: string
  startDate: string
  endDate: string
  budget: number
  participants: number
  preferences: TravelPreference[]
  specialRequirements?: string
  travelersType?: TravelersType
  accommodation?: AccommodationPreference
  pace?: PaceType
}

export interface ItineraryFormData {
  destination: string
  startDate: string
  endDate: string
  budget: string
  participants: string
  preferences: TravelPreference[]
  specialRequirements: string
  travelersType: TravelersType
  accommodation: AccommodationPreference
  pace: PaceType
}

export interface ItineraryFormErrors {
  destination?: string
  startDate?: string
  endDate?: string
  budget?: string
  participants?: string
  preferences?: string
}

export interface LocationData {
  address: string
  lat: number
  lng: number
  poi_id?: string
  city?: string
  district?: string
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
  day: number
  date: string
  dayOfWeek: string
  theme: string
  activities: Activity[]
}

export type ActivityType = 'transport' | 'accommodation' | 'attraction' | 'restaurant' | 'activity' | 'shopping'

export const ActivityTypeLabels: Record<ActivityType, string> = {
  transport: '交通',
  accommodation: '住宿',
  attraction: '景点',
  restaurant: '餐厅',
  activity: '活动',
  shopping: '购物'
}

export interface Activity {
  time: string
  type: ActivityType
  name: string
  location: LocationData
  description: string
  cost: number
  duration: number
  tips: string
  image_url?: string
}

export interface BudgetBreakdown {
  transport: number
  accommodation: number
  food: number
  tickets: number
  shopping: number
  entertainment: number
  other: number
  total: number
}

export interface ItineraryItemBase {
  id: string
  itinerary_id: string
  day: number
  time: string
  type: ActivityType
  name: string
  location: LocationData
  description: string | null
  cost: number | null
  duration: number | null
  tips: string | null
  image_url: string | null
  order_idx: number
  created_at: string
}

export interface DailyScheduleWithItems {
  day: number
  date: string
  dayOfWeek: string
  theme: string
  items: ItineraryItemBase[]
}

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: '星期日',
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六'
}

export function getDayOfWeekLabel(dateString: string): string {
  const date = new Date(dateString)
  return DAY_OF_WEEK_LABELS[date.getDay()]
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
  specialRequirements: '',
  travelersType: 'adult',
  accommodation: 'comfort',
  pace: 'moderate'
}
