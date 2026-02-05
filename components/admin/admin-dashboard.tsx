'use client'

import { useApp } from '@/lib/context'
import { Users, ShoppingBag, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function AdminDashboard() {
  const { orders, students, foodItems } = useApp()

  const todayOrders = orders.filter(o => {
    const today = new Date()
    const orderDate = new Date(o.createdAt)
    return orderDate.toDateString() === today.toDateString()
  })

  const todayRevenue = todayOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0)

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0)

  const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0)

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10',
      change: '+12%',
      up: true
    },
    {
      label: 'Today Orders',
      value: todayOrders.length,
      icon: ShoppingBag,
      color: 'text-primary bg-primary/10',
      change: '+8%',
      up: true
    },
    {
      label: 'Today Revenue',
      value: `Rs. ${todayRevenue}`,
      icon: TrendingUp,
      color: 'text-amber-500 bg-amber-500/10',
      change: '+15%',
      up: true
    },
    {
      label: 'Total Balance',
      value: `Rs. ${totalBalance}`,
      icon: Wallet,
      color: 'text-purple-500 bg-purple-500/10',
      change: '-2%',
      up: false
    },
  ]

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of MEC Food Hub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="p-4 rounded-2xl bg-card border border-border animate-float-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className={`flex items-center text-xs font-medium ${stat.up ? 'text-primary' : 'text-destructive'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground">Rs. {totalRevenue}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Menu Items</p>
            <p className="text-3xl font-bold text-primary">{foodItems.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <div className="space-y-3">
          {recentOrders.map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border animate-float-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {order.userName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{order.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} - #{order.id}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">Rs. {order.total}</p>
                <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
