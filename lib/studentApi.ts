/**
 * Student API Service
 * API functions for student dashboard components
 */

import { api } from './api';
import type { FoodItem, Order, Transaction, Shop, User } from './types';

// Response types from backend
export interface ShopResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  ownerId?: string;
  timing?: string;
  imageUrl?: string;
}

export interface MenuItemResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  image?: string;      // Backend returns both 'image' (with fallback) and 'imageUrl' (raw)
  imageUrl?: string;
  category: string;
  shopId: string;
  isAvailable: boolean;
  isOffer?: boolean;
  offerPrice?: number;
  rating?: number;
  preparationTime?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  shopId: string;
}

export interface OrderResponse {
  id: string;
  _id?: string;
  // User can be populated object or string
  user?: string | { _id: string; id?: string; name: string; phone?: string; email?: string };
  userId?: string;
  userName?: string;
  // Shop can be populated object or string
  shop?: string | { _id: string; id?: string; name: string };
  shopId?: string;
  shopName?: string;
  items: Array<{
    foodItem?: string | { _id?: string; id?: string; name?: string; imageUrl?: string };  // Can be populated
    id?: string | { _id?: string; id?: string };  // Legacy support, can also be populated
    foodItemId?: string;
    name: string;
    quantity: number;
    price: number;
    offerPrice?: number;
    subtotal?: number;
    imageUrl?: string;
    category?: string;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  pickupToken: string;
  qrData?: string;
  orderNumber?: string;
  notes?: string;
  placedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WalletResponse {
  balance: number;
  userId: string;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
}

export interface ProfileResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  rollNumber?: string;
  department?: string;
  year?: number;
  balance: number;
  avatarUrl?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateOrderRequest {
  shopId: string;
  items: Array<{
    foodItemId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  totalSpent: number;
  ordersCount: number;
  rank: number;
  avatarUrl?: string;
}

// API functions
export const studentApi = {
  /**
   * Get all shops
   */
  async getShops(): Promise<{ success: boolean; data?: ShopResponse[]; error?: string }> {
    const response = await api.get<{ shops: ShopResponse[] }>('/shops');
    if (response.success && response.data) {
      return { success: true, data: response.data.shops || response.data as unknown as ShopResponse[] };
    }
    return { success: false, error: response.error?.message || 'Failed to fetch shops' };
  },

  /**
   * Get menu items for a shop
   */
  async getShopMenu(shopId: string): Promise<{ success: boolean; data?: MenuItemResponse[]; error?: string }> {
    const response = await api.get<MenuItemResponse[] | { items: MenuItemResponse[] }>(`/shops/${shopId}/menu`);
    if (response.success && response.data) {
      // Backend returns array directly at data, not wrapped in { items: [] }
      const items = Array.isArray(response.data) ? response.data : response.data.items;

      // Debug log to check image fields
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && items?.length > 0) {
        console.log('[StudentAPI] Menu item sample:', {
          name: items[0].name,
          image: items[0].image,
          imageUrl: items[0].imageUrl
        });
      }

      return { success: true, data: items };
    }
    return { success: false, error: response.error?.message || 'Failed to fetch menu' };
  },

  /**
   * Get categories for a shop
   */
  async getShopCategories(shopId: string): Promise<{ success: boolean; data?: CategoryResponse[]; error?: string }> {
    const response = await api.get<{ categories: CategoryResponse[] }>(`/shops/${shopId}/categories`);
    if (response.success && response.data) {
      return { success: true, data: response.data.categories || response.data as unknown as CategoryResponse[] };
    }
    return { success: false, error: response.error?.message || 'Failed to fetch categories' };
  },

  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<{ success: boolean; data?: OrderResponse; error?: string }> {
    const response = await api.post<{ order: OrderResponse }>('/orders', orderData, true);
    if (response.success && response.data) {
      return { success: true, data: response.data.order || response.data as unknown as OrderResponse };
    }
    return { success: false, error: response.error?.message || 'Failed to create order' };
  },

  /**
   * Get student's orders
   */
  async getMyOrders(): Promise<{ success: boolean; data?: OrderResponse[]; error?: string }> {
    const response = await api.get<{ orders: OrderResponse[] }>('/orders/my', true);
    if (response.success && response.data) {
      return { success: true, data: response.data.orders || response.data as unknown as OrderResponse[] };
    }
    return { success: false, error: response.error?.message || 'Failed to fetch orders' };
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    const response = await api.post<{ message: string }>(`/orders/${orderId}/cancel`, {}, true);
    if (response.success) {
      return { success: true };
    }
    return { success: false, error: response.error?.message || 'Failed to cancel order' };
  },

  /**
   * Get wallet balance
   */
  async getWallet(): Promise<{ success: boolean; data?: WalletResponse; error?: string }> {
    const response = await api.get<WalletResponse>('/student/wallet', true);
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.error?.message || 'Failed to fetch wallet' };
  },

  /**
   * Get wallet transactions
   */
  async getTransactions(): Promise<{ success: boolean; data?: TransactionResponse[]; error?: string }> {
    const response = await api.get<{ transactions: TransactionResponse[] }>('/student/wallet/transactions', true);
    if (response.success && response.data) {
      return { success: true, data: response.data.transactions || response.data as unknown as TransactionResponse[] };
    }
    return { success: false, error: response.error?.message || 'Failed to fetch transactions' };
  },

  /**
   * Get student profile
   */
  async getProfile(): Promise<{ success: boolean; data?: ProfileResponse; error?: string }> {
    const response = await api.get<ProfileResponse>('/student/profile', true);
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.error?.message || 'Failed to fetch profile' };
  },

  /**
   * Update student profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<{ success: boolean; data?: ProfileResponse; error?: string }> {
    const response = await api.put<ProfileResponse>('/student/profile', profileData, true);
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.error?.message || 'Failed to update profile' };
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
    const response = await api.get<LeaderboardEntry[]>('/student/leaderboard', true);
    return {
      success: response.success,
      data: response.data,
      error: response.error?.message
    };
  },
};

// Helper functions to map API responses to local types
export function mapMenuItemToFoodItem(item: MenuItemResponse, shopName?: string): FoodItem {
  // Backend returns both 'image' (with fallback) and 'imageUrl' (raw value)
  // Prefer 'image' as it has the fallback already applied
  const imageUrl = item.image || item.imageUrl || '/placeholder.svg';

  // Debug: Log when image URL appears to be a placeholder or missing
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (!item.image && !item.imageUrl) {
      console.log('[mapMenuItemToFoodItem] Missing image for:', item.name, '- using placeholder');
    } else if (imageUrl === '/placeholder.svg') {
      console.log('[mapMenuItemToFoodItem] Placeholder image for:', item.name);
    }
  }

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    costPrice: item.costPrice,
    image: imageUrl,
    category: item.category,
    shopId: item.shopId,
    shopName: shopName,
    isAvailable: item.isAvailable,
    isOffer: item.isOffer,
    offerPrice: item.offerPrice,
    rating: item.rating || 4.0,
    preparationTime: item.preparationTime || '15 min',
  };
}

export function mapOrderResponseToOrder(order: OrderResponse): Order {
  // Handle user - can be populated object or string
  let userId: string
  let userName: string = ''

  if (typeof order.user === 'object' && order.user !== null) {
    userId = order.user._id || order.user.id || ''
    userName = order.user.name || ''
  } else {
    userId = order.userId || order.user || ''
    userName = order.userName || ''
  }

  // Handle shop - can be populated object or string
  let shopId: string
  let shopName: string | undefined

  if (typeof order.shop === 'object' && order.shop !== null) {
    shopId = order.shop._id || order.shop.id || ''
    shopName = order.shop.name
  } else {
    shopId = order.shopId || order.shop || ''
    shopName = order.shopName
  }

  return {
    id: order.id || order._id || '',
    userId,
    userName,
    shopId,
    shopName,
    orderNumber: order.orderNumber,
    qrData: order.qrData,
    items: order.items.map(item => {
      // Handle foodItem being an object (populated) or string
      let itemId: string = ''
      let itemImage: string = item.imageUrl || '/placeholder.svg'

      if (typeof item.foodItem === 'object' && item.foodItem !== null) {
        const foodItem = item.foodItem as { _id?: string; id?: string; imageUrl?: string }
        itemId = foodItem._id || foodItem.id || ''
        if (foodItem.imageUrl) itemImage = foodItem.imageUrl
      } else if (typeof item.foodItem === 'string') {
        itemId = item.foodItem
      } else if (item.id) {
        itemId = typeof item.id === 'string' ? item.id : ''
      } else if (item.foodItemId) {
        itemId = item.foodItemId
      }

      return {
        id: itemId,
        name: item.name,
        description: '',
        price: item.price,
        image: itemImage,
        category: item.category || '',
        shopId: shopId,
        isAvailable: true,
        rating: 4.0,
        preparationTime: '15 min',
        quantity: item.quantity,
        offerPrice: item.offerPrice,
      }
    }),
    total: order.total,
    status: order.status,
    pickupToken: order.pickupToken,
    createdAt: new Date(order.placedAt || order.createdAt),
    completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
  };
}

export function mapTransactionResponseToTransaction(txn: TransactionResponse, userName?: string): Transaction {
  return {
    id: txn.id,
    userId: txn.userId,
    userName: userName || '',
    type: txn.type,
    amount: txn.amount,
    description: txn.description,
    createdAt: new Date(txn.createdAt),
  };
}

export function mapShopResponseToShop(shop: ShopResponse): Shop {
  return {
    id: shop.id,
    name: shop.name,
    description: shop.description,
    category: (shop.category as 'canteen' | 'laundry' | 'xerox' | 'other') || 'other',
    isActive: shop.isActive,
    ownerId: shop.ownerId,
  };
}

export default studentApi;
