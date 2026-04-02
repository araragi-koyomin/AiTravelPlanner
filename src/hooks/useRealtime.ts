import { useEffect, useCallback, useRef, useState } from 'react'
import {
  subscribeToItineraries,
  subscribeToItineraryItems,
  subscribeToExpenses,
  isOnline
} from '@/services/realtime'
import type { Itinerary, ItineraryItem, Expense } from '@/services/types'

interface UseItinerariesRealtimeOptions {
  userId: string | undefined
  enabled?: boolean
  onInsert?: (itinerary: Itinerary) => void
  onUpdate?: (itinerary: Itinerary) => void
  onDelete?: (id: string) => void
}

interface UseItinerariesRealtimeReturn {
  isSubscribed: boolean
  error: Error | null
}

export function useItinerariesRealtime(
  options: UseItinerariesRealtimeOptions
): UseItinerariesRealtimeReturn {
  const { userId, enabled = true, onInsert, onUpdate, onDelete } = options
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const defaultOnInsert = useCallback((itinerary: Itinerary) => {
    console.log('New itinerary received:', itinerary)
  }, [])

  const defaultOnUpdate = useCallback((itinerary: Itinerary) => {
    console.log('Itinerary updated:', itinerary)
  }, [])

  const defaultOnDelete = useCallback((id: string) => {
    console.log('Itinerary deleted:', id)
  }, [])

  useEffect(() => {
    if (!userId || !enabled) {
      setIsSubscribed(false)
      return
    }

    try {
      setError(null)
      unsubscribeRef.current = subscribeToItineraries(
        userId,
        onInsert || defaultOnInsert,
        onUpdate || defaultOnUpdate,
        onDelete || defaultOnDelete
      )
      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe'))
      setIsSubscribed(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsSubscribed(false)
    }
  }, [userId, enabled, onInsert, onUpdate, onDelete, defaultOnInsert, defaultOnUpdate, defaultOnDelete])

  return { isSubscribed, error }
}

interface UseItineraryItemsRealtimeOptions {
  itineraryId: string | undefined
  enabled?: boolean
  onInsert?: (item: ItineraryItem) => void
  onUpdate?: (item: ItineraryItem) => void
  onDelete?: (id: string) => void
}

interface UseItineraryItemsRealtimeReturn {
  isSubscribed: boolean
  error: Error | null
}

export function useItineraryItemsRealtime(
  options: UseItineraryItemsRealtimeOptions
): UseItineraryItemsRealtimeReturn {
  const { itineraryId, enabled = true, onInsert, onUpdate, onDelete } = options
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const defaultOnInsert = useCallback((item: ItineraryItem) => {
    console.log('New itinerary item received:', item)
  }, [])

  const defaultOnUpdate = useCallback((item: ItineraryItem) => {
    console.log('Itinerary item updated:', item)
  }, [])

  const defaultOnDelete = useCallback((id: string) => {
    console.log('Itinerary item deleted:', id)
  }, [])

  useEffect(() => {
    if (!itineraryId || !enabled) {
      setIsSubscribed(false)
      return
    }

    try {
      setError(null)
      unsubscribeRef.current = subscribeToItineraryItems(
        itineraryId,
        onInsert || defaultOnInsert,
        onUpdate || defaultOnUpdate,
        onDelete || defaultOnDelete
      )
      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe'))
      setIsSubscribed(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsSubscribed(false)
    }
  }, [itineraryId, enabled, onInsert, onUpdate, onDelete, defaultOnInsert, defaultOnUpdate, defaultOnDelete])

  return { isSubscribed, error }
}

interface UseExpensesRealtimeOptions {
  itineraryId: string | undefined
  enabled?: boolean
  onInsert?: (expense: Expense) => void
  onUpdate?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

interface UseExpensesRealtimeReturn {
  isSubscribed: boolean
  error: Error | null
}

export function useExpensesRealtime(
  options: UseExpensesRealtimeOptions
): UseExpensesRealtimeReturn {
  const { itineraryId, enabled = true, onInsert, onUpdate, onDelete } = options
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const defaultOnInsert = useCallback((expense: Expense) => {
    console.log('New expense received:', expense)
  }, [])

  const defaultOnUpdate = useCallback((expense: Expense) => {
    console.log('Expense updated:', expense)
  }, [])

  const defaultOnDelete = useCallback((id: string) => {
    console.log('Expense deleted:', id)
  }, [])

  useEffect(() => {
    if (!itineraryId || !enabled) {
      setIsSubscribed(false)
      return
    }

    try {
      setError(null)
      unsubscribeRef.current = subscribeToExpenses(
        itineraryId,
        onInsert || defaultOnInsert,
        onUpdate || defaultOnUpdate,
        onDelete || defaultOnDelete
      )
      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe'))
      setIsSubscribed(false)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsSubscribed(false)
    }
  }, [itineraryId, enabled, onInsert, onUpdate, onDelete, defaultOnInsert, defaultOnUpdate, defaultOnDelete])

  return { isSubscribed, error }
}
