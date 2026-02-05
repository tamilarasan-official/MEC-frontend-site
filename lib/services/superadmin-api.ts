/**
 * Superadmin API Service
 * Handles all superadmin-related API calls
 */

import { api } from '@/lib/api'

// ============ Types ============

export interface SuperadminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: 'student' | 'captain' | 'owner' | 'accountant' | 'superadmin'
  rollNumber?: string
  department?: string
  year?: number
  balance?: number
  shopId?: string
  isApproved: boolean
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface UsersResponse {
  users: SuperadminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UsersQueryParams {
  search?: string
  role?: string
  department?: string
  isApproved?: boolean
  isActive?: boolean
  page?: number
  limit?: number
}

export interface Shop {
  id: string
  name: string
  description: string
  category: 'canteen' | 'laundry' | 'xerox' | 'other'
  isActive: boolean
  ownerId?: string
  ownerName?: string
  createdAt?: string
  updatedAt?: string
}

export interface ShopCreateData {
  name: string
  description?: string
  category: 'canteen' | 'laundry' | 'xerox' | 'other'
  ownerId?: string
}

export interface ShopUpdateData {
  name?: string
  description?: string
  category?: 'canteen' | 'laundry' | 'xerox' | 'other'
  ownerId?: string
  isActive?: boolean
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  costPrice?: number
  image: string
  category: string
  shopId: string
  shopName?: string
  isAvailable: boolean
  isOffer?: boolean
  offerPrice?: number
  rating?: number
  preparationTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface MenuItemCreateData {
  name: string
  description: string
  price: number
  costPrice?: number
  image?: string
  category: string
  shopId: string
  isAvailable?: boolean
  isOffer?: boolean
  offerPrice?: number
  preparationTime?: string
}

export interface MenuItemUpdateData {
  name?: string
  description?: string
  price?: number
  costPrice?: number
  image?: string
  category?: string
  isAvailable?: boolean
  isOffer?: boolean
  offerPrice?: number
  preparationTime?: string
}

export interface Category {
  id: string
  name: string
  shopId: string
  description?: string
  createdAt?: string
}

export interface CategoryCreateData {
  name: string
  shopId: string
  description?: string
}

export interface DashboardStats {
  totalRevenue: number
  monthlyRevenue: number
  monthlyProfit: number
  totalOrders: number
  monthlyOrders: number
  totalStudents: number
  activeShops: number
  totalShops: number
  totalMenuItems: number
  totalTransactions: number
}

export interface AnalyticsData {
  revenue: number
  profit: number
  orders: number
  uniqueCustomers: number
  topItems: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
    profit: number
  }>
  topCustomers: Array<{
    userId: string
    name: string
    total: number
    orders: number
  }>
  shopPerformance: Array<{
    id: string
    name: string
    revenue: number
    orders: number
  }>
}

// ============ User Management ============

export async function getUsers(params: UsersQueryParams = {}): Promise<{
  success: boolean
  data?: UsersResponse
  error?: string
}> {
  const queryParams = new URLSearchParams()

  if (params.search) queryParams.append('search', params.search)
  if (params.role) queryParams.append('role', params.role)
  if (params.department) queryParams.append('department', params.department)
  if (params.isApproved !== undefined) queryParams.append('isApproved', String(params.isApproved))
  if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
  if (params.page) queryParams.append('page', String(params.page))
  if (params.limit) queryParams.append('limit', String(params.limit))

  const queryString = queryParams.toString()
  const endpoint = `/superadmin/users${queryString ? `?${queryString}` : ''}`

  const response = await api.get<UsersResponse>(endpoint, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to fetch users' }
}

export async function updateUserRole(
  userId: string,
  role: string,
  shopId?: string
): Promise<{ success: boolean; data?: SuperadminUser; error?: string }> {
  const response = await api.put<SuperadminUser>(
    `/superadmin/users/${userId}/role`,
    { role, shopId },
    true
  )

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to update user role' }
}

export async function deactivateUser(
  userId: string
): Promise<{ success: boolean; data?: SuperadminUser; error?: string }> {
  const response = await api.put<SuperadminUser>(
    `/superadmin/users/${userId}/deactivate`,
    {},
    true
  )

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to deactivate user' }
}

export async function reactivateUser(
  userId: string
): Promise<{ success: boolean; data?: SuperadminUser; error?: string }> {
  const response = await api.put<SuperadminUser>(
    `/superadmin/users/${userId}/reactivate`,
    {},
    true
  )

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to reactivate user' }
}

// ============ Shop Management ============

export async function getShops(): Promise<{
  success: boolean
  data?: Shop[]
  error?: string
}> {
  const response = await api.get<{ shops: Shop[] } | Shop[]>('/shops', true)

  if (response.success && response.data) {
    // Handle both { shops: Shop[] } and Shop[] response formats
    const shops = Array.isArray(response.data) ? response.data : response.data.shops
    return { success: true, data: shops }
  }

  return { success: false, error: response.error?.message || 'Failed to fetch shops' }
}

export async function createShop(
  data: ShopCreateData
): Promise<{ success: boolean; data?: Shop; error?: string }> {
  const response = await api.post<Shop>('/superadmin/shops', data, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to create shop' }
}

export async function updateShop(
  shopId: string,
  data: ShopUpdateData
): Promise<{ success: boolean; data?: Shop; error?: string }> {
  const response = await api.put<Shop>(`/superadmin/shops/${shopId}`, data, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to update shop' }
}

export async function deleteShop(
  shopId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await api.delete(`/superadmin/shops/${shopId}`, true)

  if (response.success) {
    return { success: true }
  }

  return { success: false, error: response.error?.message || 'Failed to deactivate shop' }
}

export async function toggleShopStatus(
  shopId: string
): Promise<{ success: boolean; data?: Shop; error?: string }> {
  const response = await api.patch<Shop>(`/superadmin/shops/${shopId}/toggle`, {}, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to toggle shop status' }
}

// ============ Menu Management ============

export async function getMenuItems(shopId?: string): Promise<{
  success: boolean
  data?: MenuItem[]
  error?: string
}> {
  // If shopId is provided, fetch menu for that specific shop
  if (shopId) {
    const response = await api.get<MenuItem[]>(`/shops/${shopId}/menu`, true)

    if (response.success && response.data) {
      return { success: true, data: response.data }
    }

    return { success: false, error: response.error?.message || 'Failed to fetch menu items' }
  }

  // If no shopId, fetch menu items from all shops
  // First get all shops, then fetch menu from each
  const shopsResponse = await getShops()

  if (!shopsResponse.success || !shopsResponse.data) {
    return { success: false, error: shopsResponse.error || 'Failed to fetch shops' }
  }

  const allMenuItems: MenuItem[] = []
  const errors: string[] = []

  // Fetch menu items from each shop in parallel
  const menuPromises = shopsResponse.data.map(async (shop) => {
    const menuResponse = await api.get<MenuItem[]>(`/shops/${shop.id}/menu`, true)

    if (menuResponse.success && menuResponse.data) {
      // Add shop name to each menu item for context
      return menuResponse.data.map(item => ({
        ...item,
        shopName: item.shopName || shop.name
      }))
    } else {
      errors.push(`Failed to fetch menu for shop ${shop.name}`)
      return []
    }
  })

  const results = await Promise.all(menuPromises)
  results.forEach(items => allMenuItems.push(...items))

  if (allMenuItems.length === 0 && errors.length > 0) {
    return { success: false, error: errors.join('; ') }
  }

  return { success: true, data: allMenuItems }
}

export async function createMenuItem(
  data: MenuItemCreateData
): Promise<{ success: boolean; data?: MenuItem; error?: string }> {
  const response = await api.post<MenuItem>('/superadmin/menu', data, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to create menu item' }
}

export async function updateMenuItem(
  itemId: string,
  data: MenuItemUpdateData
): Promise<{ success: boolean; data?: MenuItem; error?: string }> {
  const response = await api.put<MenuItem>(`/superadmin/menu/${itemId}`, data, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to update menu item' }
}

export async function deleteMenuItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await api.delete(`/superadmin/menu/${itemId}`, true)

  if (response.success) {
    return { success: true }
  }

  return { success: false, error: response.error?.message || 'Failed to delete menu item' }
}

// ============ Category Management ============

export async function createCategory(
  data: CategoryCreateData
): Promise<{ success: boolean; data?: Category; error?: string }> {
  const response = await api.post<Category>('/superadmin/categories', data, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to create category' }
}

// ============ Dashboard & Analytics ============

export async function getDashboardStats(): Promise<{
  success: boolean
  data?: DashboardStats
  error?: string
}> {
  const response = await api.get<DashboardStats>('/superadmin/dashboard/stats', true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to fetch dashboard stats' }
}

export async function getAnalytics(filter: 'today' | 'week' | 'month' | 'all' = 'month'): Promise<{
  success: boolean
  data?: AnalyticsData
  error?: string
}> {
  const response = await api.get<AnalyticsData>(`/superadmin/analytics?filter=${filter}`, true)

  if (response.success && response.data) {
    return { success: true, data: response.data }
  }

  return { success: false, error: response.error?.message || 'Failed to fetch analytics' }
}

// Export all functions as a service object for convenience
export const superadminApi = {
  // Users
  getUsers,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  // Shops
  getShops,
  createShop,
  updateShop,
  deleteShop,
  toggleShopStatus,
  // Menu
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  // Categories
  createCategory,
  // Dashboard & Analytics
  getDashboardStats,
  getAnalytics,
}

export default superadminApi
