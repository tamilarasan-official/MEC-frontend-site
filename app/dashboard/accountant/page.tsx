'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/context'
import { AccountantProvider } from '@/lib/accountant-context'
import { BottomNav } from '@/components/bottom-nav'
import { AccountantDashboardHome } from '@/components/accountant/accountant-dashboard-home'
import { AccountantApprovals } from '@/components/accountant/accountant-approvals'
import { AccountantStudents } from '@/components/accountant/accountant-students'
import { AccountantPayments } from '@/components/accountant/accountant-payments'
import { AccountantReports } from '@/components/accountant/accountant-reports'
import { ChevronLeft } from 'lucide-react'

function AccountantDashboardContent({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Accountant Dashboard'
      case 'approvals': return 'Student Approvals'
      case 'students': return 'All Students'
      case 'payments': return 'Payments & Balance'
      case 'reports': return 'Financial Reports'
      default: return 'Accountant'
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
                <p className="text-xs text-muted-foreground">Manage accounts & payments</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {activeTab === 'dashboard' && <AccountantDashboardHome onNavigate={setActiveTab} />}
        {activeTab === 'approvals' && <AccountantApprovals />}
        {activeTab === 'students' && <AccountantStudents />}
        {activeTab === 'payments' && <AccountantPayments />}
        {activeTab === 'reports' && <AccountantReports />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        role="accountant"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}

export default function AccountantDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, isHydrated } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isHydrated) return
    if (!user || user.role !== 'accountant') {
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

  return (
    <AccountantProvider>
      <AccountantDashboardContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </AccountantProvider>
  )
}
