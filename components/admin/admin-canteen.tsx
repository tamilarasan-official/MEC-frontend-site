'use client'

import { useApp } from '@/lib/context'
import { Store, UtensilsCrossed, TrendingUp, Clock, Star, ToggleRight, ToggleLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'

export function AdminCanteen() {
  const { foodItems, orders, toggleFoodAvailability } = useApp()

  const todayOrders = orders.filter(o => {
    const today = new Date()
    const orderDate = new Date(o.createdAt)
    return orderDate.toDateString() === today.toDateString()
  })

  const todayRevenue = todayOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0)

  const availableItems = foodItems.filter(i => i.isAvailable).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Manage Canteen</h2>
        <p className="text-sm text-muted-foreground">Canteen overview and controls</p>
      </div>

      {/* Canteen Card */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Store className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Madras Kitchen Canteen</h3>
            <p className="text-sm text-muted-foreground">Madras Engineering College</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-medium">Open Now</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-secondary text-center">
            <UtensilsCrossed className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{foodItems.length}</p>
            <p className="text-xs text-muted-foreground">Items</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{todayOrders.length}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary text-center">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">Rs. {todayRevenue}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Menu Items</h3>
          <p className="text-sm text-muted-foreground">{availableItems}/{foodItems.length} available</p>
        </div>

        <div className="space-y-3">
          {foodItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex gap-4 p-4 rounded-2xl bg-card border border-border animate-float-up transition-opacity",
                !item.isAvailable && "opacity-60"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <FoodImage
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-xl"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </div>
                  <span className="text-primary font-semibold">Rs. {item.price}</span>
                </div>
              </div>

              <button
                onClick={() => toggleFoodAvailability(item.id)}
                className={cn(
                  "self-center p-2 rounded-lg transition-colors",
                  item.isAvailable
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {item.isAvailable ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
