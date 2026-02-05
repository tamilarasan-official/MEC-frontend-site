'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Users, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { getAnalyticsData, type AnalyticsData } from '@/lib/services/owner'

export function OwnerAnalytics() {
  const { user } = useApp()

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getAnalyticsData()

      if (response.success && response.data) {
        setAnalytics(response.data)
      } else {
        // Set default empty analytics if no data
        setAnalytics({
          thisMonthRevenue: 0,
          thisMonthProfit: 0,
          thisMonthOrders: 0,
          lastMonthRevenue: 0,
          revenueGrowth: 0,
          uniqueCustomers: 0,
          avgOrderValue: 0,
          totalCompletedOrders: 0,
          profitMargin: 0,
          topItems: []
        })
        if (response.error?.message) {
          console.warn('Analytics data issue:', response.error.message)
        }
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading analytics...</p>
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
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const {
    thisMonthRevenue,
    thisMonthProfit,
    thisMonthOrders,
    revenueGrowth,
    uniqueCustomers,
    avgOrderValue,
    totalCompletedOrders,
    profitMargin,
    topItems
  } = analytics

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            <span className={`flex items-center text-xs ${revenueGrowth >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {revenueGrowth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {thisMonthRevenue}</p>
          <p className="text-xs text-muted-foreground mt-1">This Month Revenue</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">Rs. {thisMonthProfit}</p>
          <p className="text-xs text-muted-foreground mt-1">This Month Profit</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{thisMonthOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">Orders This Month</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{uniqueCustomers}</p>
          <p className="text-xs text-muted-foreground mt-1">Unique Customers</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="font-semibold text-foreground mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Orders (All Time)</span>
            <span className="font-semibold text-foreground">{totalCompletedOrders}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Average Order Value</span>
            <span className="font-semibold text-foreground">Rs. {avgOrderValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Profit Margin</span>
            <span className="font-semibold text-primary">
              {profitMargin}%
            </span>
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <h3 className="font-semibold text-foreground mb-4">Top Selling Items</h3>
        {topItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-3">
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
                <p className="font-semibold text-foreground">Rs. {item.revenue}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Analytics
        </button>
      </div>
    </div>
  )
}
