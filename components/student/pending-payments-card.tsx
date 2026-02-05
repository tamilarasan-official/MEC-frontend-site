'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { IndianRupee, Calendar, Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { getPendingPayments, payPaymentRequest } from '@/lib/services/adhoc-payments-api'
import type { PendingPayment } from '@/lib/types'

interface PendingPaymentsCardProps {
  onNavigate?: (tab: string) => void
}

export function PendingPaymentsCard({ onNavigate }: PendingPaymentsCardProps) {
  const { user, refreshUserData } = useApp()
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingPayments()
  }, [])

  const fetchPendingPayments = async () => {
    setLoading(true)
    const result = await getPendingPayments()
    if (result.success && result.data) {
      setPayments(result.data)
    }
    setLoading(false)
  }

  const handlePay = async (payment: PendingPayment) => {
    if (!user || (user.balance || 0) < payment.amount) {
      setError('Insufficient wallet balance')
      setTimeout(() => setError(null), 3000)
      return
    }

    setPayingId(payment.id)
    setError(null)
    setSuccess(null)

    const result = await payPaymentRequest(payment.id)

    if (result.success) {
      setSuccess(`Payment of Rs.${payment.amount} for "${payment.title}" successful!`)
      setPayments(prev => prev.filter(p => p.id !== payment.id))
      // Refresh user data to update wallet balance
      if (refreshUserData) {
        await refreshUserData()
      }
      setTimeout(() => setSuccess(null), 5000)
    } else {
      setError(result.error || 'Payment failed')
      setTimeout(() => setError(null), 5000)
    }

    setPayingId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Don't render if loading or no pending payments
  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Pending Payments
        </h3>
        <div className="rounded-2xl bg-card border border-border p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (payments.length === 0 && !success) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Pending Payments
        </h3>
        {payments.length > 0 && (
          <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full font-medium">
            {payments.length} pending
          </span>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Payment cards */}
      <div className="space-y-3">
        {payments.map(payment => (
          <div
            key={payment.id}
            className="rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-semibold text-foreground truncate">{payment.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {payment.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-foreground">Rs.{payment.amount}</p>
                {payment.dueDate && (
                  <p className="text-xs text-orange-500 mt-1 flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {formatDate(payment.dueDate)}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => handlePay(payment)}
              disabled={payingId === payment.id || (user?.balance || 0) < payment.amount}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {payingId === payment.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4" />
                  Pay Now
                </>
              )}
            </button>

            {(user?.balance || 0) < payment.amount && (
              <p className="text-xs text-destructive mt-2 text-center">
                Insufficient balance. Please add Rs.{payment.amount - (user?.balance || 0)} to your wallet.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
