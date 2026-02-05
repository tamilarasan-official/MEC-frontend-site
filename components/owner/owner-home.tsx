'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { ClipboardList, PieChart, Menu, Settings, TrendingUp, IndianRupee, Clock, CheckCircle2, Package, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { getShopStats, getActiveOrders, type ShopStats } from '@/lib/services/owner'
import type { Order } from '@/lib/types'

interface OwnerHomeProps {
  onNavigate: (tab: string) => void
}

export function OwnerHome({ onNavigate }: OwnerHomeProps) {
  const { user } = useApp()

  const [stats, setStats] = useState<ShopStats | null>(null)
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        getShopStats(),
        getActiveOrders()
      ])

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      } else {
        // Fallback default stats if API doesn't return data
        setStats({
          todayOrders: 0,
          todayRevenue: 0,
          monthOrders: 0,
          monthRevenue: 0,
          monthProfit: 0,
          pendingOrders: 0,
          preparingOrders: 0,
          readyOrders: 0,
          totalMenuItems: 0
        })
      }

      if (ordersResponse.success && ordersResponse.data) {
        setActiveOrders(ordersResponse.data)
      } else {
        setActiveOrders([])
      }
    } catch (err) {
      console.error('Failed to fetch owner home data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate active orders count from fetched data
  const pendingCount = activeOrders.filter(o => o.status === 'pending').length
  const preparingCount = activeOrders.filter(o => o.status === 'preparing').length
  const readyCount = activeOrders.filter(o => o.status === 'ready').length
  const activeCount = pendingCount + preparingCount

  // Calculate profit margin
  const profitMargin = stats && stats.monthRevenue > 0
    ? Math.round((stats.monthProfit / stats.monthRevenue) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Hello, {user?.name?.split(' ')[0]}</h2>
        <p className="text-muted-foreground mt-1">Here's your business overview</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {stats?.monthRevenue || 0}</p>
          <p className="text-xs text-primary mt-1">{stats?.monthOrders || 0} orders</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-4 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Monthly Profit</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {stats?.monthProfit || 0}</p>
          <p className="text-xs text-emerald-500 mt-1">
            {profitMargin}% margin
          </p>
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
          <p className="text-sm text-primary mt-1">{activeCount} active</p>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
          <p className="text-sm text-blue-500 mt-1">View insights</p>
        </button>

        <button
          onClick={() => onNavigate('menu')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-orange-500/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
            <Menu className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Menu Items</h3>
          <p className="text-sm text-orange-500 mt-1">{stats?.totalMenuItems || 0} items</p>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-muted-foreground/30 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Settings className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage shop</p>
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
      {activeOrders.length === 0 && (
        <div className="rounded-2xl bg-card border border-border p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No active orders at the moment</p>
        </div>
      )}
    </div>
  )
}
