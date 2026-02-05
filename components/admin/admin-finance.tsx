'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { getTransactions, Transaction } from '@/lib/accountant-api'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BookOpen, Calendar, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminFinance() {
  const { orders } = useApp()
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Finance Book</h2>
        <p className="text-sm text-muted-foreground">Track all financial transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">Rs. {totalRevenue}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <Calendar className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">Rs. {todayRevenue}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
      </div>

      {/* Balance Flow */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-4">Balance Flow</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-lg font-bold text-primary">Rs. {totalCredits}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Debits</p>
              <p className="text-lg font-bold text-destructive">Rs. {totalDebits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading transactions...</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <div className="p-4 rounded-2xl bg-card border border-border text-center text-muted-foreground">
            No transactions found
          </div>
        )}

        <div className="space-y-3">
          {!isLoading && !error && transactions.map((transaction, index) => {
            const isCredit = transaction.type === 'credit'

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border animate-float-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isCredit ? "bg-primary/10" : "bg-destructive/10"
                  )}>
                    {isCredit ? (
                      <TrendingUp className="w-5 h-5 text-primary" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.userName}</p>
                    <p className="text-xs text-muted-foreground">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    isCredit ? "text-primary" : "text-destructive"
                  )}>
                    {isCredit ? '+' : '-'}Rs. {transaction.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
