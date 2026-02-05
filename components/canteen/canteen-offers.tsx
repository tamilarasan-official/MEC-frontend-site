'use client'

import { useApp } from '@/lib/context'
import { Tag, Plus, Star, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'

export function CanteenOffers() {
  const { foodItems, updateFoodItem } = useApp()

  const offerItems = foodItems.filter(item => item.isOffer)
  const nonOfferItems = foodItems.filter(item => !item.isOffer)

  const toggleOffer = (itemId: string) => {
    const item = foodItems.find(i => i.id === itemId)
    if (item) {
      updateFoodItem({
        ...item,
        isOffer: !item.isOffer,
        offerPrice: item.isOffer ? undefined : Math.round(item.price * 0.8)
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Today&apos;s Offers</h2>
          <p className="text-sm text-muted-foreground">Manage special deals</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Offer
        </Button>
      </div>

      {/* Active Offers */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          Active Offers ({offerItems.length})
        </h3>

        {offerItems.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-card border border-border">
            <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active offers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offerItems.map((item, index) => {
              const discount = item.offerPrice ? Math.round((1 - item.offerPrice / item.price) * 100) : 0

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl bg-card border border-primary/30 animate-float-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative">
                    <FoodImage
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl"
                    />
                    <div className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold">
                      {discount}%
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {item.rating}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-primary">Rs. {item.offerPrice}</span>
                      <span className="text-xs text-muted-foreground line-through">Rs. {item.price}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleOffer(item.id)}
                    className="self-center p-2 rounded-lg bg-primary/10 text-primary"
                  >
                    <ToggleRight className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Available Items */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Add to Offers
        </h3>

        <div className="space-y-3">
          {nonOfferItems.slice(0, 5).map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-2xl bg-card border border-border animate-float-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <FoodImage
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-xl"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                <p className="text-sm text-muted-foreground">Rs. {item.price}</p>
              </div>

              <button
                onClick={() => toggleOffer(item.id)}
                className={cn(
                  "self-center p-2 rounded-lg transition-colors",
                  "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <ToggleLeft className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
