'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { BottomNav } from '@/components/bottom-nav'
import { CaptainHome } from '@/components/captain/captain-home'
import { CaptainOrders } from '@/components/captain/captain-orders'
import { CaptainHistory } from '@/components/captain/captain-history'
import { CaptainSettings } from '@/components/captain/captain-settings'
import { QRScanner } from '@/components/qr-scanner'
import { ChevronLeft, ScanLine } from 'lucide-react'

export default function CaptainDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [showScanner, setShowScanner] = useState(false)
  const { user, orders, updateOrderStatus, isHydrated } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isHydrated) return
    if (!user || user.role !== 'captain') {
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

  const handleScan = (data: string) => {
    try {
      const orderData = JSON.parse(data)
      const order = orders.find(o => o.id === orderData.orderId || o.pickupToken === orderData.pickupToken)
      if (order) {
        // If order is ready, mark as completed
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
      case 'history': return 'Order History'
      case 'settings': return 'Settings'
      default: return 'Captain'
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
                <p className="text-xs text-muted-foreground">Captain View</p>
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
          <div className="flex gap-4 px-4 pb-3">
            <div className="flex-1 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-orange-400">Pending</p>
              <p className="text-xl font-bold text-orange-500">{pendingOrders}</p>
            </div>
            <div className="flex-1 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400">Preparing</p>
              <p className="text-xl font-bold text-blue-500">{preparingOrders}</p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {activeTab === 'home' && <CaptainHome onNavigate={setActiveTab} />}
        {activeTab === 'orders' && <CaptainOrders />}
        {activeTab === 'history' && <CaptainHistory />}
        {activeTab === 'settings' && <CaptainSettings />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        role="captain"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
