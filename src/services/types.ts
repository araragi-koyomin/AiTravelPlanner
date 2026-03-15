export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
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
  preferences: string[]
  special_requirements: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  id: string
  itinerary_id: string
  date: string
  time: string
  type: 'transport' | 'accommodation' | 'attraction' | 'restaurant' | 'activity'
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  description: string | null
  cost: number
  duration: number
  order_idx: number
  created_at: string
}

export interface Expense {
  id: string
  itinerary_id: string
  category: 'transport' | 'accommodation' | 'food' | 'tickets' | 'shopping' | 'other'
  amount: number
  date: string
  description: string | null
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  default_budget: number
  default_participants: number
  preferences: string[]
  created_at: string
  updated_at: string
}
