/**
 * Owner API Service
 * Handles owner-related API calls (captain management)
 */

import { api } from '@/lib/api'

// ============ Types ============

export interface Captain {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export interface CreateCaptainData {
  name: string
  email: string
  password: string
  phone?: string
}

export interface ShopDetails {
  id: string
  name: string
  description: string
  category: string
  isActive: boolean
  captainCount: number
}

// ============ API Functions ============

export async function createCaptain(
  data: CreateCaptainData
): Promise<{ success: boolean; data?: Captain; error?: string }> {
  const response = await api.post<Captain>('/owner/captains', data, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to create captain' }
}

export async function getCaptains(): Promise<{
  success: boolean
  data?: Captain[]
  error?: string
}> {
  const response = await api.get<{ captains: Captain[] }>('/owner/captains', true)

  if (response.success && response.data) {
    return { success: true, data: response.data.captains }
  }

  return { success: false, error: response.error?.message || 'Failed to fetch captains' }
}

export async function removeCaptain(
  captainId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await api.delete(`/owner/captains/${captainId}`, true)

  if (response.success) {
    return { success: true }
  }

  return { success: false, error: response.error?.message || 'Failed to remove captain' }
}

export async function getShopDetails(): Promise<{
  success: boolean
  data?: ShopDetails
  error?: string
}> {
  const response = await api.get<ShopDetails>('/owner/shop', true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to fetch shop details' }
}

// Export all functions as a service object
export const ownerApi = {
  createCaptain,
  getCaptains,
  removeCaptain,
  getShopDetails,
}

export default ownerApi
