import { useLazyImage } from '@/hooks/useLazyImage'
import { cn } from '@/utils/cn'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  containerClassName?: string
  threshold?: number
  rootMargin?: string
  onLoad?: () => void
  onError?: () => void
  fallback?: React.ReactNode
  shimmer?: boolean
}

export function LazyImage({
  src,
  alt,
  placeholder,
  className,
  containerClassName,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  fallback,
  shimmer = true
}: LazyImageProps) {
  const { imageSrc, isLoading, hasError, imageRef } = useLazyImage({
    src,
    placeholder,
    threshold,
    rootMargin
  })

  const handleLoad = () => {
    onLoad?.()
  }

  const handleError = () => {
    onError?.()
  }

  if (hasError && fallback) {
    return <div className={containerClassName}>{fallback}</div>
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {isLoading && shimmer && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        ref={imageRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

interface LazyBackgroundImageProps {
  src: string
  children?: React.ReactNode
  className?: string
  placeholder?: string
  threshold?: number
  rootMargin?: string
  shimmer?: boolean
}

export function LazyBackgroundImage({
  src,
  children,
  className,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  shimmer = true
}: LazyBackgroundImageProps) {
  const { imageSrc, isLoading, imageRef } = useLazyImage({
    src,
    placeholder,
    threshold,
    rootMargin
  })

  return (
    <div
      ref={imageRef as React.RefObject<HTMLDivElement>}
      className={cn('relative', className)}
      style={{
        backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {isLoading && shimmer && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {children}
    </div>
  )
}

interface ProgressiveImageProps {
  src: string
  thumbnailSrc?: string
  alt: string
  className?: string
  containerClassName?: string
  blur?: boolean
}

export function ProgressiveImage({
  src,
  thumbnailSrc,
  alt,
  className,
  containerClassName,
  blur = true
}: ProgressiveImageProps) {
  const [mainImageLoaded, setMainImageLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={alt}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            mainImageLoaded ? 'opacity-0' : 'opacity-100',
            blur && !mainImageLoaded ? 'filter blur-sm scale-105' : ''
          )}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          mainImageLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setMainImageLoaded(true)}
      />
    </div>
  )
}

import { useState } from 'react'

interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    thumbnail?: string
  }>
  className?: string
  columns?: number
  gap?: number
}

export function ImageGallery({
  images,
  className,
  columns = 3,
  gap = 4
}: ImageGalleryProps) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 4}px`
      }}
    >
      {images.map((image, index) => (
        <LazyImage
          key={index}
          src={image.src}
          alt={image.alt}
          placeholder={image.thumbnail}
          className="w-full h-full object-cover aspect-square"
          containerClassName="aspect-square"
        />
      ))}
    </div>
  )
}
