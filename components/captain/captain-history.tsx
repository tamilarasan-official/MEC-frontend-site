'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { getOrderHistory, type ShopOrder } from '@/lib/captain-api'
import { CheckCircle2, XCircle, Package, AlertCircle, RefreshCw } from 'lucide-react'

export function CaptainHistory() {
  const { user, isHydrated } = useApp()
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchHistory = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const result = await getOrderHistory()
      if (result.success && result.data) {
        // Sort by date descending
        const sortedOrders = result.data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sortedOrders)
      } else {
        setError(result.error || 'Failed to fetch order history')
      }
    } catch (err) {
      console.error('Error fetching order history:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Only fetch when auth is ready
    if (isHydrated && user) {
      fetchHistory()
    }
  }, [fetchHistory, isHydrated, user])

  const handleRefresh = () => {
    fetchHistory(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            <div className="flex justify-between pt-2 border-t border-border">
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load History</h3>
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

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No completed orders yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{orders.length} orders</p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl bg-card border border-border p-4 space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                order.status === 'completed' ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
                {order.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="font-bold text-foreground">#{order.pickupToken}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.status === 'completed'
                ? 'bg-primary/10 text-primary'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {order.status}
            </span>
          </div>

          {/* Customer */}
          <p className="text-sm text-muted-foreground">Customer: {order.userName}</p>

          {/* Items Summary */}
          <div className="text-sm text-foreground">
            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
          </div>

          {/* Total */}
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">Rs. {order.total}</span>
          </div>

          {/* Completed time if available */}
          {order.completedAt && (
            <p className="text-xs text-muted-foreground">
              Completed: {new Date(order.completedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
