'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { categories } from '@/lib/data'
import { Search, Star, Clock, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react'
import { cn, getCategoryName } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'

export function CanteenFoodList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { foodItems, toggleFoodAvailability } = useApp()

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || getCategoryName(item.category) === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Menu Items</h2>
        <p className="text-sm text-muted-foreground">Manage your food items</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:border-primary/50"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-2xl font-bold text-foreground">{foodItems.length}</p>
          <p className="text-xs text-muted-foreground">Total Items</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-2xl font-bold text-primary">{foodItems.filter(i => i.isAvailable).length}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
      </div>

      {/* Food Items */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => (
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
              className="w-20 h-20 rounded-xl"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{getCategoryName(item.category)}</p>
                </div>
                {item.isOffer && (
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                    Offer
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {item.rating}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {item.preparationTime}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-primary">Rs. {item.price}</span>
                  {item.isOffer && item.offerPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      Rs. {item.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Large Toggle Button */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => toggleFoodAvailability(item.id)}
                  className={cn(
                    "w-full h-14 flex items-center justify-center gap-3 rounded-xl text-base font-bold transition-all",
                    item.isAvailable 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : "bg-destructive/20 text-destructive border-2 border-destructive"
                  )}
                >
                  {item.isAvailable ? (
                    <>
                      <ToggleRight className="w-6 h-6" />
                      Available
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6" />
                      Mark Unavailable
                    </>
                  )}
                </button>
                <button className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium">
                  <Edit2 className="w-5 h-5" />
                  Edit Item
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
