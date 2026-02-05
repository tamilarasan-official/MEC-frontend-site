'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { getCategoryName } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderAnimation } from '@/components/order-animations'
import type { Order, CartItem } from '@/lib/types'

interface CartProps {
  onClose: () => void
  onOrderSuccess?: () => void
}

export function Cart({ onClose, onOrderSuccess }: CartProps) {
  const { cart, cartTotal, user, updateQuantity, removeFromCart, clearCart, addOrder } = useApp()
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'failure'>('idle')
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string
    pickupToken: string
    total: number
    items: CartItem[]
  } | null>(null)

  const generatePickupToken = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0 || isPlacingOrder) return

    const hasBalance = user.balance && user.balance >= cartTotal

    if (!hasBalance) {
      setOrderStatus('failure')
      return
    }

    setIsPlacingOrder(true)

    const orderItems = [...cart]

    // Get shopId from the first item (assuming all items are from same shop for now)
    const shopId = orderItems[0]?.shopId
    const shopName = orderItems[0]?.shopName || 'Madras Canteen'

    if (!shopId) {
      console.error('No shopId found in cart items')
      setOrderStatus('failure')
      setIsPlacingOrder(false)
      return
    }

    const newOrder: Order = {
      id: `temp-${Date.now()}`, // Temporary ID, backend will generate real one
      userId: user.id,
      userName: user.name,
      items: orderItems,
      total: cartTotal,
      shopId,
      shopName,
      status: 'pending',
      pickupToken: '', // Backend will generate
      createdAt: new Date()
    }

    try {
      // Call API and wait for response
      const createdOrder = await addOrder(newOrder)

      if (createdOrder && createdOrder.id) {
        // Order successfully created - use the backend-generated details
        setOrderDetails({
          orderId: createdOrder.orderNumber || createdOrder.id,
          pickupToken: createdOrder.pickupToken || '',
          total: createdOrder.total || cartTotal,
          items: orderItems,
        })
        clearCart()
        setOrderStatus('success')
      } else {
        // Order creation failed
        console.error('Order creation failed - no order returned')
        setOrderStatus('failure')
      }
    } catch (error) {
      console.error('Order placement error:', error)
      setOrderStatus('failure')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handleAnimationComplete = () => {
    if (orderStatus === 'success' && onOrderSuccess) {
      onOrderSuccess()
    }
    setOrderStatus('idle')
    onClose()
  }

  if (orderStatus !== 'idle') {
    return (
      <OrderAnimation 
        type={orderStatus} 
        pickupToken={orderDetails?.pickupToken} 
        orderDetails={orderDetails || undefined}
        onComplete={handleAnimationComplete} 
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-5 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
          <p className="text-sm text-muted-foreground">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-2xl bg-card border border-border hover:bg-muted transition-all active:scale-95"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5">
            <div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add some delicious items!</p>
            </div>
            <Button variant="outline" onClick={onClose} className="rounded-2xl h-12 px-6">
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item, index) => {
              const price = item.isOffer && item.offerPrice ? item.offerPrice : item.price
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl bg-card border border-border animate-float-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FoodImage
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{getCategoryName(item.category)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-primary font-bold text-lg">Rs.{price * item.quantity}</p>
                      <div className="flex items-center bg-muted rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-foreground hover:bg-primary/20 transition-colors active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-foreground w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-foreground hover:bg-primary/20 transition-colors active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with Total */}
      {cart.length > 0 && (
        <div className="border-t border-border p-5 space-y-4 bg-card/95 backdrop-blur-xl">
          {/* Balance Info */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
            <span className="text-sm text-muted-foreground">Wallet Balance</span>
            <span className={`font-semibold ${user?.balance && user.balance >= cartTotal ? 'text-primary' : 'text-destructive'}`}>
              Rs.{user?.balance || 0}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">Rs.{cartTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-primary">Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">Rs.{cartTotal}</span>
            </div>
          </div>
          
          {user?.balance !== undefined && user.balance < cartTotal && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-sm">
                Insufficient balance. Add Rs.{cartTotal - user.balance} to proceed.
              </p>
            </div>
          )}
          
          <Button
            onClick={handlePlaceOrder}
            disabled={!user?.balance || user.balance < cartTotal || isPlacingOrder}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground hover:opacity-90 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
          >
            {isPlacingOrder ? 'Processing...' : `Pay Rs.${cartTotal}`}
          </Button>
        </div>
      )}
    </div>
  )
}
