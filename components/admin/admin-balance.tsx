'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { Search, Wallet, Plus, Minus, User, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AdminBalance() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const { students, updateStudentBalance } = useApp()

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0)

  const handleAddBalance = () => {
    if (selectedStudent && amount) {
      updateStudentBalance(selectedStudent, parseInt(amount))
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedStudent(null)
        setAmount('')
      }, 1500)
    }
  }

  const handleDeductBalance = () => {
    if (selectedStudent && amount) {
      updateStudentBalance(selectedStudent, -parseInt(amount))
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedStudent(null)
        setAmount('')
      }, 1500)
    }
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-success-check">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <p className="text-xl font-bold text-foreground">Balance Updated!</p>
        <p className="text-sm text-muted-foreground">Transaction completed successfully</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Manage Balances</h2>
        <p className="text-sm text-muted-foreground">Add or deduct student wallet balance</p>
      </div>

      {/* Total Balance Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Student Balance</p>
            <p className="text-3xl font-bold text-foreground">Rs. {totalBalance}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search student..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.map((student, index) => (
          <button
            key={student.id}
            onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
            className={cn(
              "w-full p-4 rounded-2xl bg-card border transition-all animate-float-up text-left",
              selectedStudent === student.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">Rs. {student.balance}</p>
                <p className="text-xs text-muted-foreground">Balance</p>
              </div>
            </div>

            {/* Amount Input - Show when selected */}
            {selectedStudent === student.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-12 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-3 mt-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddBalance()
                    }}
                    disabled={!amount}
                    className="flex-[2] h-14 text-base font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Balance
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeductBalance()
                    }}
                    disabled={!amount}
                    variant="outline"
                    className="flex-1 h-14 text-base font-semibold border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-all"
                  >
                    <Minus className="w-5 h-5 mr-2" />
                    Deduct
                  </Button>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
