'use client'

import { useApp } from '@/lib/context'
import { FoodImage } from '@/components/ui/food-image'
import { Tag, Clock, Star, Plus } from 'lucide-react'

export function StudentOffers() {
  const { foodItems, addToCart } = useApp()
  
  const offerItems = foodItems.filter(item => item.isOffer && item.isAvailable)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Today&apos;s Offers</h2>
        <p className="text-sm text-muted-foreground">Grab these deals before they&apos;re gone!</p>
      </div>

      {/* Promo Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-[2px]">
        <div className="relative rounded-[22px] bg-gradient-to-br from-primary/95 via-emerald-500/95 to-teal-500/95 p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-4">
              <Tag className="w-3.5 h-3.5" />
              Limited Time Only
            </div>
            <h3 className="text-3xl font-bold text-white">Up to 30% OFF</h3>
            <p className="text-white/80 text-sm mt-2">On selected items from Madras Kitchen</p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-8 top-8 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
        </div>
      </div>

      {/* Offer Items */}
      {offerItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-card mx-auto flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No offers available</p>
          <p className="text-sm text-muted-foreground">Check back later for exciting deals!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offerItems.map((item, index) => {
            const discount = item.offerPrice ? Math.round((1 - item.offerPrice / item.price) * 100) : 0
            
            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all animate-float-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative flex-shrink-0">
                  <FoodImage
                    src={item.image}
                    alt={item.name}
                    className="w-28 h-28 rounded-2xl"
                  />
                  <div className="absolute -top-2 -left-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-bold shadow-lg">
                    {discount}% OFF
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {item.rating}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {item.preparationTime}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">Rs.{item.offerPrice}</span>
                      <span className="text-sm text-muted-foreground line-through">Rs.{item.price}</span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
