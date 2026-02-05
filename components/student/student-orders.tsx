'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { studentApi, mapOrderResponseToOrder } from '@/lib/studentApi'
import { Clock, CheckCircle2, XCircle, ChefHat, Package, QrCode, Loader2, AlertCircle, RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'
import { OrderQRCard } from '@/components/order-qr-card'
import type { Order } from '@/lib/types'

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' },
  preparing: { icon: ChefHat, label: 'Preparing', color: 'text-blue-500 bg-blue-500/10' },
  ready: { icon: Package, label: 'Ready', color: 'text-primary bg-primary/10' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-primary bg-primary/10' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-destructive bg-destructive/10' },
}

export function StudentOrders() {
  const { user } = useApp()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // Fetch orders from API
  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setIsLoading(true)
    setError(null)

    try {
      const result = await studentApi.getMyOrders()
      if (result.success && result.data) {
        const mappedOrders = result.data.map(mapOrderResponseToOrder)
        // Sort by creation date, newest first
        mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(mappedOrders)
      } else {
        setError(result.error || 'Failed to load orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId)
    setCancelError(null)

    try {
      const result = await studentApi.cancelOrder(orderId)
      if (result.success) {
        // Update the order status locally
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled' as const } : order
        ))
      } else {
        setCancelError(result.error || 'Failed to cancel order')
      }
    } catch (err) {
      console.error('Error cancelling order:', err)
      setCancelError('Failed to cancel order. Please try again.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  const handleRetry = () => {
    fetchOrders()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Track active orders and view history</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Track active orders and view history</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-foreground font-medium">Failed to load orders</p>
          <p className="text-muted-foreground text-sm text-center max-w-xs">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Track active orders and view history</p>
        </div>
        <button
          onClick={handleRetry}
          className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
          title="Refresh orders"
        >
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Cancel error toast */}
      {cancelError && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-destructive text-sm flex-1">{cancelError}</p>
          <button
            onClick={() => setCancelError(null)}
            className="p-1 hover:bg-destructive/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-destructive" />
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-card mx-auto flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No orders yet</p>
          <p className="text-sm text-muted-foreground">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon
            const canCancel = order.status === 'pending'
            const isCancelling = cancellingOrderId === order.id

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-card border border-border p-4 animate-float-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Pickup Token - Prominent display for active orders */}
                {order.status !== 'completed' && order.status !== 'cancelled' && order.pickupToken && (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full mb-4 rounded-2xl bg-gradient-to-r from-primary via-emerald-500 to-teal-500 p-[2px] hover:shadow-lg hover:shadow-primary/30 transition-all group"
                  >
                    <div className="rounded-[14px] bg-gradient-to-r from-primary/95 via-emerald-500/95 to-teal-500/95 p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                      <div className="relative flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">
                            Pickup Token
                          </p>
                          <p className="text-primary-foreground text-4xl font-bold tracking-widest mt-1">
                            {order.pickupToken}
                          </p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <QrCode className="w-7 h-7 text-primary-foreground" />
                        </div>
                      </div>
                      <p className="text-primary-foreground/70 text-xs mt-3 text-left">
                        Tap to show QR at counter
                      </p>
                    </div>
                  </button>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">#{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                </div>

                {/* Show token badge for completed orders */}
                {(order.status === 'completed' || order.status === 'cancelled') && order.pickupToken && (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">Token:</span>
                    <span className="text-sm font-mono font-semibold text-foreground">{order.pickupToken}</span>
                    <QrCode className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                )}

                <div className="space-y-2">
                  {order.items.map((item, itemIndex) => (
                    <div key={`${order.id}-${item.id || itemIndex}`} className="flex items-center gap-3">
                      <FoodImage
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Rs. {(item.isOffer && item.offerPrice ? item.offerPrice : item.price) * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">Rs. {order.total}</span>
                </div>

                {/* Cancel button for pending orders */}
                {canCancel && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={isCancelling}
                    className="w-full mt-3 py-2.5 rounded-xl border border-destructive/30 text-destructive font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Order
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* QR Card Modal */}
      {selectedOrder && (
        <OrderQRCard
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
