'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { TrendingUp, IndianRupee, ShoppingBag, Users, Search, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'today' | 'week' | 'month'

export function SuperAdminAnalytics() {
  const { orders, transactions, students, foodItems, shops } = useApp()
  const [filter, setFilter] = useState<FilterType>('month')
  const [searchStudent, setSearchStudent] = useState('')

  // Date filters
  const today = new Date()
  const getFilterDate = () => {
    switch (filter) {
      case 'today':
        return new Date(today.getFullYear(), today.getMonth(), today.getDate())
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return weekAgo
      case 'month':
        return new Date(today.getFullYear(), today.getMonth(), 1)
      default:
        return new Date(0)
    }
  }

  const filterDate = getFilterDate()
  const completedOrders = orders.filter(o => o.status === 'completed')
  
  const filteredOrders = completedOrders.filter(o => new Date(o.createdAt) >= filterDate)
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
  const totalProfit = filteredOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
      const costPrice = item.costPrice || (item.price * 0.6)
      const sellPrice = item.offerPrice || item.price
      return itemSum + ((sellPrice - costPrice) * item.quantity)
    }, 0)
  }, 0)

  // Top items
  const itemSales: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {}
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.id]) {
        itemSales[item.id] = { name: item.name, quantity: 0, revenue: 0, profit: 0 }
      }
      const sellPrice = item.offerPrice || item.price
      const costPrice = item.costPrice || (item.price * 0.6)
      itemSales[item.id].quantity += item.quantity
      itemSales[item.id].revenue += sellPrice * item.quantity
      itemSales[item.id].profit += (sellPrice - costPrice) * item.quantity
    })
  })
  const topItems = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  // Student spending
  const studentSpending: Record<string, { name: string; total: number; orders: number }> = {}
  filteredOrders.forEach(order => {
    if (!studentSpending[order.userId]) {
      studentSpending[order.userId] = { name: order.userName, total: 0, orders: 0 }
    }
    studentSpending[order.userId].total += order.total
    studentSpending[order.userId].orders += 1
  })
  const topStudents = Object.values(studentSpending)
    .filter(s => s.name.toLowerCase().includes(searchStudent.toLowerCase()))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Shop performance
  const shopPerformance = shops.map(shop => {
    const shopOrders = filteredOrders.filter(o => o.shopId === shop.id)
    const revenue = shopOrders.reduce((sum, o) => sum + o.total, 0)
    return { ...shop, revenue, orders: shopOrders.length }
  }).sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {(['today', 'week', 'month', 'all'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f === 'all' ? 'All Time' : f}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {totalRevenue}</p>
        </div>
        
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Profit</span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {Math.round(totalProfit)}</p>
        </div>
        
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Orders</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{filteredOrders.length}</p>
        </div>
        
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Unique Customers</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{Object.keys(studentSpending).length}</p>
        </div>
      </div>

      {/* Shop Performance */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="font-semibold text-foreground mb-4">Shop Performance</h3>
        <div className="space-y-3">
          {shopPerformance.map((shop) => (
            <div key={shop.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{shop.name}</p>
                <p className="text-xs text-muted-foreground">{shop.orders} orders</p>
              </div>
              <p className="font-semibold text-primary">Rs. {shop.revenue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="font-semibold text-foreground mb-4">Top Selling Items</h3>
        {topItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No data</p>
        ) : (
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-amber-600/20 text-amber-600' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">Rs. {item.revenue}</p>
                  <p className="text-xs text-primary">+Rs. {Math.round(item.profit)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Spending */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="font-semibold text-foreground mb-4">Top Customers</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search student..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="pl-9 h-10 bg-background border-border"
          />
        </div>
        <div className="space-y-3">
          {topStudents.map((student, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.orders} orders</p>
              </div>
              <p className="font-semibold text-primary">Rs. {student.total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
