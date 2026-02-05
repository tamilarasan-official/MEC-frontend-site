'use client'

import { useState, useEffect } from 'react'
import { UtensilsCrossed, Shirt, FileText, Clock, Lock, ChevronRight, Search, Store as StoreIcon, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { studentApi, type ShopResponse } from '@/lib/studentApi'

interface Store {
  id: string
  name: string
  description: string
  icon: React.ElementType
  iconColor: string
  bgColor: string
  isActive: boolean
  timing?: string
}

// Map shop category to icon and styling
function getStoreIcon(category: string): { icon: React.ElementType; iconColor: string; bgColor: string } {
  switch (category.toLowerCase()) {
    case 'canteen':
    case 'food':
      return { icon: UtensilsCrossed, iconColor: 'text-primary', bgColor: 'bg-primary/10' }
    case 'laundry':
      return { icon: Shirt, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10' }
    case 'xerox':
    case 'print':
      return { icon: FileText, iconColor: 'text-orange-400', bgColor: 'bg-orange-500/10' }
    default:
      return { icon: StoreIcon, iconColor: 'text-gray-400', bgColor: 'bg-gray-500/10' }
  }
}

// Map API response to UI format
function mapShopToStore(shop: ShopResponse): Store {
  const { icon, iconColor, bgColor } = getStoreIcon(shop.category)
  return {
    id: shop.id,
    name: shop.name,
    description: shop.description,
    icon,
    iconColor,
    bgColor,
    isActive: shop.isActive,
    timing: shop.timing,
  }
}

interface StoresProps {
  onSelectStore: (storeId: string) => void
}

export function Stores({ onSelectStore }: StoresProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchStores() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await studentApi.getShops()
        if (result.success && result.data) {
          const mappedStores = result.data.map(mapShopToStore)
          setStores(mappedStores)
        } else {
          setError(result.error || 'Failed to load stores')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStores()
  }, [])

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeStores = filteredStores.filter(s => s.isActive)
  const comingSoonStores = filteredStores.filter(s => !s.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Stores</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse campus services</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading stores...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setIsLoading(true)
              studentApi.getShops().then(result => {
                if (result.success && result.data) {
                  setStores(result.data.map(mapShopToStore))
                } else {
                  setError(result.error || 'Failed to load stores')
                }
              }).catch(() => {
                setError('An unexpected error occurred')
              }).finally(() => {
                setIsLoading(false)
              })
            }}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Active Stores */}
      {!isLoading && !error && activeStores.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Now</h3>
          <div className="space-y-3">
            {activeStores.map((store, index) => {
              const Icon = store.icon
              return (
                <button
                  key={store.id}
                  onClick={() => onSelectStore(store.id)}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 hover:border-primary/40 transition-all text-left group active:scale-[0.99] animate-float-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground text-lg">{store.name}</h4>
                    <p className="text-sm text-muted-foreground">{store.description}</p>
                    {store.timing && (
                      <p className="text-xs text-primary flex items-center gap-1 mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        {store.timing}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ChevronRight className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Coming Soon Stores */}
      {!isLoading && !error && comingSoonStores.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Coming Soon</h3>
          <div className="space-y-3">
            {comingSoonStores.map((store, index) => {
              const Icon = store.icon
              return (
                <div
                  key={store.id}
                  className="relative w-full flex items-center gap-4 p-5 rounded-2xl bg-card/30 border border-border/50 text-left"
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 opacity-50", store.bgColor)}>
                    <Icon className={cn("w-8 h-8", store.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-muted-foreground">{store.name}</h4>
                    <p className="text-sm text-muted-foreground/70">{store.description}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Soon</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!isLoading && !error && filteredStores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stores found</p>
        </div>
      )}
    </div>
  )
}
