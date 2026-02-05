'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { TrendingUp, PieChart, UtensilsCrossed, Store, Settings, Users, ShoppingBag, IndianRupee, Loader2, AlertCircle, Wallet } from 'lucide-react'
import { getDashboardStats, type DashboardStats } from '@/lib/services/superadmin-api'

interface SuperAdminDashboardHomeProps {
  onNavigate: (tab: string) => void
}

export function SuperAdminDashboardHome({ onNavigate }: SuperAdminDashboardHomeProps) {
  const { user } = useApp()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getDashboardStats()

      if (result.success && result.data) {
        setStats(result.data)
      } else {
        setError(result.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Dashboard stats error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Failed to Load Dashboard</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Hello, {user?.name?.split(' ')[0]}</h2>
        <p className="text-muted-foreground mt-1">Complete system overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {stats?.monthlyRevenue || 0}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-4 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Monthly Profit</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {Math.round(stats?.monthlyProfit || 0)}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalOrders || 0}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-4 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalStudents || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('analytics')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
          <p className="text-sm text-primary mt-1">View all insights</p>
        </button>

        <button
          onClick={() => onNavigate('menu')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-orange-500/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Menu Items</h3>
          <p className="text-sm text-orange-500 mt-1">{stats?.totalMenuItems || 0} items</p>
        </button>

        <button
          onClick={() => onNavigate('shops')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <Store className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Shops</h3>
          <p className="text-sm text-blue-500 mt-1">{stats?.activeShops || 0} active</p>
        </button>

        <button
          onClick={() => onNavigate('payments')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-amber-500/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Payments</h3>
          <p className="text-sm text-amber-500 mt-1">Collect fees</p>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-muted-foreground/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Settings className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">System config</p>
        </button>
      </div>

      {/* System Stats */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="font-semibold text-foreground mb-4">System Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Active Shops</span>
            <span className="font-semibold text-foreground">{stats?.activeShops || 0} / {stats?.totalShops || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Menu Items</span>
            <span className="font-semibold text-foreground">{stats?.totalMenuItems || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Transactions</span>
            <span className="font-semibold text-foreground">{stats?.totalTransactions || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
