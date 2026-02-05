'use client'

import { useMemo } from 'react'
import { useApp } from '@/lib/context'
import { useAccountant } from '@/lib/accountant-context'
import { UserCheck, Users, CreditCard, FileText, Clock, IndianRupee, TrendingUp, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AccountantDashboardHomeProps {
  onNavigate: (tab: string) => void
}

export function AccountantDashboardHome({ onNavigate }: AccountantDashboardHomeProps) {
  const { user } = useApp()
  const {
    students,
    pendingApprovals,
    transactions,
    stats,
    isLoadingStudents,
    isLoadingApprovals,
    isLoadingTransactions,
    refreshAll
  } = useAccountant()

  const isLoading = isLoadingStudents || isLoadingApprovals || isLoadingTransactions

  // Calculate transaction stats
  const transactionStats = useMemo(() => {
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Ensure transactions is an array
    const txList = transactions || []

    const todayTransactions = txList.filter(t => {
      const txDate = new Date(t.createdAt)
      return txDate.toDateString() === today.toDateString()
    })

    const todayCredits = todayTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthRecharges = txList
      .filter(t => {
        const txDate = new Date(t.createdAt)
        return txDate >= thisMonth && t.type === 'credit'
      })
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      todayTransactions,
      todayCredits,
      monthRecharges
    }
  }, [transactions])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="text-muted-foreground mt-1">Manage student accounts and payments</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshAll}
          disabled={isLoading}
          className="mt-1"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-4 border border-orange-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Pending Approvals</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.pendingCount}</p>
          {stats.pendingCount > 0 && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 text-xs font-medium animate-pulse">
              Action needed
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-4 border border-blue-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Total Balance</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {stats.totalBalance.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-4 border border-emerald-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Month Recharges</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {transactionStats.monthRecharges.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('approvals')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-orange-500/30 hover:scale-[1.02] transition-all duration-200 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Approvals</h3>
          <p className="text-sm text-orange-500 mt-1">{stats.pendingCount} pending</p>
        </button>

        <button
          onClick={() => onNavigate('students')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:scale-[1.02] transition-all duration-200 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Students</h3>
          <p className="text-sm text-primary mt-1">{stats.totalStudents} registered</p>
        </button>

        <button
          onClick={() => onNavigate('payments')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-blue-500/30 hover:scale-[1.02] transition-all duration-200 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Payments</h3>
          <p className="text-sm text-blue-500 mt-1">Add balance</p>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-200 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Reports</h3>
          <p className="text-sm text-emerald-500 mt-1">View finances</p>
        </button>
      </div>

      {/* Recent Activity */}
      {transactionStats.todayTransactions.length > 0 && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <h3 className="font-semibold text-foreground">Today's Activity</h3>
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Recharges</span>
              <span className="font-semibold text-primary">Rs. {transactionStats.todayCredits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-muted-foreground">Transactions</span>
              <span className="font-semibold text-foreground">{transactionStats.todayTransactions.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator overlay for data refresh */}
      {isLoading && (students?.length || 0) > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border border-border rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Refreshing...</span>
        </div>
      )}
    </div>
  )
}
