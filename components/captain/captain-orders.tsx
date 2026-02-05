'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '@/lib/context'
import { getActiveOrders, updateOrderStatus as apiUpdateOrderStatus, type ShopOrder } from '@/lib/captain-api'
import { Clock, ChefHat, CheckCircle2, XCircle, Package, User, AlertCircle, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FoodImage } from '@/components/ui/food-image'
import {
  initializeSocket,
  joinShopRoom,
  leaveShopRoom,
  onNewOrder,
  onOrderStatusChange,
  onOrderCancelled,
  SOCKET_EVENTS,
  type OrderEventPayload,
} from '@/lib/socket'

type FilterStatus = 'all' | 'pending' | 'preparing' | 'ready'

export function CaptainOrders() {
  const { user, isHydrated } = useApp()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const result = await getActiveOrders()
      if (result.success && result.data) {
        setOrders(result.data)
      } else {
        setError(result.error || 'Failed to fetch orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initialize socket connection and real-time updates
  useEffect(() => {
    // Only proceed when auth is ready and user has a shopId
    if (!isHydrated || !user) return

    const shopId = user.shopId
    if (!shopId) {
      console.log('[CaptainOrders] No shopId found for user')
      fetchOrders()
      return
    }

    // Initial fetch
    fetchOrders()

    // Initialize socket connection
    const socket = initializeSocket()

    // Track connection status
    const handleConnect = () => {
      console.log('[CaptainOrders] Socket connected, joining shop room:', shopId)
      setIsSocketConnected(true)
      joinShopRoom(shopId)
    }

    const handleDisconnect = () => {
      console.log('[CaptainOrders] Socket disconnected')
      setIsSocketConnected(false)
    }

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect)
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect)

    // If already connected, join room immediately
    if (socket.connected) {
      handleConnect()
    }

    // Handle new order event - add to list
    const unsubNewOrder = onNewOrder((orderData: OrderEventPayload) => {
      console.log('[CaptainOrders] New order received:', orderData)

      // Show alert
      setNewOrderAlert(`New order #${orderData.orderNumber}!`)
      setTimeout(() => setNewOrderAlert(null), 5000)

      // Play notification sound (optional)
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
      }

      // Refresh orders to get full order data
      fetchOrders(true)
    })

    // Handle status change event
    const unsubStatusChange = onOrderStatusChange((orderData: OrderEventPayload) => {
      console.log('[CaptainOrders] Order status changed:', orderData)

      // Update local state
      setOrders(prev => {
        // If order is completed or cancelled, remove it
        if (orderData.status === 'completed' || orderData.status === 'cancelled') {
          return prev.filter(o => o.id !== orderData.orderId)
        }
        // Otherwise update the status
        return prev.map(o =>
          o.id === orderData.orderId ? { ...o, status: orderData.status } : o
        )
      })
    })

    // Handle order cancelled
    const unsubCancelled = onOrderCancelled((orderData: OrderEventPayload) => {
      console.log('[CaptainOrders] Order cancelled:', orderData)
      setOrders(prev => prev.filter(o => o.id !== orderData.orderId))
    })

    // Fallback polling every 30 seconds (reduced from 15 since we have real-time)
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 30000)

    // Cleanup
    return () => {
      console.log('[CaptainOrders] Cleaning up socket listeners')
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect)
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
      unsubNewOrder()
      unsubStatusChange()
      unsubCancelled()
      if (shopId) {
        leaveShopRoom(shopId)
      }
      clearInterval(interval)
    }
  }, [fetchOrders, isHydrated, user])

  const handleUpdateStatus = async (orderId: string, newStatus: 'preparing' | 'ready' | 'completed' | 'cancelled') => {
    setUpdatingOrderId(orderId)
    setUpdateError(null)

    try {
      const result = await apiUpdateOrderStatus(orderId, newStatus)
      if (result.success) {
        // Update local state
        if (newStatus === 'completed' || newStatus === 'cancelled') {
          // Remove from active orders
          setOrders(prev => prev.filter(o => o.id !== orderId))
        } else {
          // Update status in place
          setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: newStatus } : o
          ))
        }
      } else {
        setUpdateError(result.error || 'Failed to update order status')
        // Clear error after 3 seconds
        setTimeout(() => setUpdateError(null), 3000)
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      setUpdateError('An unexpected error occurred')
      setTimeout(() => setUpdateError(null), 3000)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleRefresh = () => {
    fetchOrders(true)
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

  const getNextStatus = (currentStatus: string): 'preparing' | 'ready' | 'completed' | null => {
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
      <div className="space-y-4">
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 px-4 py-2 rounded-full bg-card border border-border">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Orders skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="px-4 py-3 bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Orders</h3>
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

  return (
    <div className="space-y-4">
      {/* New order alert */}
      {newOrderAlert && (
        <div className="fixed top-4 left-4 right-4 z-50 p-4 rounded-xl bg-primary text-primary-foreground shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <p className="text-sm font-medium">{newOrderAlert}</p>
          </div>
        </div>
      )}

      {/* Update error toast */}
      {updateError && (
        <div className="fixed top-4 left-4 right-4 z-50 p-4 rounded-xl bg-destructive text-destructive-foreground shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{updateError}</p>
          </div>
        </div>
      )}

      {/* Real-time connection indicator */}
      <div className="flex items-center gap-2 text-xs">
        {isSocketConnected ? (
          <span className="flex items-center gap-1 text-emerald-600">
            <Wifi className="w-3 h-3" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground">
            <WifiOff className="w-3 h-3" />
            Polling
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
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
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex-shrink-0 p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50 ml-auto"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
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
                className={cn(
                  "rounded-2xl bg-card border border-border overflow-hidden transition-opacity",
                  isUpdating && "opacity-70"
                )}
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
