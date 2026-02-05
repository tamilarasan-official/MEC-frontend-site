'use client'

import { useApp } from '@/lib/context'
import { Clock, CheckCircle2, XCircle, ChefHat, Package, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' },
  preparing: { icon: ChefHat, label: 'Preparing', color: 'text-blue-500 bg-blue-500/10' },
  ready: { icon: Package, label: 'Ready', color: 'text-primary bg-primary/10' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-primary bg-primary/10' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-destructive bg-destructive/10' },
}

export function ChairmanOrders() {
  const { orders } = useApp()

  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const preparingCount = orders.filter(o => o.status === 'preparing').length
  const completedCount = orders.filter(o => o.status === 'completed').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Order Overview</h2>
        <p className="text-sm text-muted-foreground">Monitor all canteen orders</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <Clock className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <ChefHat className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{preparingCount}</p>
          <p className="text-xs text-muted-foreground">Preparing</p>
        </div>
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Total Summary */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-foreground">{orders.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-xl font-bold text-primary">
              {orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">All Orders</h3>
        <div className="space-y-3">
          {sortedOrders.map((order, index) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

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
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
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
      </div>
    </div>
  )
}
