'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { getOrderStats, getActiveOrders, type OrderStats, type ShopOrder } from '@/lib/captain-api'
import { ClipboardList, History, Settings, Package, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface CaptainHomeProps {
  onNavigate: (tab: string) => void
}

export function CaptainHome({ onNavigate }: CaptainHomeProps) {
  const { user, isHydrated } = useApp()

  const [stats, setStats] = useState<OrderStats | null>(null)
  const [activeOrders, setActiveOrders] = useState<ShopOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const [statsResult, ordersResult] = await Promise.all([
        getOrderStats(),
        getActiveOrders()
      ])

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      } else {
        console.error('Failed to fetch stats:', statsResult.error)
      }

      if (ordersResult.success && ordersResult.data) {
        setActiveOrders(ordersResult.data)
      } else {
        console.error('Failed to fetch active orders:', ordersResult.error)
      }

      if (!statsResult.success && !ordersResult.success) {
        setError('Failed to load dashboard data. Please try again.')
      }
    } catch (err) {
      console.error('Error fetching captain home data:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Only fetch when auth is ready
    if (!isHydrated || !user) return

    fetchData()

    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchData, isHydrated, user])

  const handleRefresh = () => {
    fetchData(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Welcome skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-card animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-card animate-pulse rounded-lg" />
        </div>

        {/* Summary skeleton */}
        <div className="rounded-2xl bg-card p-5 border border-border">
          <div className="h-4 w-32 bg-muted animate-pulse rounded mb-3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-8 w-12 mx-auto bg-muted animate-pulse rounded" />
                <div className="h-3 w-16 mx-auto bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse mb-4" />
              <div className="h-5 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && !stats && activeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Dashboard</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  const todayOrders = stats?.todayOrders || 0
  const completedToday = stats?.completedToday || 0
  const inProgress = stats?.inProgress || 0
  const pendingCount = stats?.pendingCount || 0
  const preparingCount = stats?.preparingCount || 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="text-muted-foreground mt-1">Manage your orders efficiently</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Today's Summary */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-5 border border-primary/20">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{todayOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{completedToday}</p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{inProgress}</p>
            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('orders')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Order Queue</h3>
          <p className="text-sm text-primary mt-1">{pendingCount + preparingCount} active</p>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <History className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">History</h3>
          <p className="text-sm text-blue-500 mt-1">View past orders</p>
        </button>
      </div>

      {/* Active Orders Preview */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Active Orders</h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-sm text-primary"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {activeOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  order.status === 'pending' ? 'bg-orange-500/10' :
                  order.status === 'preparing' ? 'bg-blue-500/10' :
                  'bg-primary/10'
                }`}>
                  {order.status === 'pending' && <Clock className="w-5 h-5 text-orange-500" />}
                  {order.status === 'preparing' && <Package className="w-5 h-5 text-blue-500" />}
                  {order.status === 'ready' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">#{order.pickupToken}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                      order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">Rs. {order.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no active orders */}
      {activeOrders.length === 0 && !isLoading && (
        <div className="rounded-2xl bg-card border border-border p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No active orders at the moment</p>
        </div>
      )}

      {/* Settings Link */}
      <button
        onClick={() => onNavigate('settings')}
        className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-medium text-foreground">Settings</h4>
          <p className="text-sm text-muted-foreground">Notifications & preferences</p>
        </div>
      </button>
    </div>
  )
}
