'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { BottomNav } from '@/components/bottom-nav'
import { StudentDashboardHome } from '@/components/student/student-dashboard-home'
import { StudentHome } from '@/components/student/student-home'
import { StudentProfile } from '@/components/student/student-profile'
import { StudentOrders } from '@/components/student/student-orders'
import { Cart } from '@/components/student/cart'
import { ShoppingCart, ChevronLeft } from 'lucide-react'
import { studentApi } from '@/lib/studentApi'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [showCart, setShowCart] = useState(false)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [canteenShopId, setCanteenShopId] = useState<string | null>(null)
  const { user, cart, isHydrated } = useApp()
  const router = useRouter()

  // Fetch canteen shop ID on mount
  useEffect(() => {
    async function fetchCanteenShop() {
      try {
        const result = await studentApi.getShops()
        if (result.success && result.data) {
          // Find the canteen shop (category: 'canteen' or name contains 'canteen')
          const canteen = result.data.find(shop =>
            shop.category === 'canteen' ||
            shop.name.toLowerCase().includes('canteen')
          )
          if (canteen) {
            setCanteenShopId(canteen.id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch canteen shop:', error)
      }
    }
    fetchCanteenShop()
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (!user || user.role !== 'student') {
      router.push('/')
    }
  }, [user, router, isHydrated])

  // Show loading while hydrating or if no user
  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
  }

  // Navigate directly to canteen menu (skip stores list)
  const handleNavigateToCanteen = () => {
    if (canteenShopId) {
      setSelectedStore(canteenShopId)
      setActiveTab('canteen')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - Only show on non-home tabs */}
      {activeTab !== 'home' && (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {activeTab === 'canteen' && (
                <button
                  onClick={() => {
                    setSelectedStore(null)
                    setActiveTab('home')
                  }}
                  className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {activeTab === 'canteen' && 'Menu'}
                  {activeTab === 'history' && 'Order History'}
                  {activeTab === 'profile' && 'Profile'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-bold text-primary">Rs. {user.balance?.toFixed(0) || 0}</p>
              </div>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2.5 rounded-xl bg-card border border-border"
              >
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="px-4 py-4">
        {activeTab === 'home' && (
          <StudentDashboardHome
            onNavigate={handleNavigate}
            onNavigateToCanteen={handleNavigateToCanteen}
          />
        )}
        {activeTab === 'canteen' && selectedStore && (
          <StudentHome shopId={selectedStore} onOrderSuccess={() => setActiveTab('history')} />
        )}
        {activeTab === 'history' && <StudentOrders />}
        {activeTab === 'profile' && <StudentProfile />}
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <Cart 
          onClose={() => setShowCart(false)} 
          onOrderSuccess={() => {
            setShowCart(false)
            setActiveTab('history')
          }}
        />
      )}

      <BottomNav
        role="student"
        activeTab={activeTab === 'canteen' ? 'home' : activeTab}
        onTabChange={(tab) => {
          setSelectedStore(null)
          setActiveTab(tab)
        }}
      />
    </div>
  )
}
