import type { 
  ActivityType, 
  ExpenseCategory, 
  ItineraryStatus, 
  PaymentMethod,
  LocationData,
  UserPreferences 
} from './supabase'

export type { 
  ActivityType, 
  ExpenseCategory, 
  ItineraryStatus, 
  PaymentMethod,
  LocationData,
  UserPreferences
}

export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  preferences: UserPreferences | null
  created_at: string
  updated_at: string
}

export interface Itinerary {
  id: string
  user_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: number
  participants: number
  preferences: string[] | null
  special_requirements: string | null
  travelers_type: string | null
  accommodation_pref: string | null
  pace: string | null
  is_favorite: boolean
  status: ItineraryStatus
  cover_image: string | null
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
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

export interface Expense {
  id: string
  itinerary_id: string
  category: ExpenseCategory
  amount: number
  expense_date: string
  payment_method: PaymentMethod | null
  receipt_url: string | null
  notes: string | null
  description: string | null
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  zhipu_api_key: string | null
  xunfei_api_key: string | null
  xunfei_app_id: string | null
  xunfei_api_secret: string | null
  amap_api_key: string | null
  amap_security_js_code: string | null
  theme: 'light' | 'dark'
  language: 'zh' | 'en'
  notifications: boolean
  created_at: string
  updated_at: string
}
