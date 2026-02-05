'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { BottomNav } from '@/components/bottom-nav'
import { StudentDashboardHome } from '@/components/student/student-dashboard-home'
import { StudentHome } from '@/components/student/student-home'
import { StudentProfile } from '@/components/student/student-profile'
import { StudentOrders } from '@/components/student/student-orders'
import { StudentOffers } from '@/components/student/student-offers'
import { Stores } from '@/components/student/stores'
import { Cart } from '@/components/student/cart'
import { ShoppingCart, ChevronLeft } from 'lucide-react'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [showCart, setShowCart] = useState(false)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const { user, cart, isHydrated } = useApp()
  const router = useRouter()

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
    if (tab === 'stores') {
      // When navigating to stores from home, show stores list
      setSelectedStore(null)
    }
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - Only show on non-home tabs */}
      {activeTab !== 'home' && (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {(activeTab === 'stores' && selectedStore) && (
                <button 
                  onClick={() => setSelectedStore(null)}
                  className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              )}
              {(activeTab === 'stores' && !selectedStore) && (
                <button 
                  onClick={() => setActiveTab('home')}
                  className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {activeTab === 'stores' && !selectedStore && 'Stores'}
                  {activeTab === 'stores' && selectedStore === 'canteen' && 'Madras Canteen'}
                  {activeTab === 'history' && 'My Orders'}
                  {activeTab === 'offers' && 'Today\'s Offers'}
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
        {activeTab === 'home' && <StudentDashboardHome onNavigate={handleNavigate} />}
        {activeTab === 'stores' && !selectedStore && (
          <Stores onSelectStore={(storeId) => setSelectedStore(storeId)} />
        )}
        {activeTab === 'stores' && selectedStore === 'canteen' && (
          <StudentHome onOrderSuccess={() => setActiveTab('history')} />
        )}
        {activeTab === 'history' && <StudentOrders />}
        {activeTab === 'offers' && <StudentOffers />}
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
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'stores') {
            setSelectedStore(null)
          }
          setActiveTab(tab)
        }}
      />
    </div>
  )
}
