'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn, getCategoryName } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'
import { getShopMenuItems, toggleMenuItemAvailability } from '@/lib/services/owner'
import type { FoodItem } from '@/lib/types'

export function OwnerMenu() {
  const { user } = useApp()

  const [menuItems, setMenuItems] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null)

  const fetchMenuItems = async () => {
    if (!user?.shopId) {
      setError('Shop information not found. Please log in again.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getShopMenuItems(user.shopId)

      if (response.success && response.data) {
        setMenuItems(response.data)
      } else {
        setMenuItems([])
        // Don't show error if just empty
        if (response.error?.message && !response.error.message.includes('not found')) {
          setError(response.error.message)
        }
      }
    } catch (err) {
      console.error('Failed to fetch menu items:', err)
      setError('Failed to load menu items. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [user?.shopId])

  const handleToggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    setTogglingItemId(itemId)

    try {
      const response = await toggleMenuItemAvailability(itemId, !currentAvailability)

      if (response.success) {
        // Update local state
        setMenuItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, isAvailable: !currentAvailability } : item
          )
        )
      } else {
        // Show error toast or notification
        console.error('Failed to toggle availability:', response.error?.message)
        alert(response.error?.message || 'Failed to update item availability')
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err)
      alert('Failed to update item availability. Please try again.')
    } finally {
      setTogglingItemId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading menu items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive mb-4 text-center px-4">{error}</p>
        <button
          onClick={fetchMenuItems}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Toggle availability of menu items. Contact SuperAdmin to add or edit items.
      </p>

      {menuItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                item.isAvailable
                  ? "bg-card border-border"
                  : "bg-card/50 border-border/50"
              )}
            >
              <FoodImage
                src={item.image}
                alt={item.name}
                className={cn(
                  "w-16 h-16 rounded-xl",
                  !item.isAvailable && "opacity-50 grayscale"
                )}
              />
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-semibold truncate",
                  item.isAvailable ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.name}
                </h4>
                <p className="text-sm text-muted-foreground">{getCategoryName(item.category)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.isOffer && item.offerPrice ? (
                    <>
                      <span className="text-sm font-semibold text-primary">Rs. {item.offerPrice}</span>
                      <span className="text-xs text-muted-foreground line-through">Rs. {item.price}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-foreground">Rs. {item.price}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                disabled={togglingItemId === item.id}
                className={cn(
                  "w-14 h-8 rounded-full flex items-center transition-colors relative",
                  item.isAvailable
                    ? "bg-primary justify-end pr-1"
                    : "bg-muted justify-start pl-1",
                  togglingItemId === item.id && "opacity-70 cursor-not-allowed"
                )}
              >
                {togglingItemId === item.id ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                  </div>
                ) : (
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    item.isAvailable ? "bg-white" : "bg-card"
                  )}>
                    {item.isAvailable ? (
                      <Check className="w-3 h-3 text-primary" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
