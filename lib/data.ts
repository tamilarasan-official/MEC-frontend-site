/**
 * Data Constants and Mock Data for MEC Food App
 *
 * IMPORTANT: This file contains mock data for development purposes only.
 * In production, all data should be fetched from the backend API.
 *
 * - `categories` - Production-safe constant for UI filtering
 * - `_mock*` prefixed exports - Development-only mock data (DO NOT use in production)
 */

import type { FoodItem, Order, User, LeaderboardEntry, Transaction, Shop } from './types'

// =============================================================================
// PRODUCTION-SAFE CONSTANTS
// =============================================================================

/**
 * Food categories for UI filtering
 * This is safe to use in production as it's a static constant
 */
export const categories = ['All', 'South Indian', 'North Indian', 'Rice', 'Chinese', 'Snacks', 'Beverages']

// =============================================================================
// DEVELOPMENT-ONLY MOCK DATA
// WARNING: Do not use in production. Fetch real data from API instead.
// =============================================================================

/**
 * @deprecated Use API: GET /api/shops
 * Mock shop data for development only
 */
export const _mockShops: Shop[] = [
  { id: 'shop1', name: 'Madras Canteen', description: 'Main campus canteen serving breakfast, lunch and snacks', category: 'canteen', isActive: true, ownerId: 'o1' },
  { id: 'shop2', name: 'MadrasLaundry', description: 'Campus laundry service', category: 'laundry', isActive: false },
  { id: 'shop3', name: 'MadrasXerox', description: 'Print, copy and binding services', category: 'xerox', isActive: false },
]

/**
 * @deprecated Use API: GET /api/food-items or GET /api/shops/:shopId/menu
 * Mock food items for development only
 */
export const _mockFoodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken pieces and spices',
    price: 120,
    costPrice: 80,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    category: 'Rice',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.8,
    preparationTime: '20 min',
    isOffer: true,
    offerPrice: 99
  },
  {
    id: '2',
    name: 'Masala Dosa',
    description: 'Crispy dosa served with potato masala, sambar and chutney',
    price: 60,
    costPrice: 35,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop',
    category: 'South Indian',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.6,
    preparationTime: '15 min'
  },
  {
    id: '3',
    name: 'Veg Fried Rice',
    description: 'Flavorful rice stir-fried with fresh vegetables and soy sauce',
    price: 80,
    costPrice: 45,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    category: 'Rice',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.4,
    preparationTime: '15 min'
  },
  {
    id: '4',
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato gravy with soft paneer cubes',
    price: 110,
    costPrice: 65,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
    category: 'North Indian',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.7,
    preparationTime: '20 min',
    isOffer: true,
    offerPrice: 89
  },
  {
    id: '5',
    name: 'Samosa (2 pcs)',
    description: 'Crispy pastry filled with spiced potato filling',
    price: 30,
    costPrice: 15,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    category: 'Snacks',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.5,
    preparationTime: '5 min'
  },
  {
    id: '6',
    name: 'Cold Coffee',
    description: 'Refreshing cold coffee with ice cream',
    price: 50,
    costPrice: 25,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    category: 'Beverages',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.3,
    preparationTime: '5 min'
  },
  {
    id: '7',
    name: 'Chicken Noodles',
    description: 'Stir-fried noodles with chicken and vegetables',
    price: 90,
    costPrice: 50,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    category: 'Chinese',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.5,
    preparationTime: '15 min'
  },
  {
    id: '8',
    name: 'Idli Sambar',
    description: 'Soft idlis served with sambar and coconut chutney',
    price: 40,
    costPrice: 20,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop',
    category: 'South Indian',
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    isAvailable: true,
    rating: 4.4,
    preparationTime: '10 min'
  }
]

/**
 * @deprecated Use API: GET /api/users or GET /api/students
 * Mock student data for development only
 */
export const _mockStudents: User[] = [
  { id: 's1', name: 'Rahul Kumar', email: 'rahul@mec.edu', role: 'student', balance: 500, rollNumber: 'MEC2021001', department: 'CSE' },
  { id: 's2', name: 'Priya Sharma', email: 'priya@mec.edu', role: 'student', balance: 350, rollNumber: 'MEC2021002', department: 'ECE' },
  { id: 's3', name: 'Arun Prasad', email: 'arun@mec.edu', role: 'student', balance: 780, rollNumber: 'MEC2021003', department: 'MECH' },
  { id: 's4', name: 'Divya Lakshmi', email: 'divya@mec.edu', role: 'student', balance: 200, rollNumber: 'MEC2021004', department: 'CSE' },
  { id: 's5', name: 'Karthik Raja', email: 'karthik@mec.edu', role: 'student', balance: 620, rollNumber: 'MEC2021005', department: 'IT' },
]

/**
 * @deprecated Use API: GET /api/orders
 * Mock order data for development only
 */
export const _mockOrders: Order[] = [
  {
    id: 'ORD001',
    userId: 's1',
    userName: 'Rahul Kumar',
    items: [
      { ..._mockFoodItems[0], quantity: 1 },
      { ..._mockFoodItems[5], quantity: 2 }
    ],
    total: 220,
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    status: 'completed',
    pickupToken: '4521',
    createdAt: new Date('2026-02-03T09:30:00'),
    completedAt: new Date('2026-02-03T09:50:00')
  },
  {
    id: 'ORD002',
    userId: 's2',
    userName: 'Priya Sharma',
    items: [
      { ..._mockFoodItems[1], quantity: 2 }
    ],
    total: 120,
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    status: 'preparing',
    pickupToken: '7832',
    createdAt: new Date('2026-02-03T10:15:00')
  },
  {
    id: 'ORD003',
    userId: 's3',
    userName: 'Arun Prasad',
    items: [
      { ..._mockFoodItems[3], quantity: 1 },
      { ..._mockFoodItems[2], quantity: 1 }
    ],
    total: 190,
    shopId: 'shop1',
    shopName: 'Madras Canteen',
    status: 'pending',
    pickupToken: '5847',
    createdAt: new Date('2026-02-03T10:30:00')
  }
]

/**
 * @deprecated Use API: GET /api/leaderboard
 * Mock leaderboard data for development only
 */
export const _mockLeaderboard: LeaderboardEntry[] = [
  { userId: 's1', userName: 'Rahul Kumar', totalOrders: 45, totalSpent: 4500, rank: 1 },
  { userId: 's3', userName: 'Arun Prasad', totalOrders: 38, totalSpent: 3800, rank: 2 },
  { userId: 's5', userName: 'Karthik Raja', totalOrders: 32, totalSpent: 3200, rank: 3 },
  { userId: 's2', userName: 'Priya Sharma', totalOrders: 28, totalSpent: 2800, rank: 4 },
  { userId: 's4', userName: 'Divya Lakshmi', totalOrders: 22, totalSpent: 2200, rank: 5 },
]

/**
 * @deprecated Use API: GET /api/transactions
 * Mock transaction data for development only
 */
export const _mockTransactions: Transaction[] = [
  { id: 't1', userId: 's1', userName: 'Rahul Kumar', type: 'credit', amount: 1000, description: 'Wallet recharge', createdAt: new Date('2026-02-01') },
  { id: 't2', userId: 's1', userName: 'Rahul Kumar', type: 'debit', amount: 220, description: 'Order #ORD001', createdAt: new Date('2026-02-03') },
  { id: 't3', userId: 's2', userName: 'Priya Sharma', type: 'credit', amount: 500, description: 'Wallet recharge', createdAt: new Date('2026-02-02') },
  { id: 't4', userId: 's3', userName: 'Arun Prasad', type: 'debit', amount: 190, description: 'Order #ORD003', createdAt: new Date('2026-02-03') },
]

// =============================================================================
// LEGACY EXPORTS (for backward compatibility during migration)
// These will be removed in a future version. Update your imports to use _mock* versions
// or preferably, migrate to using the API.
// =============================================================================

/** @deprecated Use _mockShops instead, or better yet, fetch from API */
export const mockShops = _mockShops
/** @deprecated Use _mockFoodItems instead, or better yet, fetch from API */
export const mockFoodItems = _mockFoodItems
/** @deprecated Use _mockStudents instead, or better yet, fetch from API */
export const mockStudents = _mockStudents
/** @deprecated Use _mockOrders instead, or better yet, fetch from API */
export const mockOrders = _mockOrders
/** @deprecated Use _mockLeaderboard instead, or better yet, fetch from API */
export const mockLeaderboard = _mockLeaderboard
/** @deprecated Use _mockTransactions instead, or better yet, fetch from API */
export const mockTransactions = _mockTransactions
