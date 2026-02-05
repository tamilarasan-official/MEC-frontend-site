'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { studentApi, mapMenuItemToFoodItem, type MenuItemResponse } from '@/lib/studentApi'
import { Search, Star, Clock, Plus, Minus, ChevronRight, ShoppingBag, ArrowRight, UtensilsCrossed, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn, getCategoryName } from '@/lib/utils'
import type { FoodItem } from '@/lib/types'
import { Cart } from './cart'
import { FoodImage } from '@/components/ui/food-image'

interface StudentHomeProps {
  onOrderSuccess?: () => void
  shopId?: string
}

export function StudentHome({ onOrderSuccess, shopId = 'shop1' }: StudentHomeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCart, setShowCart] = useState(false)
  const [menuItems, setMenuItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shopName, setShopName] = useState('Madras Canteen')
  const [shopTiming, setShopTiming] = useState('Open until 8:00 PM')
  const [isShopOpen, setIsShopOpen] = useState(true)

  const { cart, cartTotal, addToCart, updateQuantity } = useApp()

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Fetch menu items and categories from API
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch shop details first
        const shopsResult = await studentApi.getShops()
        if (shopsResult.success && shopsResult.data) {
          const shop = shopsResult.data.find(s => s.id === shopId)
          if (shop) {
            setShopName(shop.name)
            setIsShopOpen(shop.isActive)
            if (shop.timing) {
              setShopTiming(shop.timing)
            }
          }
        }

        // Fetch menu items
        const menuResult = await studentApi.getShopMenu(shopId)
        console.log('[StudentHome] Menu API response:', {
          success: menuResult.success,
          itemCount: menuResult.data?.length,
          firstItem: menuResult.data?.[0] ? {
            name: menuResult.data[0].name,
            image: menuResult.data[0].image,
            imageUrl: menuResult.data[0].imageUrl
          } : null
        })
        if (menuResult.success && menuResult.data) {
          const items = menuResult.data.map(item => mapMenuItemToFoodItem(item, shopName))
          console.log('[StudentHome] Mapped items:', {
            count: items.length,
            firstItemImage: items[0]?.image
          })
          setMenuItems(items)

          // Extract unique categories from items
          const uniqueCategories = ['All', ...new Set(items.map(item => getCategoryName(item.category)).filter(Boolean))]
          setCategories(uniqueCategories)
        } else {
          setError(menuResult.error || 'Failed to load menu')
        }

        // Try to fetch categories from API (optional - may not be implemented)
        const categoriesResult = await studentApi.getShopCategories(shopId)
        if (categoriesResult.success && categoriesResult.data && categoriesResult.data.length > 0) {
          setCategories(['All', ...categoriesResult.data.map(c => c.name)])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load menu. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [shopId, shopName])

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    // Trigger re-fetch by updating a dependency
    window.location.reload()
  }

  if (showCart) {
    return (
      <Cart
        onClose={() => setShowCart(false)}
        onOrderSuccess={() => {
          setShowCart(false)
          onOrderSuccess?.()
        }}
      />
    )
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || getCategoryName(item.category) === selectedCategory
    return matchesSearch && matchesCategory && item.isAvailable
  })

  const getCartQuantity = (itemId: string) => {
    const cartItem = cart.find(i => i.id === itemId)
    return cartItem?.quantity || 0
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-foreground font-medium">Something went wrong</p>
        <p className="text-muted-foreground text-sm text-center max-w-xs">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
        />
      </div>

      {/* Canteen Header - Compact */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">{shopName}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {shopTiming}
            </p>
          </div>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold",
          isShopOpen
            ? "bg-primary/20 text-primary"
            : "bg-destructive/20 text-destructive"
        )}>
          {isShopOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95",
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card border border-border text-foreground hover:border-primary/50 hover:bg-card/80"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Today's Special */}
      {filteredItems.some(item => item.isOffer) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Today&apos;s Special</h3>
            <button className="text-primary text-sm flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {filteredItems.filter(item => item.isOffer).map((item) => (
              <OfferCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Food Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">All Items</h3>
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              quantity={getCartQuantity(item.id)}
              onAdd={() => addToCart(item)}
              onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
            />
          ))}
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found</p>
        </div>
      )}

      {/* Spacer for floating bar */}
      {cart.length > 0 && <div className="h-24" />}

      {/* Floating Order Now Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 animate-slide-up">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-xl shadow-primary/30 active:scale-[0.98] transition-all hover:shadow-2xl hover:shadow-primary/40"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-primary-foreground/80">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
                <p className="text-xl font-bold">Rs. {cartTotal}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-semibold text-lg">
              View Cart
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

function OfferCard({ item }: { item: FoodItem }) {
  const { addToCart } = useApp()
  const discount = item.offerPrice ? Math.round((1 - item.offerPrice / item.price) * 100) : 0

  return (
    <div className="relative min-w-[200px] rounded-2xl overflow-hidden bg-card border border-border">
      <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
        {discount}% OFF
      </div>
      <FoodImage
        src={item.image}
        alt={item.name}
        className="w-full h-28 rounded-t-2xl"
      />
      <div className="p-3">
        <h4 className="font-semibold text-foreground text-sm truncate">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary font-bold">Rs. {item.offerPrice}</span>
          <span className="text-muted-foreground text-xs line-through">Rs. {item.price}</span>
        </div>
        <button
          onClick={() => addToCart(item)}
          className="w-full mt-2 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

interface FoodCardProps {
  item: FoodItem
  quantity: number
  onAdd: () => void
  onUpdateQuantity: (qty: number) => void
}

function FoodCard({ item, quantity, onAdd, onUpdateQuantity }: FoodCardProps) {
  const displayPrice = item.isOffer && item.offerPrice ? item.offerPrice : item.price

  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <FoodImage
          src={item.image}
          alt={item.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {item.isOffer && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg">
            OFFER
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            {item.rating}
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {item.preparationTime}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-primary font-bold text-lg">Rs.{displayPrice}</span>
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center bg-primary/10 rounded-xl overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(quantity - 1)}
                className="p-2.5 text-primary hover:bg-primary/20 transition-colors active:scale-90"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-base font-bold text-foreground w-8 text-center">{quantity}</span>
              <button
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="p-2.5 text-primary hover:bg-primary/20 transition-colors active:scale-90"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
