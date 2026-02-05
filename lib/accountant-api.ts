/**
 * Accountant API Service
 * Handles all API calls for accountant dashboard functionality
 */

import { api } from './api'

// Types for API responses
export interface PendingUser {
  id: string
  name: string
  email: string
  phone?: string
  rollNumber?: string
  department?: string
  year?: number | string
  createdAt: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone?: string
  rollNumber?: string
  department?: string
  year?: number | string
  balance: number
  isApproved: boolean
  createdAt: string
}

export interface StudentWithWallet extends Student {
  walletSummary: {
    totalCredits: number
    totalDebits: number
    transactionCount: number
    lastTransaction?: {
      type: string
      amount: number
      createdAt: string
    }
  }
}

export interface Transaction {
  id: string
  userId: string
  userName?: string
  type: 'credit' | 'debit'
  amount: number
  source?: string
  description: string
  createdAt: string
  balanceAfter?: number
}

export interface TransactionFilters {
  userId?: string
  type?: 'credit' | 'debit'
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DashboardStats {
  totalStudents: number
  pendingApprovals: number
  totalBalance: number
  monthRecharges: number
  todayCredits: number
  todayTransactions: number
}

// API Service functions

/**
 * Get all pending user approvals
 */
export async function getPendingApprovals(): Promise<{ success: boolean; data?: PendingUser[]; error?: string }> {
  const response = await api.get<PendingUser[]>('/accountant/pending-approvals', true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to fetch pending approvals'
  }
}

/**
 * Approve a user with initial balance
 */
export async function approveUser(
  id: string,
  initialBalance: number = 0
): Promise<{ success: boolean; data?: Student; error?: string }> {
  const response = await api.put<Student>(
    `/accountant/approve/${id}`,
    { initialBalance },
    true
  )

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to approve user'
  }
}

/**
 * Reject a user registration
 */
export async function rejectUser(id: string): Promise<{ success: boolean; error?: string }> {
  const response = await api.put<void>(`/accountant/reject/${id}`, {}, true)

  if (response.success) {
    return { success: true }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to reject user'
  }
}

/**
 * Get all approved students
 */
export async function getStudents(): Promise<{ success: boolean; data?: Student[]; error?: string }> {
  const response = await api.get<Student[]>('/accountant/students', true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to fetch students'
  }
}

/**
 * Get a specific student with wallet summary
 */
export async function getStudentWithWallet(
  id: string
): Promise<{ success: boolean; data?: StudentWithWallet; error?: string }> {
  const response = await api.get<StudentWithWallet>(`/accountant/students/${id}`, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to fetch student details'
  }
}

/**
 * Credit a student's wallet
 */
export async function creditWallet(
  studentId: string,
  amount: number,
  source: string,
  description: string
): Promise<{ success: boolean; data?: { balance: number; transaction: Transaction }; error?: string }> {
  // Map frontend source values to backend expected values
  const sourceMap: Record<string, string> = {
    'cash': 'cash_deposit',
    'upi': 'online_payment',
    'online': 'online_payment',
    'card': 'online_payment',
    'cash_deposit': 'cash_deposit',
    'online_payment': 'online_payment'
  }
  const mappedSource = sourceMap[source] || 'cash_deposit'

  const response = await api.post<{ balance: number; transaction: Transaction }>(
    `/accountant/students/${studentId}/credit`,
    { amount, source: mappedSource, description },
    true
  )

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to credit wallet'
  }
}

/**
 * Debit a student's wallet
 */
export async function debitWallet(
  studentId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; data?: { balance: number; transaction: Transaction }; error?: string }> {
  const response = await api.post<{ balance: number; transaction: Transaction }>(
    `/accountant/students/${studentId}/debit`,
    { amount, description },
    true
  )

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to debit wallet'
  }
}

/**
 * Get transactions with optional filters
 */
export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<{ success: boolean; data?: TransactionsResponse; error?: string }> {
  // Build query string from filters
  const params = new URLSearchParams()

  if (filters.userId) params.append('userId', filters.userId)
  if (filters.type) params.append('type', filters.type)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const queryString = params.toString()
  const endpoint = `/accountant/transactions${queryString ? `?${queryString}` : ''}`

  const response = await api.get<TransactionsResponse>(endpoint, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return {
    success: false,
    error: response.error?.message || 'Failed to fetch transactions'
  }
}

/**
 * Get dashboard statistics
 * This combines multiple API calls to get a full dashboard overview
 */
export async function getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    // Fetch students and pending approvals in parallel
    const [studentsRes, pendingRes] = await Promise.all([
      getStudents(),
      getPendingApprovals()
    ])

    if (!studentsRes.success || !pendingRes.success) {
      return {
        success: false,
        error: studentsRes.error || pendingRes.error || 'Failed to fetch dashboard data'
      }
    }

    const students = studentsRes.data || []
    const pendingApprovals = pendingRes.data || []

    // Calculate totals from students
    const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0)

    // Get this month's date range for transactions
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    // Fetch transactions for statistics
    const [monthTxRes, todayTxRes] = await Promise.all([
      getTransactions({ startDate: startOfMonth, type: 'credit', limit: 1000 }),
      getTransactions({ startDate: startOfToday, limit: 1000 })
    ])

    const monthTransactions = monthTxRes.success ? monthTxRes.data?.transactions || [] : []
    const todayTransactions = todayTxRes.success ? todayTxRes.data?.transactions || [] : []

    const monthRecharges = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const todayCredits = todayTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      success: true,
      data: {
        totalStudents: students.length,
        pendingApprovals: pendingApprovals.length,
        totalBalance,
        monthRecharges,
        todayCredits,
        todayTransactions: todayTransactions.length
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats'
    }
  }
}

// Export all functions as a service object for convenience
export const accountantApi = {
  getPendingApprovals,
  approveUser,
  rejectUser,
  getStudents,
  getStudentWithWallet,
  creditWallet,
  debitWallet,
  getTransactions,
  getDashboardStats
}

export default accountantApi
