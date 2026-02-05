'use client'

import { useState, useMemo } from 'react'
import { Search, User, Plus, Minus, Wallet, Check, Loader2, AlertCircle, RefreshCw, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAccountant } from '@/lib/accountant-context'

export function AccountantPayments() {
  const {
    students,
    isLoadingStudents,
    studentsError,
    refreshStudents,
    creditStudentWallet,
    debitStudentWallet
  } = useAccountant()

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('cash')
  const [operation, setOperation] = useState<'add' | 'deduct'>('add')

  // Ensure students is an array
  const studentList = students || []

  const filteredStudents = useMemo(() => {
    if (!search) return studentList
    return studentList.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
    )
  }, [studentList, search])

  const selectedStudentData = useMemo(() => {
    return studentList.find(s => s.id === selectedStudent)
  }, [studentList, selectedStudent])

  const handleSubmit = async () => {
    if (!selectedStudent || !amount) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccessMessage(null)

    const desc = description || (operation === 'add' ? 'Cash recharge by accountant' : 'Balance deduction by accountant')
    const studentName = selectedStudentData?.name

    let result
    if (operation === 'add') {
      result = await creditStudentWallet(selectedStudent, amountNum, source, desc)
    } else {
      result = await debitStudentWallet(selectedStudent, amountNum, desc)
    }

    if (result.success) {
      setSuccessMessage(
        `Successfully ${operation === 'add' ? 'added' : 'deducted'} Rs. ${amountNum} ${operation === 'add' ? 'to' : 'from'} ${studentName}'s account. New balance: Rs. ${result.newBalance}`
      )

      // Reset form
      setAmount('')
      setDescription('')
      setSelectedStudent(null)

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } else {
      setError(result.error || `Failed to ${operation === 'add' ? 'credit' : 'debit'} wallet`)
    }

    setIsProcessing(false)
  }

  // Loading state
  if (isLoadingStudents && studentList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    )
  }

  // Error state (when no students loaded)
  if (studentsError && studentList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load</h3>
        <p className="text-muted-foreground mb-4">{studentsError}</p>
        <Button onClick={refreshStudents} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-primary/70 hover:text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
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

      {/* Operation Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setOperation('add')}
          disabled={isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 ${
            operation === 'add'
              ? 'bg-primary text-primary-foreground border-primary scale-[1.02]'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Plus className="w-5 h-5" />
          Add Balance
        </button>
        <button
          onClick={() => setOperation('deduct')}
          disabled={isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 ${
            operation === 'deduct'
              ? 'bg-destructive text-destructive-foreground border-destructive scale-[1.02]'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Minus className="w-5 h-5" />
          Deduct Balance
        </button>
      </div>

      {/* Student Selection */}
      {selectedStudent ? (
        <div className="rounded-2xl bg-card border border-border p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{selectedStudentData?.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedStudentData?.rollNumber || 'No roll number'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="font-bold text-primary text-lg">Rs. {(selectedStudentData?.balance || 0).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStudent(null)}
            disabled={isProcessing}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Change student
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search student by name or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={refreshStudents}
              disabled={isLoadingStudents}
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingStudents ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {search ? 'No students match your search' : 'No students found'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-200 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.rollNumber || 'No roll number'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary font-semibold">
                    <Wallet className="w-4 h-4" />
                    Rs. {(student.balance || 0).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Amount and Details Input */}
      {selectedStudent && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amount (Rs.)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
              className="h-14 text-xl font-bold text-center bg-card border-border"
            />
          </div>

          {operation === 'add' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Payment Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={isProcessing}
                className="w-full h-10 px-3 rounded-lg bg-card border border-border text-foreground"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description (Optional)</label>
            <Input
              placeholder={operation === 'add' ? 'e.g., Monthly recharge' : 'e.g., Refund adjustment'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isProcessing}
              className="h-10 bg-card border-border"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
            className={`w-full h-14 text-lg font-semibold transition-all duration-200 ${
              operation === 'add'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : operation === 'add' ? (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Rs. {amount || '0'} to Balance
              </>
            ) : (
              <>
                <Minus className="w-5 h-5 mr-2" />
                Deduct Rs. {amount || '0'} from Balance
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
