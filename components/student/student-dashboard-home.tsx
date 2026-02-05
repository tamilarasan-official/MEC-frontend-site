'use client'

import { useApp } from '@/lib/context'
import { ShoppingBag, Package, History, Bell, Wallet, Plus, UtensilsCrossed, Shirt, FileText, ChevronRight } from 'lucide-react'
import { PendingPaymentsCard } from './pending-payments-card'

interface StudentDashboardHomeProps {
  onNavigate: (tab: string) => void
  onNavigateToCanteen?: () => void  // Direct navigation to canteen menu
}

export function StudentDashboardHome({ onNavigate, onNavigateToCanteen }: StudentDashboardHomeProps) {
  const { user, orders } = useApp()
  
  const activeOrders = orders.filter(o => 
    o.userId === user?.id && (o.status === 'pending' || o.status === 'preparing')
  ).length

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Greeting Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-muted-foreground text-sm">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">
            {user?.name?.split(' ')[0]}
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Wallet Balance Card - Premium Glass Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-[1px] shadow-xl shadow-primary/20">
        <div className="relative rounded-[23px] bg-gradient-to-br from-primary/90 via-emerald-500/90 to-teal-500/90 p-6 overflow-hidden">
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium">Available Balance</p>
                <h2 className="text-4xl font-bold text-primary-foreground mt-2 tracking-tight">
                  <span className="text-2xl">Rs.</span> {user?.balance?.toLocaleString('en-IN') || '0'}
                </h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            
            {/* Add Money & History moved to Profile/Settings */}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-black/10 blur-xl" />
        </div>
      </div>

      {/* Pending Payments Section */}
      <PendingPaymentsCard onNavigate={onNavigate} />

      {/* Services Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Services</h3>
        
        {/* Services Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Madras Canteen - Active - Goes directly to menu */}
          <button
            onClick={() => onNavigateToCanteen ? onNavigateToCanteen() : onNavigate('stores')}
            className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group active:scale-[0.97]"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-7 h-7 text-primary" />
            </div>
            <h4 className="font-medium text-foreground text-sm">Canteen</h4>
            <p className="text-xs text-primary mt-0.5">Open Now</p>
          </button>

          {/* MadrasLaundry - Coming Soon */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-card/50 border border-border/50 text-center opacity-50">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
              <Shirt className="w-7 h-7 text-blue-400" />
            </div>
            <h4 className="font-medium text-foreground text-sm">Laundry</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Soon</p>
          </div>

          {/* MadrasXerox - Coming Soon */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-card/50 border border-border/50 text-center opacity-50">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-orange-400" />
            </div>
            <h4 className="font-medium text-foreground text-sm">Xerox</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Soon</p>
          </div>
        </div>
      </div>

      {/* Active Orders Banner */}
      {activeOrders > 0 && (
        <button
          onClick={() => onNavigate('history')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-foreground">Active Orders</h4>
            <p className="text-sm text-blue-400">{activeOrders} order{activeOrders > 1 ? 's' : ''} in progress</p>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-400" />
        </button>
      )}

      {/* Quick Stats */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">This Month</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Orders */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {orders.filter(o => o.userId === user?.id).length}
                </p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            </div>
          </div>
          
          {/* Spent */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  Rs.{orders.filter(o => o.userId === user?.id).reduce((sum, o) => sum + o.total, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Spent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
          <button 
            onClick={() => onNavigate('history')}
            className="text-primary text-sm font-medium hover:underline"
          >
            View All
          </button>
        </div>
        
        {orders.filter(o => o.userId === user?.id).length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Start ordering to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders
              .filter(o => o.userId === user?.id)
              .slice(0, 3)
              .map(order => (
                <button
                  key={order.id}
                  onClick={() => onNavigate('history')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {order.items.map(i => i.name).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">Rs.{order.total}</p>
                    <p className={`text-xs mt-0.5 ${
                      order.status === 'completed' ? 'text-primary' : 
                      order.status === 'cancelled' ? 'text-destructive' : 'text-blue-400'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  )
}
