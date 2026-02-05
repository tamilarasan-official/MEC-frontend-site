'use client'

import { useApp } from '@/lib/context'
import { CheckCircle2, XCircle, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CanteenHistory() {
  const { orders } = useApp()

  const completedOrders = orders.filter(o => 
    o.status === 'completed' || o.status === 'cancelled'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const todayRevenue = completedOrders
    .filter(o => {
      const today = new Date()
      const orderDate = new Date(o.createdAt)
      return o.status === 'completed' && 
        orderDate.toDateString() === today.toDateString()
    })
    .reduce((sum, o) => sum + o.total, 0)

  const completedCount = completedOrders.filter(o => o.status === 'completed').length
  const cancelledCount = completedOrders.filter(o => o.status === 'cancelled').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Order History</h2>
        <p className="text-sm text-muted-foreground">View completed and cancelled orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-lg font-bold text-foreground">Rs. {todayRevenue}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
          <p className="text-lg font-bold text-foreground">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <XCircle className="w-5 h-5 text-destructive mb-2" />
          <p className="text-lg font-bold text-foreground">{cancelledCount}</p>
          <p className="text-xs text-muted-foreground">Cancelled</p>
        </div>
      </div>

      {/* Orders List */}
      {completedOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-card mx-auto flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No order history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedOrders.map((order, index) => {
            const isCompleted = order.status === 'completed'
            
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-card border border-border animate-float-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">#{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.userName}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    isCompleted ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {isCompleted ? 'Completed' : 'Cancelled'}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="font-bold text-primary">Rs. {order.total}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
