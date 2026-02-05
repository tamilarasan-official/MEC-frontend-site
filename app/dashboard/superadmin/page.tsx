'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { BottomNav } from '@/components/bottom-nav'
import { SuperAdminDashboardHome } from '@/components/superadmin/superadmin-dashboard-home'
import { SuperAdminAnalytics } from '@/components/superadmin/superadmin-analytics'
import { SuperAdminMenu } from '@/components/superadmin/superadmin-menu'
import { SuperAdminShops } from '@/components/superadmin/superadmin-shops'
import { SuperAdminSettings } from '@/components/superadmin/superadmin-settings'
import { SuperAdminPayments } from '@/components/superadmin/superadmin-payments'
import { ChevronLeft } from 'lucide-react'

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, isHydrated } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isHydrated) return
    if (!user || user.role !== 'superadmin') {
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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'SuperAdmin Dashboard'
      case 'analytics': return 'Analytics & Reports'
      case 'menu': return 'Menu Management'
      case 'shops': return 'Shop Management'
      case 'payments': return 'Payment Requests'
      case 'settings': return 'Settings'
      default: return 'SuperAdmin'
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-2 -ml-2 rounded-xl hover:bg-card transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-foreground">{getTabTitle()}</h1>
              {activeTab === 'dashboard' && (
                <p className="text-xs text-muted-foreground">Full system access</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {activeTab === 'dashboard' && <SuperAdminDashboardHome onNavigate={setActiveTab} />}
        {activeTab === 'analytics' && <SuperAdminAnalytics />}
        {activeTab === 'menu' && <SuperAdminMenu />}
        {activeTab === 'shops' && <SuperAdminShops />}
        {activeTab === 'payments' && <SuperAdminPayments />}
        {activeTab === 'settings' && <SuperAdminSettings />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        role="superadmin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
