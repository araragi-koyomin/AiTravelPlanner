import { useState, useEffect, useRef, useCallback } from 'react'

interface UseLazyImageOptions {
  src: string
  placeholder?: string
  threshold?: number
  rootMargin?: string
}

interface UseLazyImageReturn {
  imageSrc: string | undefined
  isLoading: boolean
  hasError: boolean
  imageRef: React.RefObject<HTMLImageElement>
  isIntersecting: boolean
}

export function useLazyImage({
  src,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px'
}: UseLazyImageOptions): UseLazyImageReturn {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholder)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const loadImage = useCallback(() => {
    if (!src) {
      setIsLoading(false)
      setHasError(true)
      return
    }

    const img = new Image()
    img.src = src

    img.onload = () => {
      setImageSrc(src)
      setIsLoading(false)
      setHasError(false)
    }

    img.onerror = () => {
      setImageSrc(placeholder)
      setIsLoading(false)
      setHasError(true)
    }
  }, [src, placeholder])

  useEffect(() => {
    const currentRef = imageRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true)
            loadImage()
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadImage, threshold, rootMargin])

  return {
    imageSrc,
    isLoading,
    hasError,
    imageRef,
    isIntersecting
  }
}

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useLazyLoad({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: UseLazyLoadOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    if (triggerOnce && hasIntersected) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting)
          if (entry.isIntersecting) {
            setHasIntersected(true)
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin, triggerOnce, hasIntersected])

  return {
    ref,
    isIntersecting,
    hasIntersected
  }
}

interface UseImagePreloadOptions {
  urls: string[]
  concurrent?: number
}

interface UseImagePreloadReturn {
  loadedCount: number
  totalCount: number
  isLoading: boolean
  progress: number
  errors: string[]
}

export function useImagePreload({
  urls,
  concurrent = 3
}: UseImagePreloadOptions): UseImagePreloadReturn {
  const [loadedCount, setLoadedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const totalCount = urls.length
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0

  useEffect(() => {
    if (urls.length === 0) return

    setIsLoading(true)
    setLoadedCount(0)
    setErrors([])

    const loadBatch = async (batch: string[]) => {
      const promises = batch.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image()
            img.src = url
            img.onload = () => {
              setLoadedCount((prev) => prev + 1)
              resolve()
            }
            img.onerror = () => {
              setErrors((prev) => [...prev, url])
              setLoadedCount((prev) => prev + 1)
              resolve()
            }
          })
      )

      await Promise.all(promises)
    }

    const loadAllImages = async () => {
      for (let i = 0; i < urls.length; i += concurrent) {
        const batch = urls.slice(i, i + concurrent)
        await loadBatch(batch)
      }
      setIsLoading(false)
    }

    loadAllImages()
  }, [urls, concurrent])

  return {
    loadedCount,
    totalCount,
    isLoading,
    progress,
    errors
  }
}
