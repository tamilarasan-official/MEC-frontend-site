'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

interface FoodImageProps {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  priority?: boolean
  sizes?: string
}

/**
 * Optimized image component for food items from S3
 * Handles loading states, errors, and provides nice fallbacks
 */
export function FoodImage({
  src,
  alt,
  className,
  fallbackClassName,
}: FoodImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Determine if we have a valid image URL
  const hasValidSrc = src && src !== '/placeholder.svg' && src.trim() !== ''

  // Debug log for image loading
  if (process.env.NODE_ENV === 'development' && src) {
    console.log('[FoodImage] Loading:', { src: src?.substring(0, 80), hasValidSrc, alt })
  }

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false)
  }

  // Handle image error
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    // Debug log for failed images
    if (process.env.NODE_ENV === 'development') {
      console.log('[FoodImage] Failed to load image:', src, '- showing fallback')
    }
  }

  // Show fallback if no valid src or error occurred
  if (!hasValidSrc || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 border border-border",
          fallbackClassName || className
        )}
      >
        <UtensilsCrossed className="w-1/3 h-1/3 text-primary/40" />
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  )
}

/**
 * Avatar image component for user profiles
 */
export function AvatarImage({
  src,
  alt,
  className,
  fallbackClassName,
}: FoodImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const hasValidSrc = src && src !== '/placeholder-user.jpg' && src.trim() !== ''

  if (!hasValidSrc || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold",
          fallbackClassName || className
        )}
      >
        {alt?.charAt(0)?.toUpperCase() || '?'}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true) }}
        loading="lazy"
      />
    </div>
  )
}

/**
 * Shop image/logo component
 */
export function ShopImage({
  src,
  alt,
  className,
  fallbackClassName,
}: FoodImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const hasValidSrc = src && src.trim() !== ''

  if (!hasValidSrc || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/15 to-purple-500/10 border border-primary/20",
          fallbackClassName || className
        )}
      >
        <span className="text-2xl font-bold text-primary/60">
          {alt?.charAt(0)?.toUpperCase() || 'S'}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true) }}
        loading="lazy"
      />
    </div>
  )
}
