'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { useApp } from './context'
import {
  getStudents,
  getPendingApprovals,
  getTransactions,
  approveUser,
  rejectUser,
  creditWallet,
  debitWallet,
  type Student,
  type PendingUser,
  type Transaction,
  type TransactionFilters
} from './accountant-api'

interface AccountantContextType {
  // Data
  students: Student[]
  pendingApprovals: PendingUser[]
  transactions: Transaction[]

  // Loading states
  isLoadingStudents: boolean
  isLoadingApprovals: boolean
  isLoadingTransactions: boolean

  // Error states
  studentsError: string | null
  approvalsError: string | null
  transactionsError: string | null

  // Actions with optimistic updates
  refreshStudents: () => Promise<void>
  refreshApprovals: () => Promise<void>
  refreshTransactions: (filters?: TransactionFilters) => Promise<void>
  refreshAll: () => Promise<void>

  // Student operations
  approveStudent: (id: string, initialBalance?: number) => Promise<{ success: boolean; error?: string }>
  rejectStudent: (id: string) => Promise<{ success: boolean; error?: string }>

  // Wallet operations
  creditStudentWallet: (studentId: string, amount: number, source: string, description: string) => Promise<{ success: boolean; newBalance?: number; error?: string }>
  debitStudentWallet: (studentId: string, amount: number, description: string) => Promise<{ success: boolean; newBalance?: number; error?: string }>

  // Stats
  stats: {
    totalStudents: number
    totalBalance: number
    pendingCount: number
  }
}

const AccountantContext = createContext<AccountantContextType | undefined>(undefined)

export function AccountantProvider({ children }: { children: ReactNode }) {
  // Get auth state from AppContext - parent component already verified auth
  const { user, isHydrated } = useApp()

  // Data states
  const [students, setStudents] = useState<Student[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingUser[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Loading states
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  // Error states
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [approvalsError, setApprovalsError] = useState<string | null>(null)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  // Refs for accessing current state in callbacks (avoids stale closures)
  const studentsRef = useRef<Student[]>([])
  const pendingApprovalsRef = useRef<PendingUser[]>([])

  // Keep refs in sync with state
  useEffect(() => {
    studentsRef.current = students
  }, [students])

  useEffect(() => {
    pendingApprovalsRef.current = pendingApprovals
  }, [pendingApprovals])

  // Fetch students
  const refreshStudents = useCallback(async () => {
    setIsLoadingStudents(true)
    setStudentsError(null)

    const result = await getStudents()

    if (result.success && result.data) {
      setStudents(result.data)
    } else {
      setStudentsError(result.error || 'Failed to load students')
    }

    setIsLoadingStudents(false)
  }, [])

  // Fetch pending approvals
  const refreshApprovals = useCallback(async () => {
    setIsLoadingApprovals(true)
    setApprovalsError(null)

    const result = await getPendingApprovals()

    if (result.success && result.data) {
      setPendingApprovals(result.data)
    } else {
      setApprovalsError(result.error || 'Failed to load pending approvals')
    }

    setIsLoadingApprovals(false)
  }, [])

  // Fetch transactions
  const refreshTransactions = useCallback(async (filters?: TransactionFilters) => {
    setIsLoadingTransactions(true)
    setTransactionsError(null)

    const result = await getTransactions(filters)

    if (result.success && result.data) {
      setTransactions(result.data.transactions || [])
    } else {
      setTransactionsError(result.error || 'Failed to load transactions')
    }

    setIsLoadingTransactions(false)
  }, [])

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshStudents(),
      refreshApprovals(),
      refreshTransactions()
    ])
  }, [refreshStudents, refreshApprovals, refreshTransactions])

  // Approve student with optimistic update (using ref to avoid stale closure)
  const approveStudent = useCallback(async (id: string, initialBalance: number = 0): Promise<{ success: boolean; error?: string }> => {
    // Use ref to get current pending approvals (avoids stale closure)
    const currentPending = pendingApprovalsRef.current || []
    const pendingStudent = currentPending.find(s => s.id === id)

    // Optimistic update - remove from pending immediately
    setPendingApprovals(prev => (prev || []).filter(s => s.id !== id))

    const result = await approveUser(id, initialBalance)

    if (result.success && result.data) {
      // Add to students list with the approved student data
      setStudents(prev => [...(prev || []), result.data!])
      return { success: true }
    } else {
      // Rollback - add back to pending
      if (pendingStudent) {
        setPendingApprovals(prev => [...(prev || []), pendingStudent])
      }
      return { success: false, error: result.error }
    }
  }, []) // No dependencies - uses ref instead

  // Reject student with optimistic update (using ref to avoid stale closure)
  const rejectStudent = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    // Use ref to get current pending approvals (avoids stale closure)
    const currentPending = pendingApprovalsRef.current || []
    const pendingStudent = currentPending.find(s => s.id === id)

    // Optimistic update - remove from pending immediately
    setPendingApprovals(prev => (prev || []).filter(s => s.id !== id))

    const result = await rejectUser(id)

    if (result.success) {
      return { success: true }
    } else {
      // Rollback - add back to pending
      if (pendingStudent) {
        setPendingApprovals(prev => [...(prev || []), pendingStudent])
      }
      return { success: false, error: result.error }
    }
  }, []) // No dependencies - uses ref instead

  // Credit wallet with optimistic update (using ref to avoid stale closure)
  const creditStudentWallet = useCallback(async (
    studentId: string,
    amount: number,
    source: string,
    description: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
    // Use ref to get current students (avoids stale closure)
    const currentStudents = studentsRef.current || []
    const student = currentStudents.find(s => s.id === studentId)
    const previousBalance = student?.balance || 0
    const optimisticBalance = previousBalance + amount

    // Optimistic update - update balance immediately
    setStudents(prev => (prev || []).map(s =>
      s.id === studentId ? { ...s, balance: optimisticBalance } : s
    ))

    const result = await creditWallet(studentId, amount, source, description)

    if (result.success && result.data) {
      // Update with actual balance from server
      setStudents(prev => (prev || []).map(s =>
        s.id === studentId ? { ...s, balance: result.data!.balance } : s
      ))

      // Add transaction to list
      if (result.data.transaction) {
        setTransactions(prev => [result.data!.transaction, ...(prev || [])])
      }

      return { success: true, newBalance: result.data.balance }
    } else {
      // Rollback - restore previous balance
      setStudents(prev => (prev || []).map(s =>
        s.id === studentId ? { ...s, balance: previousBalance } : s
      ))
      return { success: false, error: result.error }
    }
  }, []) // No dependencies - uses ref instead

  // Debit wallet with optimistic update (using ref to avoid stale closure)
  const debitStudentWallet = useCallback(async (
    studentId: string,
    amount: number,
    description: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
    // Use ref to get current students (avoids stale closure)
    const currentStudents = studentsRef.current || []
    const student = currentStudents.find(s => s.id === studentId)
    const previousBalance = student?.balance || 0
    const optimisticBalance = Math.max(0, previousBalance - amount)

    // Optimistic update - update balance immediately
    setStudents(prev => (prev || []).map(s =>
      s.id === studentId ? { ...s, balance: optimisticBalance } : s
    ))

    const result = await debitWallet(studentId, amount, description)

    if (result.success && result.data) {
      // Update with actual balance from server
      setStudents(prev => (prev || []).map(s =>
        s.id === studentId ? { ...s, balance: result.data!.balance } : s
      ))

      // Add transaction to list
      if (result.data.transaction) {
        setTransactions(prev => [result.data!.transaction, ...(prev || [])])
      }

      return { success: true, newBalance: result.data.balance }
    } else {
      // Rollback - restore previous balance
      setStudents(prev => (prev || []).map(s =>
        s.id === studentId ? { ...s, balance: previousBalance } : s
      ))
      return { success: false, error: result.error }
    }
  }, []) // No dependencies - uses ref instead

  // Memoized stats calculation
  const stats = useMemo(() => {
    const studentList = students || []
    const approvalList = pendingApprovals || []
    return {
      totalStudents: studentList.length,
      totalBalance: studentList.reduce((sum, s) => sum + (s.balance || 0), 0),
      pendingCount: approvalList.length
    }
  }, [students, pendingApprovals])

  // Track if initial load has happened
  const hasLoadedRef = useRef(false)

  // Initial data load - wait for AppContext to be fully ready
  useEffect(() => {
    // Only load once when user is authenticated and hydrated
    if (!hasLoadedRef.current && isHydrated && user && user.role === 'accountant') {
      hasLoadedRef.current = true
      // Fetch data immediately - parent already verified auth
      refreshAll()
    }
  }, [refreshAll, isHydrated, user])

  return (
    <AccountantContext.Provider value={{
      students,
      pendingApprovals,
      transactions,
      isLoadingStudents,
      isLoadingApprovals,
      isLoadingTransactions,
      studentsError,
      approvalsError,
      transactionsError,
      refreshStudents,
      refreshApprovals,
      refreshTransactions,
      refreshAll,
      approveStudent,
      rejectStudent,
      creditStudentWallet,
      debitStudentWallet,
      stats
    }}>
      {children}
    </AccountantContext.Provider>
  )
}

export function useAccountant() {
  const context = useContext(AccountantContext)
  if (!context) {
    throw new Error('useAccountant must be used within AccountantProvider')
  }
  return context
}
