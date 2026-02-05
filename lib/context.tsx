'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, CartItem, FoodItem, Order, Shop, Transaction } from './types'
import { authService, type User as ApiUser } from './auth'
import { api } from './api'

// Helper to safely access localStorage
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const storeUser = (user: User | null) => {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  } catch {
    // Ignore storage errors
  }
}

// Helper to safely access cart from localStorage
const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('cart')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const storeCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('cart', JSON.stringify(cart))
  } catch {
    // Ignore storage errors
  }
}

// Convert API user to local User type
const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  phone: apiUser.phone,
  role: apiUser.role,
  balance: apiUser.balance,
  rollNumber: apiUser.rollNumber,
  department: apiUser.department,
  year: apiUser.year?.toString(),
  shopId: apiUser.shopId,
  isApproved: apiUser.isApproved,
})

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isHydrated: boolean
  isLoading: boolean
  refreshUserData: () => Promise<void>
  cart: CartItem[]
  addToCart: (item: FoodItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  orders: Order[]
  addOrder: (order: Order) => Promise<Order | null>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>
  fetchOrders: () => Promise<void>
  students: User[]
  pendingStudents: User[]
  updateStudentBalance: (studentId: string, amount: number) => void
  addPendingStudent: (student: User) => void
  approveStudent: (studentId: string) => Promise<boolean>
  rejectStudent: (studentId: string) => Promise<boolean>
  fetchStudents: () => Promise<void>
  foodItems: FoodItem[]
  updateFoodItem: (item: FoodItem) => void
  addFoodItem: (item: FoodItem) => void
  deleteFoodItem: (itemId: string) => void
  toggleFoodAvailability: (itemId: string) => void
  fetchFoodItems: () => Promise<void>
  shops: Shop[]
  fetchShops: () => Promise<void>
  transactions: Transaction[]
  addTransaction: (transaction: Transaction) => void
  fetchTransactions: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [pendingStudents, setPendingStudents] = useState<User[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Fetch shops from API
  const fetchShops = useCallback(async () => {
    try {
      // Superadmin gets ALL shops (including inactive), others get only active
      const currentUser = getStoredUser()
      const params = currentUser?.role === 'superadmin' ? '?activeOnly=false' : ''

      const response = await api.get<{ shops: Shop[] }>(`/shops${params}`)
      if (response.success && response.data?.shops) {
        setShops(response.data.shops)
      }
    } catch (error) {
      console.error('[Context] Failed to fetch shops:', error)
    }
  }, [])

  // Fetch food items from API
  const fetchFoodItems = useCallback(async () => {
    try {
      const currentUser = getStoredUser()

      // Superadmin tries to get ALL items (including unavailable)
      if (currentUser?.role === 'superadmin') {
        const superadminResponse = await api.get<{ items: FoodItem[] }>('/superadmin/menu', true)
        if (superadminResponse.success && superadminResponse.data?.items) {
          setFoodItems(superadminResponse.data.items)
          return
        }
        // Fallback to public endpoint if superadmin endpoint fails (e.g., not deployed yet)
        console.log('[Context] Superadmin menu endpoint not available, using public endpoint')
      }

      // Public endpoint for regular users or as fallback
      const response = await api.get<{ items: FoodItem[] }>('/menu/items')
      if (response.success && response.data?.items) {
        setFoodItems(response.data.items)
      }
    } catch (error) {
      console.error('[Context] Failed to fetch food items:', error)
    }
  }, [])

  // Fetch orders from API (requires auth) - endpoint depends on user role
  const fetchOrders = useCallback(async () => {
    try {
      const currentUser = getStoredUser()

      // Determine endpoint based on role:
      // - Students use /orders/my (their own orders)
      // - Shop staff (captain, owner) and superadmin use /orders/shop
      // - Accountants don't need to fetch orders (they work with wallets/payments)
      let endpoint: string | null = null
      if (currentUser?.role === 'student') {
        endpoint = '/orders/my'
      } else if (['captain', 'owner', 'superadmin'].includes(currentUser?.role || '')) {
        endpoint = '/orders/shop'
      }

      // Skip if role doesn't need orders (e.g., accountant)
      if (!endpoint) {
        return
      }

      const response = await api.get<Order[] | { orders: Order[] }>(endpoint, true)

      if (response.success && response.data) {
        // Handle both array response and object with orders property
        const ordersData = Array.isArray(response.data) ? response.data : response.data.orders || []
        // Convert date strings to Date objects
        const ordersWithDates = ordersData.map(order => ({
          ...order,
          createdAt: new Date(order.createdAt),
          completedAt: order.completedAt ? new Date(order.completedAt) : undefined
        }))
        setOrders(ordersWithDates)
      }
    } catch (error) {
      console.error('[Context] Failed to fetch orders:', error)
    }
  }, [])

  // Fetch students from API (for admin/accountant roles)
  const fetchStudents = useCallback(async () => {
    try {
      const currentUser = getStoredUser()
      // Use appropriate endpoint based on role
      const endpoint = currentUser?.role === 'superadmin' ? '/superadmin/users' : '/accountant/students'
      const response = await api.get<User[] | { users: User[]; data?: User[] }>(endpoint, true)

      if (response.success && response.data) {
        // Handle different response formats
        const allUsers = Array.isArray(response.data)
          ? response.data
          : (response.data.users || response.data.data || [])
        setStudents(allUsers.filter(u => u.isApproved !== false))

        // Fetch pending approvals separately for accountant
        if (currentUser?.role === 'accountant' || currentUser?.role === 'superadmin') {
          try {
            const pendingResponse = await api.get<User[]>('/accountant/pending-approvals', true)
            if (pendingResponse.success && pendingResponse.data) {
              const pendingUsers = Array.isArray(pendingResponse.data) ? pendingResponse.data : []
              setPendingStudents(pendingUsers)
            }
          } catch {
            // Pending approvals endpoint may not exist for all roles
          }
        }
      }
    } catch (error) {
      console.error('[Context] Failed to fetch students:', error)
    }
  }, [])

  // Fetch transactions from API (requires auth)
  const fetchTransactions = useCallback(async () => {
    try {
      const currentUser = getStoredUser()
      // Students use student wallet endpoint, accountants use accountant endpoint
      const endpoint = currentUser?.role === 'student'
        ? '/student/wallet/transactions'
        : '/accountant/transactions'
      const response = await api.get<Transaction[] | { transactions: Transaction[]; data?: { transactions: Transaction[] } }>(endpoint, true)

      if (response.success && response.data) {
        // Handle different response formats
        let transactionsData: Transaction[] = []
        if (Array.isArray(response.data)) {
          transactionsData = response.data
        } else if (response.data.transactions) {
          transactionsData = response.data.transactions
        } else if (response.data.data?.transactions) {
          transactionsData = response.data.data.transactions
        }

        const transactionsWithDates = transactionsData.map(t => ({
          ...t,
          createdAt: new Date(t.createdAt)
        }))
        setTransactions(transactionsWithDates)
      }
    } catch (error) {
      console.error('[Context] Failed to fetch transactions:', error)
    }
  }, [])

  // Refresh user data from API
  const refreshUserData = useCallback(async () => {
    try {
      const freshUser = await authService.refreshUserData()
      if (freshUser) {
        const mappedUser = mapApiUserToUser(freshUser)
        setUserState(mappedUser)
        storeUser(mappedUser)
      }
    } catch (error) {
      console.error('[Context] Failed to refresh user data:', error)
    }
  }, [])

  // Load initial data based on user role
  const loadUserData = useCallback(async (currentUser: User) => {
    console.log('[Context] Loading data for user role:', currentUser.role)

    // Always fetch shops and food items
    await Promise.all([fetchShops(), fetchFoodItems()])

    // Fetch orders for all authenticated users (except accountant - they don't need orders)
    if (currentUser.role !== 'accountant') {
      await fetchOrders()
    }

    // Fetch additional data based on role
    // Note: Accountants have their own AccountantProvider that handles their data
    // Note: Captains don't need student data - they only handle orders
    if (['superadmin', 'owner'].includes(currentUser.role)) {
      await fetchStudents()
    }

    if (['superadmin'].includes(currentUser.role)) {
      await fetchTransactions()
    }
  }, [fetchShops, fetchFoodItems, fetchOrders, fetchStudents, fetchTransactions])

  // Hydrate user and cart from localStorage on mount, then validate auth
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = getStoredUser()
      const storedCart = getStoredCart()

      // Restore cart from localStorage
      if (storedCart.length > 0) {
        setCart(storedCart)
      }

      if (storedUser) {
        // Check if we have a valid token
        if (authService.isAuthenticated()) {
          setUserState(storedUser)

          // Try to refresh user data to ensure it's current
          // This may fail with 401 if token is expired - that's okay
          const freshUser = await authService.refreshUserData()
          if (freshUser) {
            const mappedUser = mapApiUserToUser(freshUser)
            setUserState(mappedUser)
            storeUser(mappedUser)
            // Load user-specific data
            await loadUserData(mappedUser)
          } else {
            // Token might be invalid/expired - continue with stored data
            // User will need to re-login if they try to make authenticated requests
            console.log('[Context] Could not refresh user data, using stored data')
            await loadUserData(storedUser)
          }
        } else {
          // No valid token, clear user
          console.log('[Context] No valid auth token, clearing user')
          storeUser(null)
        }
      }

      setIsHydrated(true)
    }

    initializeAuth()
  }, [loadUserData])

  // Wrapper to persist user to localStorage
  const setUser = (newUser: User | null) => {
    setUserState(newUser)
    storeUser(newUser)
  }

  // Login using backend API
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    console.log('[Context] Login attempt for:', username)
    try {
      const result = await authService.login(username, password)
      console.log('[Context] Login result:', result)
      if (result.success && result.user) {
        const mappedUser = mapApiUserToUser(result.user)
        console.log('[Context] Mapped user:', mappedUser)
        setUserState(mappedUser)
        storeUser(mappedUser)

        // Load user-specific data after successful login
        await loadUserData(mappedUser)

        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (error) {
      console.error('[Context] Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout - clear all state and storage
  const logout = () => {
    console.log('[Context] Logging out user')
    authService.logout()
    setUserState(null)
    storeUser(null)
    setCart([])
    storeCart([])
    setOrders([])
    setStudents([])
    setPendingStudents([])
    setTransactions([])
  }

  const addToCart = (item: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      let newCart: CartItem[]
      if (existing) {
        newCart = prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        newCart = [...prev, { ...item, quantity: 1 }]
      }
      storeCart(newCart)
      return newCart
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = prev.filter(i => i.id !== itemId)
      storeCart(newCart)
      return newCart
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prev => {
      const newCart = prev.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      )
      storeCart(newCart)
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    storeCart([])
  }

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.isOffer && item.offerPrice ? item.offerPrice : item.price
    return sum + (price * item.quantity)
  }, 0)

  // Create order via API
  const addOrder = async (order: Order): Promise<Order | null> => {
    try {
      // Prepare order data for API - backend expects foodItemId and quantity only
      const orderData = {
        shopId: order.shopId,
        items: order.items.map(item => ({
          foodItemId: item.id,
          quantity: item.quantity
        })),
        notes: order.notes || undefined
      }

      const response = await api.post<{ order: Order; data?: { order: Order } } | Order>('/orders', orderData, true)

      if (response.success && response.data) {
        // Handle different response formats
        const orderResponse = (response.data as { order?: Order; data?: { order?: Order } })
        const createdOrder = orderResponse.order || orderResponse.data?.order || (response.data as Order)

        if (createdOrder && createdOrder.id) {
          const newOrder = {
            ...createdOrder,
            createdAt: new Date(createdOrder.createdAt),
            completedAt: createdOrder.completedAt ? new Date(createdOrder.completedAt) : undefined
          }
          setOrders(prev => [newOrder, ...prev])

          // Update user balance locally
          if (user && user.role === 'student' && user.balance !== undefined) {
            const newBalance = user.balance - (createdOrder.total || order.total)
            const updatedUser = { ...user, balance: newBalance }
            setUserState(updatedUser)
            storeUser(updatedUser)
          }

          return newOrder
        }
      }

      console.error('[Context] Failed to create order:', response.error)
      return null
    } catch (error) {
      console.error('[Context] Error creating order:', error)
      return null
    }
  }

  // Update order status via API
  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      // Backend uses PUT for status updates
      const response = await api.put<{ order: Order } | Order>(`/orders/${orderId}/status`, { status }, true)

      if (response.success) {
        setOrders(prev => prev.map(o =>
          o.id === orderId ? {
            ...o,
            status,
            completedAt: status === 'completed' ? new Date() : o.completedAt
          } : o
        ))
        return true
      }

      console.error('[Context] Failed to update order status:', response.error)
      return false
    } catch (error) {
      console.error('[Context] Error updating order status:', error)
      return false
    }
  }

  const updateStudentBalance = (studentId: string, amount: number) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, balance: (s.balance || 0) + amount } : s
    ))
    if (user && user.id === studentId) {
      setUser({ ...user, balance: (user.balance || 0) + amount })
    }
  }

  const addPendingStudent = (student: User) => {
    setPendingStudents(prev => [...prev, student])
  }

  // Approve student via API
  const approveStudent = async (studentId: string): Promise<boolean> => {
    try {
      // Backend uses PUT /accountant/approve/:id
      const response = await api.put<{ user: User } | User>(`/accountant/approve/${studentId}`, { initialBalance: 0 }, true)

      if (response.success) {
        const student = pendingStudents.find(s => s.id === studentId)
        if (student) {
          setStudents(prev => [...prev, { ...student, isApproved: true, balance: 0 }])
          setPendingStudents(prev => prev.filter(s => s.id !== studentId))
        }
        return true
      }

      console.error('[Context] Failed to approve student:', response.error)
      return false
    } catch (error) {
      console.error('[Context] Error approving student:', error)
      return false
    }
  }

  // Reject student via API
  const rejectStudent = async (studentId: string): Promise<boolean> => {
    try {
      // Backend uses PUT /accountant/reject/:id
      const response = await api.put(`/accountant/reject/${studentId}`, {}, true)

      if (response.success) {
        setPendingStudents(prev => prev.filter(s => s.id !== studentId))
        return true
      }

      console.error('[Context] Failed to reject student:', response.error)
      return false
    } catch (error) {
      console.error('[Context] Error rejecting student:', error)
      return false
    }
  }

  // Update food item via API (superadmin)
  const updateFoodItem = async (item: FoodItem) => {
    try {
      // Parse preparation time - backend expects number in minutes
      const prepTimeValue = typeof item.preparationTime === 'string'
        ? parseInt(item.preparationTime.replace(/[^0-9]/g, ''), 10) || 15
        : item.preparationTime || 15

      const response = await api.put<{ data: FoodItem }>(`/superadmin/menu/${item.id}`, {
        name: item.name,
        description: item.description,
        price: item.price,
        costPrice: item.costPrice,
        categoryId: item.category, // Backend expects categoryId or category name
        imageUrl: item.image, // Backend stores as imageUrl, not image
        preparationTime: prepTimeValue,
        isAvailable: item.isAvailable,
      }, true)

      if (response.success) {
        setFoodItems(prev => prev.map(f => f.id === item.id ? item : f))
        return true
      }
      console.error('[Context] Failed to update food item:', response.error)
      return false
    } catch (error) {
      console.error('[Context] Error updating food item:', error)
      // Still update locally for optimistic UI
      setFoodItems(prev => prev.map(f => f.id === item.id ? item : f))
      return false
    }
  }

  // Add food item via API (superadmin)
  const addFoodItem = async (item: FoodItem) => {
    try {
      // Parse preparation time - backend expects number in minutes
      const prepTimeValue = typeof item.preparationTime === 'string'
        ? parseInt(item.preparationTime.replace(/[^0-9]/g, ''), 10) || 15
        : item.preparationTime || 15

      const response = await api.post<{ data: FoodItem }>('/superadmin/menu', {
        shopId: item.shopId,
        name: item.name,
        description: item.description,
        price: item.price,
        costPrice: item.costPrice,
        categoryId: item.category, // Backend expects categoryId or category name
        imageUrl: item.image, // Backend stores as imageUrl, not image
        preparationTime: prepTimeValue,
        isAvailable: item.isAvailable !== false,
      }, true)

      if (response.success && response.data) {
        const newItem = response.data.data || response.data
        setFoodItems(prev => [...prev, { ...item, id: (newItem as FoodItem).id || item.id }])
        return true
      }
      console.error('[Context] Failed to add food item:', response.error)
      return false
    } catch (error) {
      console.error('[Context] Error adding food item:', error)
      // Still add locally for optimistic UI
      setFoodItems(prev => [...prev, item])
      return false
    }
  }

  // Delete food item via API (superadmin)
  const deleteFoodItem = async (itemId: string) => {
    try {
      const response = await api.delete(`/superadmin/menu/${itemId}`, true)

      if (response.success) {
        setFoodItems(prev => prev.filter(f => f.id !== itemId))
        return true
      }
      console.error('[Context] Failed to delete food item:', response.error)
      return false
    } catch (error) {
      console.error('[Context] Error deleting food item:', error)
      // Still delete locally for optimistic UI
      setFoodItems(prev => prev.filter(f => f.id !== itemId))
      return false
    }
  }

  // Toggle food availability via API (superadmin uses update endpoint)
  const toggleFoodAvailability = async (itemId: string) => {
    const item = foodItems.find(f => f.id === itemId)
    if (!item) return false

    try {
      const response = await api.put(`/superadmin/menu/${itemId}`, {
        isAvailable: !item.isAvailable,
      }, true)

      if (response.success) {
        setFoodItems(prev => prev.map(f =>
          f.id === itemId ? { ...f, isAvailable: !f.isAvailable } : f
        ))
        return true
      }
      console.error('[Context] Failed to toggle availability:', response.error)
      return false
    } catch (error) {
      console.error('[Context] Error toggling availability:', error)
      // Still toggle locally for optimistic UI
      setFoodItems(prev => prev.map(f =>
        f.id === itemId ? { ...f, isAvailable: !f.isAvailable } : f
      ))
      return false
    }
  }

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev])
  }

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      isHydrated,
      isLoading,
      refreshUserData,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      orders,
      addOrder,
      updateOrderStatus,
      fetchOrders,
      students,
      pendingStudents,
      updateStudentBalance,
      addPendingStudent,
      approveStudent,
      rejectStudent,
      fetchStudents,
      foodItems,
      updateFoodItem,
      addFoodItem,
      deleteFoodItem,
      toggleFoodAvailability,
      fetchFoodItems,
      shops,
      fetchShops,
      transactions,
      addTransaction,
      fetchTransactions
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
