'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { Clock, ChefHat, CheckCircle2, XCircle, Package, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FoodImage } from '@/components/ui/food-image'
import { getActiveOrders, updateOrderStatus as updateOrderStatusApi } from '@/lib/services/owner'
import type { Order } from '@/lib/types'

type FilterStatus = 'all' | 'pending' | 'preparing' | 'ready'

export function OwnerOrders() {
  const { user } = useApp()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getActiveOrders()

      if (response.success && response.data) {
        // Sort by creation date (newest first)
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sortedOrders)
      } else {
        setOrders([])
        if (response.error?.message) {
          setError(response.error.message)
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId)

    try {
      const response = await updateOrderStatusApi(orderId, newStatus)

      if (response.success) {
        if (newStatus === 'completed' || newStatus === 'cancelled') {
          // Remove from active orders list
          setOrders(prev => prev.filter(o => o.id !== orderId))
        } else {
          // Update the order status in state
          setOrders(prev =>
            prev.map(o =>
              o.id === orderId ? { ...o, status: newStatus } : o
            )
          )
        }
      } else {
        alert(response.error?.message || 'Failed to update order status')
      }
    } catch (err) {
      console.error('Failed to update order status:', err)
      alert('Failed to update order status. Please try again.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  const statusFilters: { label: string; value: FilterStatus; count: number }[] = [
    { label: 'All', value: 'all', count: orders.length },
    { label: 'Pending', value: 'pending', count: orders.filter(o => o.status === 'pending').length },
    { label: 'Preparing', value: 'preparing', count: orders.filter(o => o.status === 'preparing').length },
    { label: 'Ready', value: 'ready', count: orders.filter(o => o.status === 'ready').length },
  ]

  const getNextStatus = (currentStatus: string): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending': return 'preparing'
      case 'preparing': return 'ready'
      case 'ready': return 'completed'
      default: return null
    }
  }

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'pending': return 'Start Preparing'
      case 'preparing': return 'Mark Ready'
      case 'ready': return 'Complete Order'
      default: return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive mb-4 text-center px-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {statusFilters.map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status)
            const actionLabel = getStatusAction(order.status)
            const isUpdating = updatingOrderId === order.id

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-card border border-border overflow-hidden"
              >
                {/* Order Header */}
                <div className={cn(
                  "px-4 py-3 flex items-center justify-between",
                  order.status === 'pending' && "bg-orange-500/10",
                  order.status === 'preparing' && "bg-blue-500/10",
                  order.status === 'ready' && "bg-primary/10"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      order.status === 'pending' && "bg-orange-500/20",
                      order.status === 'preparing' && "bg-blue-500/20",
                      order.status === 'ready' && "bg-primary/20"
                    )}>
                      {order.status === 'pending' && <Clock className="w-5 h-5 text-orange-500" />}
                      {order.status === 'preparing' && <ChefHat className="w-5 h-5 text-blue-500" />}
                      {order.status === 'ready' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">#{order.pickupToken}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium capitalize",
                    order.status === 'pending' && "bg-orange-500/20 text-orange-500",
                    order.status === 'preparing' && "bg-blue-500/20 text-blue-500",
                    order.status === 'ready' && "bg-primary/20 text-primary"
                  )}>
                    {order.status}
                  </span>
                </div>

                {/* Order Details */}
                <div className="p-4 space-y-4">
                  {/* Customer */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{order.userName}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <FoodImage
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-primary font-semibold">{item.quantity}x</span> @ Rs. {item.offerPrice || item.price}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          Rs. {(item.offerPrice || item.price) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">Rs. {order.total}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {order.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        disabled={isUpdating}
                        className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    )}
                    {nextStatus && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, nextStatus)}
                        disabled={isUpdating}
                        className={cn(
                          "flex-1",
                          order.status === 'pending' && "bg-blue-500 hover:bg-blue-600",
                          order.status === 'preparing' && "bg-primary hover:bg-primary/90",
                          order.status === 'ready' && "bg-primary hover:bg-primary/90"
                        )}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <>
                            {order.status === 'pending' && <ChefHat className="w-4 h-4 mr-2" />}
                            {order.status === 'preparing' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                            {order.status === 'ready' && <Package className="w-4 h-4 mr-2" />}
                          </>
                        )}
                        {actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
