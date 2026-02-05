'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/lib/context'
import { getTransactions, Transaction } from '@/lib/accountant-api'
import { TrendingUp, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChairmanFinance() {
  const { orders, students } = useApp()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true)
      try {
        const result = await getTransactions({})
        if (result.success && result.data) {
          setTransactions(result.data.transactions)
        } else {
          setError(result.error || 'Failed to load transactions')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0)

  const todayOrders = completedOrders.filter(o => {
    const today = new Date()
    const orderDate = new Date(o.createdAt)
    return orderDate.toDateString() === today.toDateString()
  })
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate weekly revenue data dynamically from completed orders
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const dayOfWeek = today.getDay()

    // Initialize weekly data for the past 7 days
    const weekData: { day: string; revenue: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dayIndex = date.getDay()

      // Filter orders for this specific date
      const dayOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0)

      weekData.push({
        day: days[dayIndex],
        revenue: dayRevenue
      })
    }

    return weekData
  }, [completedOrders])

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1) // Ensure minimum of 1 to avoid division by zero

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Finance Dashboard</h2>
        <p className="text-sm text-muted-foreground">Complete financial overview</p>
      </div>

      {/* Revenue Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-4xl font-bold text-foreground">Rs. {totalRevenue}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-primary">
            <ArrowUpRight className="w-4 h-4" />
            <span>+22% this month</span>
          </div>
          <p className="text-muted-foreground">Today: Rs. {todayRevenue}</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <Wallet className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">Rs. {totalBalance}</p>
          <p className="text-xs text-muted-foreground">Student Wallets</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <PiggyBank className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">Rs. {totalCredits}</p>
          <p className="text-xs text-muted-foreground">Total Deposits</p>
        </div>
      </div>

      {/* Weekly Revenue Chart */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Weekly Revenue</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyData.map((data, index) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/50 transition-all animate-float-up"
                style={{ 
                  height: `${(data.revenue / maxRevenue) * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
              <span className="text-[10px] text-muted-foreground">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Flow */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-4">Cash Flow Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Inflow</p>
                <p className="text-xs text-muted-foreground">Wallet recharges + Revenue</p>
              </div>
            </div>
            <p className="text-lg font-bold text-primary">Rs. {totalCredits + totalRevenue}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Outflow</p>
                <p className="text-xs text-muted-foreground">Order expenses</p>
              </div>
            </div>
            <p className="text-lg font-bold text-destructive">Rs. {totalDebits}</p>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Net Balance</p>
              <p className={cn(
                "text-xl font-bold",
                totalCredits + totalRevenue - totalDebits >= 0 ? "text-primary" : "text-destructive"
              )}>
                Rs. {totalCredits + totalRevenue - totalDebits}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
