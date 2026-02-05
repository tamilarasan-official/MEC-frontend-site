'use client'

import { useApp } from '@/lib/context'
import { getCategoryName } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'
import { TrendingUp, Users, ShoppingBag, Wallet, ArrowUpRight, PieChart, Activity } from 'lucide-react'

export function ChairmanInsights() {
  const { orders, students, foodItems } = useApp()

  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0)

  const todayOrders = orders.filter(o => {
    const today = new Date()
    const orderDate = new Date(o.createdAt)
    return orderDate.toDateString() === today.toDateString()
  })

  const todayRevenue = todayOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0)

  const avgOrderValue = completedOrders.length > 0 
    ? Math.round(totalRevenue / completedOrders.length) 
    : 0

  const popularItems = foodItems
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Insights Dashboard</h2>
        <p className="text-sm text-muted-foreground">Executive overview of MEC Food Hub</p>
      </div>

      {/* Hero Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-4xl font-bold text-foreground">Rs. {totalRevenue}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-purple-500" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary text-sm">
          <ArrowUpRight className="w-4 h-4" />
          <span className="font-medium">+18.5% from last month</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <Users className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
          <p className="text-xs text-muted-foreground">Active Students</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <ShoppingBag className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <PieChart className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">Rs. {avgOrderValue}</p>
          <p className="text-xs text-muted-foreground">Avg Order Value</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <Wallet className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">Rs. {totalBalance}</p>
          <p className="text-xs text-muted-foreground">Wallet Balance</p>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Today&apos;s Performance</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-secondary">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-xl font-bold text-foreground">{todayOrders.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-xl font-bold text-primary">Rs. {todayRevenue}</p>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Top Performing Items</h3>
        <div className="space-y-3">
          {popularItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border animate-float-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">#{index + 1}</span>
              </div>
              <FoodImage
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{getCategoryName(item.category)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">Rs. {item.price}</p>
                <p className="text-xs text-muted-foreground">Rating: {item.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
