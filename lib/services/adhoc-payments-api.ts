/**
 * Ad-hoc Payments API Service
 * Handles all payment request-related API calls
 */

import { api } from '@/lib/api'
import type { PaymentRequest, PendingPayment, StudentPaymentStatus, PaymentSubmission } from '@/lib/types'

// ============ Types ============

export interface CreatePaymentRequestData {
  title: string
  description: string
  amount: number
  targetType: 'all' | 'selected' | 'department' | 'year'
  targetStudents?: string[]
  targetDepartment?: string
  targetYear?: number
  dueDate?: string
  isVisibleOnDashboard?: boolean
}

export interface UpdatePaymentRequestData {
  title?: string
  description?: string
  isVisibleOnDashboard?: boolean
  dueDate?: string | null
}

export interface PaymentRequestsResponse {
  requests: PaymentRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface StudentsResponse {
  students: StudentPaymentStatus[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface PaymentHistoryResponse {
  payments: PaymentSubmission[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface PaymentResult {
  transaction: {
    id: string
    amount: number
    balanceBefore: number
    balanceAfter: number
  }
  newBalance: number
}

// Helper to map API response to type
function mapPaymentRequest(data: Record<string, unknown>): PaymentRequest {
  return {
    id: (data._id as string) || (data.id as string),
    title: data.title as string,
    description: data.description as string,
    amount: data.amount as number,
    targetType: data.targetType as PaymentRequest['targetType'],
    targetDepartment: data.targetDepartment as string | undefined,
    targetYear: data.targetYear as number | undefined,
    dueDate: data.dueDate as string | undefined,
    status: data.status as PaymentRequest['status'],
    isVisibleOnDashboard: data.isVisibleOnDashboard as boolean,
    createdBy: data.createdBy as PaymentRequest['createdBy'],
    totalTargetCount: data.totalTargetCount as number,
    paidCount: data.paidCount as number,
    totalCollected: data.totalCollected as number,
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  }
}

function mapPendingPayment(data: Record<string, unknown>): PendingPayment {
  return {
    id: (data._id as string) || (data.id as string),
    title: data.title as string,
    description: data.description as string,
    amount: data.amount as number,
    dueDate: data.dueDate as string | undefined,
    status: (data.status as PendingPayment['status']) || 'pending',
    requestCreatedAt: data.requestCreatedAt as string,
  }
}

// ==================== SUPERADMIN APIs ====================

/**
 * Create a new payment request
 */
export async function createPaymentRequest(data: CreatePaymentRequestData): Promise<{
  success: boolean
  data?: PaymentRequest
  error?: string
}> {
  const response = await api.post<{ data: Record<string, unknown> }>('/superadmin/payments', data, true)

  if (response.success && response.data) {
    const rawData = response.data.data || response.data
    return { success: true, data: mapPaymentRequest(rawData as Record<string, unknown>) }
  }
  return { success: false, error: response.error?.message || 'Failed to create payment request' }
}

/**
 * Get all payment requests with pagination and filters
 */
export async function getPaymentRequests(params: {
  status?: string
  page?: number
  limit?: number
} = {}): Promise<{
  success: boolean
  data?: PaymentRequestsResponse
  error?: string
}> {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append('status', params.status)
  if (params.page) queryParams.append('page', String(params.page))
  if (params.limit) queryParams.append('limit', String(params.limit))

  const endpoint = `/superadmin/payments${queryParams.toString() ? `?${queryParams}` : ''}`
  const response = await api.get<{
    data: Record<string, unknown>[]
    pagination: PaymentRequestsResponse['pagination']
  }>(endpoint, true)

  if (response.success && response.data) {
    const rawData = response.data.data || response.data
    const requests = Array.isArray(rawData)
      ? rawData.map(mapPaymentRequest)
      : []
    return {
      success: true,
      data: {
        requests,
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 20,
          total: requests.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    }
  }
  return { success: false, error: response.error?.message || 'Failed to fetch payment requests' }
}

/**
 * Get single payment request by ID
 */
export async function getPaymentRequestById(id: string): Promise<{
  success: boolean
  data?: PaymentRequest
  error?: string
}> {
  const response = await api.get<{ data: Record<string, unknown> }>(`/superadmin/payments/${id}`, true)

  if (response.success && response.data) {
    const rawData = response.data.data || response.data
    return { success: true, data: mapPaymentRequest(rawData as Record<string, unknown>) }
  }
  return { success: false, error: response.error?.message || 'Failed to fetch payment request' }
}

/**
 * Update a payment request
 */
export async function updatePaymentRequest(id: string, data: UpdatePaymentRequestData): Promise<{
  success: boolean
  data?: PaymentRequest
  error?: string
}> {
  const response = await api.put<{ data: Record<string, unknown> }>(`/superadmin/payments/${id}`, data, true)

  if (response.success && response.data) {
    const rawData = response.data.data || response.data
    return { success: true, data: mapPaymentRequest(rawData as Record<string, unknown>) }
  }
  return { success: false, error: response.error?.message || 'Failed to update payment request' }
}

/**
 * Close or cancel a payment request
 */
export async function closePaymentRequest(id: string, status: 'closed' | 'cancelled'): Promise<{
  success: boolean
  data?: PaymentRequest
  error?: string
}> {
  const response = await api.post<{ data: Record<string, unknown> }>(`/superadmin/payments/${id}/close`, { status }, true)

  if (response.success && response.data) {
    const rawData = response.data.data || response.data
    return { success: true, data: mapPaymentRequest(rawData as Record<string, unknown>) }
  }
  return { success: false, error: response.error?.message || 'Failed to close payment request' }
}

/**
 * Get students for a payment request with their payment status
 */
export async function getStudentsForPaymentRequest(id: string, params: {
  status?: 'paid' | 'pending' | 'all'
  search?: string
  page?: number
  limit?: number
} = {}): Promise<{
  success: boolean
  data?: StudentsResponse
  error?: string
}> {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append('status', params.status)
  if (params.search) queryParams.append('search', params.search)
  if (params.page) queryParams.append('page', String(params.page))
  if (params.limit) queryParams.append('limit', String(params.limit))

  const endpoint = `/superadmin/payments/${id}/students${queryParams.toString() ? `?${queryParams}` : ''}`
  const response = await api.get<{
    data: StudentPaymentStatus[]
    pagination: StudentsResponse['pagination']
  }>(endpoint, true)

  if (response.success && response.data) {
    return {
      success: true,
      data: {
        students: response.data.data || [],
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    }
  }
  return { success: false, error: response.error?.message || 'Failed to fetch students' }
}

/**
 * Send payment reminders to unpaid students
 */
export async function sendPaymentReminders(id: string): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  const response = await api.post<{ data: { count: number } }>(`/superadmin/payments/${id}/remind`, {}, true)

  if (response.success && response.data) {
    return { success: true, count: response.data.data?.count || 0 }
  }
  return { success: false, error: response.error?.message || 'Failed to send reminders' }
}

// ==================== STUDENT APIs ====================

/**
 * Get pending payments for the logged-in student
 */
export async function getPendingPayments(): Promise<{
  success: boolean
  data?: PendingPayment[]
  error?: string
}> {
  const response = await api.get<{ data: Record<string, unknown>[] }>('/student/payments/pending', true)

  if (response.success && response.data) {
    const rawData = response.data.data || response.data
    const payments = Array.isArray(rawData)
      ? rawData.map(mapPendingPayment)
      : []
    return { success: true, data: payments }
  }
  return { success: false, error: response.error?.message || 'Failed to fetch pending payments' }
}

/**
 * Pay a payment request
 */
export async function payPaymentRequest(id: string): Promise<{
  success: boolean
  data?: PaymentResult
  error?: string
}> {
  const response = await api.post<{ data: PaymentResult }>(`/student/payments/${id}/pay`, {}, true)

  if (response.success && response.data) {
    return { success: true, data: response.data.data || response.data as unknown as PaymentResult }
  }
  return { success: false, error: response.error?.message || 'Payment failed' }
}

/**
 * Get payment history for the logged-in student
 */
export async function getPaymentHistory(params: {
  status?: 'paid' | 'pending' | 'all'
  page?: number
  limit?: number
} = {}): Promise<{
  success: boolean
  data?: PaymentHistoryResponse
  error?: string
}> {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append('status', params.status)
  if (params.page) queryParams.append('page', String(params.page))
  if (params.limit) queryParams.append('limit', String(params.limit))

  const endpoint = `/student/payments/history${queryParams.toString() ? `?${queryParams}` : ''}`
  const response = await api.get<{
    data: PaymentSubmission[]
    pagination: PaymentHistoryResponse['pagination']
  }>(endpoint, true)

  if (response.success && response.data) {
    return {
      success: true,
      data: {
        payments: response.data.data || [],
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    }
  }
  return { success: false, error: response.error?.message || 'Failed to fetch payment history' }
}

// Export as service object for convenience
export const adhocPaymentsApi = {
  // Superadmin
  createPaymentRequest,
  getPaymentRequests,
  getPaymentRequestById,
  updatePaymentRequest,
  closePaymentRequest,
  getStudentsForPaymentRequest,
  sendPaymentReminders,
  // Student
  getPendingPayments,
  payPaymentRequest,
  getPaymentHistory,
}

export default adhocPaymentsApi
