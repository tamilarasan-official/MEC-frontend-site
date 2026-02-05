/**
 * Owner API Service Functions
 * Handles all API calls for shop owner dashboard
 */

import { api } from '@/lib/api'
import type { FoodItem, Order } from '@/lib/types'

// Types for API responses
export interface ShopStats {
  todayOrders: number
  todayRevenue: number
  monthOrders: number
  monthRevenue: number
  monthProfit: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  totalMenuItems: number
}

export interface Category {
  id: string
  name: string
  shopId: string
  displayOrder?: number
  createdAt?: string
}

export interface TopSellingItem {
  id: string
  name: string
  quantity: number
  revenue: number
}

export interface AnalyticsData {
  thisMonthRevenue: number
  thisMonthProfit: number
  thisMonthOrders: number
  lastMonthRevenue: number
  revenueGrowth: number
  uniqueCustomers: number
  avgOrderValue: number
  totalCompletedOrders: number
  profitMargin: number
  topItems: TopSellingItem[]
}

// ============ Orders API ============

// API response type for orders (matches backend)
interface OrderApiResponse {
  id: string
  userId: string
  userName?: string
  shopId: string
  shopName?: string
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
  status: Order['status']
  pickupToken: string
  createdAt: string
  completedAt?: string
}

// Map API response to frontend Order type
function mapOrderResponse(order: OrderApiResponse): Order {
  return {
    id: order.id,
    userId: order.userId,
    userName: order.userName || '',
    shopId: order.shopId,
    shopName: order.shopName,
    items: order.items.map(item => ({
      id: item.id,
      name: item.name,
      description: '',
      price: item.price,
      image: item.imageUrl || '/placeholder.svg',
      category: item.category || '',
      shopId: order.shopId,
      isAvailable: true,
      rating: 4.0,
      preparationTime: '15 min',
      quantity: item.quantity,
      offerPrice: item.offerPrice,
    })),
    total: order.total,
    status: order.status,
    pickupToken: order.pickupToken,
    createdAt: new Date(order.createdAt),
    completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
  }
}

/**
 * Get all orders for the shop
 */
export async function getShopOrders() {
  const response = await api.get<OrderApiResponse[]>('/orders/shop', true)
  if (response.success && response.data) {
    return { ...response, data: response.data.map(mapOrderResponse) }
  }
  return response as { success: boolean; data?: Order[]; error?: { message: string } }
}

/**
 * Get active orders (pending, preparing, ready) for the shop
 */
export async function getActiveOrders() {
  const response = await api.get<OrderApiResponse[]>('/orders/shop/active', true)
  if (response.success && response.data) {
    return { ...response, data: response.data.map(mapOrderResponse) }
  }
  return response as { success: boolean; data?: Order[]; error?: { message: string } }
}

/**
 * Get shop statistics (today's orders, revenue, etc.)
 */
export async function getShopStats() {
  const response = await api.get<ShopStats>('/orders/shop/stats', true)
  return response
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const response = await api.put<OrderApiResponse>(`/orders/${orderId}/status`, { status }, true)
  if (response.success && response.data) {
    return { ...response, data: mapOrderResponse(response.data) }
  }
  return response as { success: boolean; data?: Order; error?: { message: string } }
}

// ============ Menu API ============

/**
 * Get menu items for a specific shop
 */
export async function getShopMenuItems(shopId: string) {
  const response = await api.get<FoodItem[]>(`/shops/${shopId}/menu`, true)
  return response
}

/**
 * Get categories for a specific shop
 */
export async function getShopCategories(shopId: string) {
  const response = await api.get<Category[]>(`/shops/${shopId}/categories`, true)
  return response
}

/**
 * Create a new menu item
 */
export async function createMenuItem(data: Partial<FoodItem>) {
  const response = await api.post<FoodItem>('/owner/menu', data, true)
  return response
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(itemId: string, data: Partial<FoodItem>) {
  const response = await api.put<FoodItem>(`/owner/menu/${itemId}`, data, true)
  return response
}

/**
 * Toggle menu item availability
 */
export async function toggleMenuItemAvailability(itemId: string, isAvailable: boolean) {
  const response = await api.patch<FoodItem>(`/owner/menu/${itemId}/availability`, { isAvailable }, true)
  return response
}

/**
 * Set offer on a menu item
 */
export async function setMenuItemOffer(itemId: string, offerPrice: number) {
  const response = await api.post<FoodItem>(`/owner/menu/${itemId}/offer`, { offerPrice }, true)
  return response
}

/**
 * Remove offer from a menu item
 */
export async function removeMenuItemOffer(itemId: string) {
  const response = await api.delete<FoodItem>(`/owner/menu/${itemId}/offer`, true)
  return response
}

/**
 * Create a new category
 */
export async function createCategory(data: { name: string; displayOrder?: number }) {
  const response = await api.post<Category>('/owner/categories', data, true)
  return response
}

// ============ Analytics API ============

/**
 * Get analytics data for the shop
 * This combines multiple data points for the analytics dashboard
 */
export async function getAnalyticsData(): Promise<{ success: boolean; data?: AnalyticsData; error?: { message: string } }> {
  // First try to get from dedicated analytics endpoint
  const statsResponse = await api.get<AnalyticsData>('/orders/shop/analytics', true)

  if (statsResponse.success && statsResponse.data) {
    return statsResponse
  }

  // Fallback: construct analytics from orders if dedicated endpoint doesn't exist
  const ordersResponse = await api.get<Order[]>('/orders/shop', true)

  if (!ordersResponse.success || !ordersResponse.data) {
    return { success: false, error: { message: ordersResponse.error?.message || 'Failed to fetch analytics data' } }
  }

  const orders = ordersResponse.data
  const completedOrders = orders.filter(o => o.status === 'completed')

  // Time calculations
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  // This month stats
  const thisMonthOrders = completedOrders.filter(o => new Date(o.createdAt) >= thisMonth)
  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.total, 0)
  const thisMonthProfit = thisMonthOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
      const costPrice = item.costPrice || (item.price * 0.6)
      const sellPrice = item.offerPrice || item.price
      return itemSum + ((sellPrice - costPrice) * item.quantity)
    }, 0)
  }, 0)

  // Last month stats for comparison
  const lastMonthOrders = completedOrders.filter(o => {
    const orderDate = new Date(o.createdAt)
    return orderDate >= lastMonth && orderDate <= lastMonthEnd
  })
  const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0)

  // Calculate growth
  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 100

  // Top selling items
  const itemSales: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {}
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.id]) {
        itemSales[item.id] = { id: item.id, name: item.name, quantity: 0, revenue: 0 }
      }
      itemSales[item.id].quantity += item.quantity
      itemSales[item.id].revenue += (item.offerPrice || item.price) * item.quantity
    })
  })
  const topItems = Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Unique customers
  const uniqueCustomers = new Set(completedOrders.map(o => o.userId)).size

  // Average order value
  const avgOrderValue = completedOrders.length > 0
    ? Math.round(completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length)
    : 0

  const profitMargin = thisMonthRevenue > 0 ? Math.round((thisMonthProfit / thisMonthRevenue) * 100) : 0

  return {
    success: true,
    data: {
      thisMonthRevenue,
      thisMonthProfit: Math.round(thisMonthProfit),
      thisMonthOrders: thisMonthOrders.length,
      lastMonthRevenue,
      revenueGrowth,
      uniqueCustomers,
      avgOrderValue,
      totalCompletedOrders: completedOrders.length,
      profitMargin,
      topItems
    }
  }
}
