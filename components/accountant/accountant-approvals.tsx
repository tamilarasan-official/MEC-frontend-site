'use client'

import { useState } from 'react'
import { Check, X, User, Mail, Phone, GraduationCap, Calendar, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAccountant } from '@/lib/accountant-context'

export function AccountantApprovals() {
  const {
    pendingApprovals,
    isLoadingApprovals,
    approvalsError,
    refreshApprovals,
    approveStudent,
    rejectStudent
  } = useAccountant()

  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initialBalances, setInitialBalances] = useState<Record<string, string>>({})

  // Ensure pendingApprovals is an array
  const approvalsList = pendingApprovals || []

  const handleApprove = async (studentId: string) => {
    setProcessingId(studentId)
    setError(null)

    const initialBalance = parseFloat(initialBalances[studentId] || '0') || 0

    const result = await approveStudent(studentId, initialBalance)

    if (result.success) {
      setInitialBalances(prev => {
        const updated = { ...prev }
        delete updated[studentId]
        return updated
      })
    } else {
      setError(result.error || 'Failed to approve student')
    }

    setProcessingId(null)
  }

  const handleReject = async (studentId: string) => {
    setProcessingId(studentId)
    setError(null)

    const result = await rejectStudent(studentId)

    if (!result.success) {
      setError(result.error || 'Failed to reject student')
    }

    setProcessingId(null)
  }

  const handleInitialBalanceChange = (studentId: string, value: string) => {
    setInitialBalances(prev => ({
      ...prev,
      [studentId]: value
    }))
  }

  // Loading state
  if (isLoadingApprovals && approvalsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading pending approvals...</p>
      </div>
    )
  }

  // Error state
  if (approvalsError && approvalsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load</h3>
        <p className="text-muted-foreground mb-4">{approvalsError}</p>
        <Button onClick={refreshApprovals} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state
  if (approvalsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
        <p className="text-muted-foreground">No pending student approvals</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive/70 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {approvalsList.length} student{approvalsList.length !== 1 ? 's' : ''} waiting for approval
        </p>
        <Button variant="ghost" size="sm" onClick={refreshApprovals} disabled={isLoadingApprovals}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingApprovals ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {approvalsList.map((student) => (
        <div
          key={student.id}
          className="rounded-2xl bg-card border border-border p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {/* Student Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{student.name}</h3>
              <p className="text-sm text-muted-foreground">{student.rollNumber || 'No roll number'}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{student.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span>{student.department || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Batch {student.year || 'N/A'}</span>
            </div>
          </div>

          {/* Initial Balance Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Initial Balance (Rs.)</label>
            <Input
              type="number"
              placeholder="0"
              value={initialBalances[student.id] || ''}
              onChange={(e) => handleInitialBalanceChange(student.id, e.target.value)}
              className="h-10 bg-background border-border"
              disabled={processingId === student.id}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Set an initial wallet balance for this student
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReject(student.id)}
              disabled={processingId === student.id}
              className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {processingId === student.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => handleApprove(student.id)}
              disabled={processingId === student.id}
              className="flex-1 bg-primary text-primary-foreground"
            >
              {processingId === student.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
