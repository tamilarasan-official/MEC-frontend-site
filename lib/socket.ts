/**
 * Socket.IO Client Service
 * Real-time connection for order updates
 */

import { io, Socket } from 'socket.io-client'

// Socket events (must match backend)
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Order events
  NEW_ORDER: 'order:new',
  STATUS_CHANGE: 'order:status_changed',
  ORDER_READY: 'order:ready',
  ORDER_COMPLETED: 'order:completed',
  ORDER_CANCELLED: 'order:cancelled',

  // Room events
  JOIN_SHOP: 'join:shop',
  LEAVE_SHOP: 'leave:shop',
  JOIN_USER: 'join:user',
  LEAVE_USER: 'leave:user',
} as const

// Order event payload type
export interface OrderEventPayload {
  orderId: string
  orderNumber: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total: number
  pickupToken: string
  itemCount: number
  items: Array<{
    name: string
    quantity: number
    subtotal: number
  }>
  placedAt: string
  preparingAt?: string
  readyAt?: string
  completedAt?: string
  cancelledAt?: string
  user: string | { _id: string; name: string }
  shop: string | { _id: string; name: string }
  timestamp: string
  notification?: {
    title: string
    body: string
    type: string
  }
}

// Socket instance
let socket: Socket | null = null

// Get socket URL from environment or use default
const getSocketUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Use the same host as the API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mecfoodapp.welocalhost.com'
    // Extract the origin (protocol + host)
    try {
      const url = new URL(apiUrl)
      return url.origin
    } catch {
      return apiUrl.replace('/api/v1', '')
    }
  }
  return 'http://localhost:3000'
}

// Track if we've logged connection errors to avoid spam
let hasLoggedConnectionError = false

/**
 * Initialize socket connection
 */
export function initializeSocket(): Socket {
  if (socket?.connected) {
    return socket
  }

  // Return existing socket if it's connecting
  if (socket) {
    return socket
  }

  const socketUrl = getSocketUrl()
  console.log('[Socket] Connecting to:', socketUrl)

  socket = io(socketUrl, {
    // Use polling first (more reliable), then upgrade to websocket
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 30000,
    // Don't force new connection on reconnect
    forceNew: false,
  })

  // Connection event handlers
  socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log('[Socket] Connected:', socket?.id)
    hasLoggedConnectionError = false // Reset error flag on successful connect
  })

  socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
    console.log('[Socket] Disconnected:', reason)
  })

  socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: Error) => {
    // Only log connection error once to avoid console spam
    if (!hasLoggedConnectionError) {
      console.warn('[Socket] Connection unavailable - will retry. Real-time updates disabled until connected.')
      hasLoggedConnectionError = true
    }
  })

  return socket
}

/**
 * Get the socket instance (initialize if needed)
 */
export function getSocket(): Socket {
  if (!socket) {
    return initializeSocket()
  }
  return socket
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log('[Socket] Manually disconnected')
  }
}

/**
 * Join a shop room to receive order updates
 */
export function joinShopRoom(shopId: string): void {
  const s = getSocket()
  if (s.connected) {
    s.emit(SOCKET_EVENTS.JOIN_SHOP, shopId)
    console.log('[Socket] Joined shop room:', shopId)
  } else {
    // Wait for connection then join
    s.once(SOCKET_EVENTS.CONNECT, () => {
      s.emit(SOCKET_EVENTS.JOIN_SHOP, shopId)
      console.log('[Socket] Joined shop room after connect:', shopId)
    })
  }
}

/**
 * Leave a shop room
 */
export function leaveShopRoom(shopId: string): void {
  const s = getSocket()
  s.emit(SOCKET_EVENTS.LEAVE_SHOP, shopId)
  console.log('[Socket] Left shop room:', shopId)
}

/**
 * Join a user room to receive personal order updates
 */
export function joinUserRoom(userId: string): void {
  const s = getSocket()
  if (s.connected) {
    s.emit(SOCKET_EVENTS.JOIN_USER, userId)
    console.log('[Socket] Joined user room:', userId)
  } else {
    s.once(SOCKET_EVENTS.CONNECT, () => {
      s.emit(SOCKET_EVENTS.JOIN_USER, userId)
      console.log('[Socket] Joined user room after connect:', userId)
    })
  }
}

/**
 * Leave a user room
 */
export function leaveUserRoom(userId: string): void {
  const s = getSocket()
  s.emit(SOCKET_EVENTS.LEAVE_USER, userId)
  console.log('[Socket] Left user room:', userId)
}

/**
 * Subscribe to new order events
 */
export function onNewOrder(callback: (order: OrderEventPayload) => void): () => void {
  const s = getSocket()
  s.on(SOCKET_EVENTS.NEW_ORDER, callback)
  return () => s.off(SOCKET_EVENTS.NEW_ORDER, callback)
}

/**
 * Subscribe to order status change events
 */
export function onOrderStatusChange(callback: (order: OrderEventPayload) => void): () => void {
  const s = getSocket()
  s.on(SOCKET_EVENTS.STATUS_CHANGE, callback)
  return () => s.off(SOCKET_EVENTS.STATUS_CHANGE, callback)
}

/**
 * Subscribe to order ready events
 */
export function onOrderReady(callback: (order: OrderEventPayload) => void): () => void {
  const s = getSocket()
  s.on(SOCKET_EVENTS.ORDER_READY, callback)
  return () => s.off(SOCKET_EVENTS.ORDER_READY, callback)
}

/**
 * Subscribe to order cancelled events
 */
export function onOrderCancelled(callback: (order: OrderEventPayload) => void): () => void {
  const s = getSocket()
  s.on(SOCKET_EVENTS.ORDER_CANCELLED, callback)
  return () => s.off(SOCKET_EVENTS.ORDER_CANCELLED, callback)
}

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinShopRoom,
  leaveShopRoom,
  joinUserRoom,
  leaveUserRoom,
  onNewOrder,
  onOrderStatusChange,
  onOrderReady,
  onOrderCancelled,
  SOCKET_EVENTS,
}
