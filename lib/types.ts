export type UserRole = 'student' | 'captain' | 'owner' | 'accountant' | 'superadmin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  balance?: number
  rollNumber?: string
  department?: string
  shopName?: string
  shopId?: string
  phone?: string
  year?: string
  isApproved?: boolean
  createdAt?: Date
  canteenName?: string
  institution?: string
}

export interface Shop {
  id: string
  name: string
  description: string
  category: 'canteen' | 'laundry' | 'xerox' | 'other'
  isActive: boolean
  ownerId?: string
}

export interface FoodItem {
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
  rating: number
  preparationTime: string
}

export interface CartItem extends FoodItem {
  quantity: number
}

export interface Order {
  id: string
  userId: string
  userName: string
  items: CartItem[]
  total: number
  shopId: string
  shopName?: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  pickupToken: string
  createdAt: Date
  completedAt?: Date
  handledBy?: string
  notes?: string
}

export interface Transaction {
  id: string
  userId: string
  userName: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  createdAt: Date
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  avatar?: string
  totalOrders: number
  totalSpent: number
  rank: number
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  activeStudents: number
  pendingOrders: number
  todayOrders: number
  todayRevenue: number
}

// ==================== AD-HOC PAYMENTS ====================

export interface PaymentRequest {
  id: string
  title: string
  description: string
  amount: number
  targetType: 'all' | 'selected' | 'department' | 'year'
  targetDepartment?: string
  targetYear?: number
  dueDate?: string
  status: 'active' | 'closed' | 'cancelled'
  isVisibleOnDashboard: boolean
  createdBy: {
    id: string
    name: string
  }
  totalTargetCount: number
  paidCount: number
  totalCollected: number
  createdAt: string
  updatedAt: string
}

export interface PendingPayment {
  id: string
  title: string
  description: string
  amount: number
  dueDate?: string
  status: 'pending' | 'paid'
  requestCreatedAt: string
}

export interface StudentPaymentStatus {
  id: string
  name: string
  email: string
  rollNumber: string
  department: string
  year: number
  status: 'pending' | 'paid'
  paidAt?: string
  amount: number
}

export interface PaymentSubmission {
  id: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paidAt?: string
  createdAt: string
}
