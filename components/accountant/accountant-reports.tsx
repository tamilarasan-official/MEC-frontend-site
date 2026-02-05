'use client'

import { useMemo } from 'react'
import { useAccountant } from '@/lib/accountant-context'
import { TrendingUp, TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AccountantReports() {
  const {
    students,
    transactions,
    stats,
    isLoadingTransactions,
    refreshTransactions
  } = useAccountant()

  // Calculate stats
  const reportStats = useMemo(() => {
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Ensure transactions is an array
    const txList = transactions || []

    // This month recharges
    const monthCredits = txList
      .filter(t => new Date(t.createdAt) >= thisMonth && t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    // This month debits
    const monthDebits = txList
      .filter(t => new Date(t.createdAt) >= thisMonth && t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    // Net flow
    const netFlow = monthCredits - monthDebits

    // Recent transactions
    const recentTransactions = [...txList]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return {
      monthCredits,
      monthDebits,
      netFlow,
      recentTransactions
    }
  }, [transactions])

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Financial Overview</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refreshTransactions()}
          disabled={isLoadingTransactions}
        >
          {isLoadingTransactions ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Month Recharges</span>
          </div>
          <p className="text-xl font-bold text-foreground">Rs. {reportStats.monthCredits.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Month Deductions</span>
          </div>
          <p className="text-xl font-bold text-foreground">Rs. {reportStats.monthDebits.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Outstanding Balance</span>
          </div>
          <p className="text-xl font-bold text-foreground">Rs. {stats.totalBalance.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className={`w-4 h-4 ${reportStats.netFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-xs text-muted-foreground">Net Flow</span>
          </div>
          <p className={`text-xl font-bold ${reportStats.netFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {reportStats.netFlow >= 0 ? '+' : ''}Rs. {reportStats.netFlow.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>

        {isLoadingTransactions && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-muted-foreground text-sm">Loading transactions...</p>
          </div>
        ) : reportStats.recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reportStats.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:border-primary/20"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-primary/10' : 'bg-orange-500/10'
                }`}>
                  {tx.type === 'credit' ? (
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{tx.userName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'credit' ? 'text-primary' : 'text-orange-500'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
