'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { BottomNav } from '@/components/bottom-nav'
import { OwnerHome } from '@/components/owner/owner-home'
import { OwnerOrders } from '@/components/owner/owner-orders'
import { OwnerAnalytics } from '@/components/owner/owner-analytics'
import { OwnerMenu } from '@/components/owner/owner-menu'
import { OwnerSettings } from '@/components/owner/owner-settings'
import { QRScanner } from '@/components/qr-scanner'
import { ChevronLeft, ScanLine } from 'lucide-react'

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [showScanner, setShowScanner] = useState(false)
  const { user, orders, updateOrderStatus, isHydrated } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isHydrated) return
    if (!user || user.role !== 'owner') {
      router.push('/')
    }
  }, [user, router, isHydrated])

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const shopOrders = orders.filter(o => o.shopId === user.shopId)
  const pendingOrders = shopOrders.filter(o => o.status === 'pending').length
  const preparingOrders = shopOrders.filter(o => o.status === 'preparing').length
  
  // Calculate today's revenue
  const today = new Date()
  const todayOrders = shopOrders.filter(o => {
    const orderDate = new Date(o.createdAt)
    return orderDate.toDateString() === today.toDateString() && o.status === 'completed'
  })
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

  const handleScan = (data: string) => {
    try {
      const orderData = JSON.parse(data)
      const order = orders.find(o => o.id === orderData.orderId || o.pickupToken === orderData.pickupToken)
      if (order) {
        if (order.status === 'ready') {
          updateOrderStatus(order.id, 'completed')
        }
        setShowScanner(false)
        setActiveTab('orders')
      }
    } catch (e) {
      console.error('Invalid QR data')
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return user.shopName || 'Dashboard'
      case 'orders': return 'Order Queue'
      case 'analytics': return 'Analytics'
      case 'menu': return 'Menu Management'
      case 'settings': return 'Settings'
      default: return 'Owner'
    }
  }

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {activeTab !== 'home' && (
              <button 
                onClick={() => setActiveTab('home')}
                className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-foreground">{getTabTitle()}</h1>
              {activeTab === 'home' && (
                <p className="text-xs text-muted-foreground">Owner Dashboard</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              <ScanLine className="w-5 h-5" />
              Scan
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        {activeTab === 'home' && (
          <div className="flex gap-3 px-4 pb-3 overflow-x-auto">
            <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-orange-400">Pending</p>
              <p className="text-xl font-bold text-orange-500">{pendingOrders}</p>
            </div>
            <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400">Preparing</p>
              <p className="text-xl font-bold text-blue-500">{preparingOrders}</p>
            </div>
            <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary">Today's Revenue</p>
              <p className="text-xl font-bold text-primary">Rs. {todayRevenue}</p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {activeTab === 'home' && <OwnerHome onNavigate={setActiveTab} />}
        {activeTab === 'orders' && <OwnerOrders />}
        {activeTab === 'analytics' && <OwnerAnalytics />}
        {activeTab === 'menu' && <OwnerMenu />}
        {activeTab === 'settings' && <OwnerSettings />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        role="owner"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
