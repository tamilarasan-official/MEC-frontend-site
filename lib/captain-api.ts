/**
 * Captain API Service
 * Handles all API calls for captain dashboard functionality
 */

import { api } from './api'
import type { Order } from './types'

// Types for API responses
export interface OrderStats {
  totalOrders: number
  todayOrders: number
  completedToday: number
  inProgress: number
  pendingCount: number
  preparingCount: number
  readyCount: number
  totalRevenue: number
  todayRevenue: number
}

// API response type (matches backend)
interface ShopOrderApiResponse {
  id: string
  userId: string
  userName: string
  userEmail?: string
  userPhone?: string
  items: Array<{
    id: string
    name: string
    price: number
    offerPrice?: number
    quantity: number
    imageUrl?: string
    category?: string
  }>
  total: number
  shopId: string
  shopName?: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  pickupToken: string
  createdAt: string
  completedAt?: string
  handledBy?: string
  qrCode?: string
}

export interface ShopOrder {
  id: string
  userId: string
  userName: string
  userEmail?: string
  userPhone?: string
  items: Array<{
    id: string
    name: string
    price: number
    offerPrice?: number
    quantity: number
    image?: string
    category?: string
  }>
  total: number
  shopId: string
  shopName?: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  pickupToken: string
  createdAt: string
  completedAt?: string
  handledBy?: string
  qrCode?: string
}

// Map API response to frontend ShopOrder type
function mapApiResponseToShopOrder(order: ShopOrderApiResponse): ShopOrder {
  return {
    ...order,
    items: order.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      offerPrice: item.offerPrice,
      quantity: item.quantity,
      image: item.imageUrl || '/placeholder.svg',
      category: item.category,
    })),
  }
}

export interface QRVerificationResult {
  valid: boolean
  order?: ShopOrder
  message?: string
}

/**
 * Get all orders for the captain's shop
 */
export async function getShopOrders(): Promise<{ success: boolean; data?: ShopOrder[]; error?: string }> {
  try {
    const response = await api.get<ShopOrderApiResponse[]>('/orders/shop', true)
    if (response.success && response.data) {
      return { success: true, data: response.data.map(mapApiResponseToShopOrder) }
    }
    return { success: false, error: response.error?.message || 'Failed to fetch orders' }
  } catch (error) {
    console.error('Error fetching shop orders:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Get active orders for the captain's shop (pending, preparing, ready)
 */
export async function getActiveOrders(): Promise<{ success: boolean; data?: ShopOrder[]; error?: string }> {
  try {
    const response = await api.get<ShopOrderApiResponse[]>('/orders/shop/active', true)
    if (response.success && response.data) {
      return { success: true, data: response.data.map(mapApiResponseToShopOrder) }
    }
    return { success: false, error: response.error?.message || 'Failed to fetch active orders' }
  } catch (error) {
    console.error('Error fetching active orders:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Get order statistics for the captain's shop
 */
export async function getOrderStats(): Promise<{ success: boolean; data?: OrderStats; error?: string }> {
  try {
    const response = await api.get<OrderStats>('/orders/shop/stats', true)
    if (response.success && response.data) {
      return { success: true, data: response.data }
    }
    return { success: false, error: response.error?.message || 'Failed to fetch statistics' }
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Get a specific order by ID
 */
export async function getOrderById(orderId: string): Promise<{ success: boolean; data?: ShopOrder; error?: string }> {
  try {
    const response = await api.get<ShopOrderApiResponse>(`/orders/${orderId}`, true)
    if (response.success && response.data) {
      return { success: true, data: mapApiResponseToShopOrder(response.data) }
    }
    return { success: false, error: response.error?.message || 'Order not found' }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'preparing' | 'ready' | 'completed' | 'cancelled'
): Promise<{ success: boolean; data?: ShopOrder; error?: string }> {
  try {
    const response = await api.put<ShopOrderApiResponse>(`/orders/${orderId}/status`, { status }, true)
    if (response.success && response.data) {
      return { success: true, data: mapApiResponseToShopOrder(response.data) }
    }
    return { success: false, error: response.error?.message || 'Failed to update order status' }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Verify QR code
 */
export async function verifyQRCode(qrData: string): Promise<{ success: boolean; data?: QRVerificationResult; error?: string }> {
  try {
    const response = await api.post<QRVerificationResult>('/orders/verify-qr', { qrData }, true)
    if (response.success && response.data) {
      return { success: true, data: response.data }
    }
    return { success: false, error: response.error?.message || 'Invalid QR code' }
  } catch (error) {
    console.error('Error verifying QR code:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Complete order after QR verification
 */
export async function completeOrder(orderId: string): Promise<{ success: boolean; data?: ShopOrder; error?: string }> {
  try {
    const response = await api.post<ShopOrder>(`/orders/${orderId}/complete`, {}, true)
    if (response.success && response.data) {
      return { success: true, data: response.data }
    }
    return { success: false, error: response.error?.message || 'Failed to complete order' }
  } catch (error) {
    console.error('Error completing order:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Get completed/cancelled orders (history)
 * Makes separate API calls for completed and cancelled orders then combines them
 */
export async function getOrderHistory(): Promise<{ success: boolean; data?: ShopOrder[]; error?: string }> {
  try {
    // Make parallel requests for completed and cancelled orders
    const [completedResponse, cancelledResponse] = await Promise.all([
      api.get<ShopOrder[] | { data: ShopOrder[] }>('/orders/shop?status=completed', true),
      api.get<ShopOrder[] | { data: ShopOrder[] }>('/orders/shop?status=cancelled', true)
    ])

    // Extract data from responses (handle both array and object formats)
    const completedOrders = completedResponse.success
      ? (Array.isArray(completedResponse.data) ? completedResponse.data : completedResponse.data?.data || [])
      : []
    const cancelledOrders = cancelledResponse.success
      ? (Array.isArray(cancelledResponse.data) ? cancelledResponse.data : cancelledResponse.data?.data || [])
      : []

    // Combine and sort by date (newest first)
    const allOrders = [...completedOrders, ...cancelledOrders].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt).getTime()
      const dateB = new Date(b.completedAt || b.createdAt).getTime()
      return dateB - dateA
    })

    return { success: true, data: allOrders }
  } catch (error) {
    console.error('Error fetching order history:', error)
    return { success: false, error: 'Network error occurred' }
  }
}
