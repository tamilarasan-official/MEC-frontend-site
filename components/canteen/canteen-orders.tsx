'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { Clock, CheckCircle2, XCircle, ChefHat, Package, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10', next: 'preparing' as const },
  preparing: { icon: ChefHat, label: 'Preparing', color: 'text-blue-500 bg-blue-500/10', next: 'ready' as const },
  ready: { icon: Package, label: 'Ready', color: 'text-primary bg-primary/10', next: 'completed' as const },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-primary bg-primary/10', next: null },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-destructive bg-destructive/10', next: null },
}

type StatusFilter = 'all' | 'pending' | 'preparing' | 'ready'

export function CanteenOrders() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const { orders, updateOrderStatus } = useApp()

  const activeOrders = orders.filter(o => 
    o.status !== 'completed' && o.status !== 'cancelled'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filteredOrders = filter === 'all' 
    ? activeOrders 
    : activeOrders.filter(o => o.status === filter)

  const filters: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: activeOrders.length },
    { id: 'pending', label: 'Pending', count: activeOrders.filter(o => o.status === 'pending').length },
    { id: 'preparing', label: 'Preparing', count: activeOrders.filter(o => o.status === 'preparing').length },
    { id: 'ready', label: 'Ready', count: activeOrders.filter(o => o.status === 'ready').length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Active Orders</h2>
        <p className="text-sm text-muted-foreground">Manage incoming orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:border-primary/50"
            )}
          >
            {f.label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              filter === f.id ? "bg-white/20" : "bg-secondary"
            )}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-card mx-auto flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No {filter === 'all' ? '' : filter} orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-card border border-border p-4 animate-float-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Pickup Token - Large display for canteen */}
                {order.pickupToken && (
                  <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium tracking-wider uppercase">
                        Token
                      </p>
                      <p className="text-white text-3xl font-bold tracking-wider">
                        {order.pickupToken}
                      </p>
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 text-white")}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{order.userName}</p>
                      <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                    </div>
                  </div>
                  {!order.pickupToken && (
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <FoodImage
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-bold text-primary">Rs. {order.total}</p>
                  </div>
                </div>

                {/* Action Buttons - Large for easy touch */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="flex flex-col gap-3 mt-4">
                    {status.next && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, status.next!)}
                        className={cn(
                          "w-full h-16 text-lg font-bold transition-all shadow-lg",
                          status.next === 'preparing' && "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30",
                          status.next === 'ready' && "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30",
                          status.next === 'completed' && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30"
                        )}
                      >
                        {status.next === 'preparing' && <ChefHat className="w-6 h-6 mr-3" />}
                        {status.next === 'ready' && <Package className="w-6 h-6 mr-3" />}
                        {status.next === 'completed' && <CheckCircle2 className="w-6 h-6 mr-3" />}
                        {status.next === 'preparing' ? 'START COOKING' : status.next === 'ready' ? 'MARK READY' : 'COMPLETE ORDER'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="w-full h-12 text-base font-semibold text-destructive border-2 border-destructive hover:bg-destructive hover:text-white transition-all bg-transparent"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
