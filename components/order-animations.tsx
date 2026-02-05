'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Package, Sparkles, X } from 'lucide-react'
import QRCode from 'react-qr-code'
import type { CartItem } from '@/lib/types'

interface OrderDetails {
  orderId: string
  pickupToken: string
  total: number
  items: CartItem[]
}

interface OrderAnimationProps {
  type: 'success' | 'failure'
  pickupToken?: string
  orderDetails?: OrderDetails
  onComplete?: () => void
}

export function OrderAnimation({ type, pickupToken, orderDetails, onComplete }: OrderAnimationProps) {
  const [stage, setStage] = useState(0)
  const [showQRCard, setShowQRCard] = useState(false)

  useEffect(() => {
    if (type === 'success') {
      const timers = [
        setTimeout(() => setStage(1), 300),
        setTimeout(() => setStage(2), 800),
        setTimeout(() => setStage(3), 1300),
        setTimeout(() => setShowQRCard(true), 2200),
      ]
      return () => timers.forEach(clearTimeout)
    } else {
      const timers = [
        setTimeout(() => setStage(1), 300),
        setTimeout(() => onComplete?.(), 2000)
      ]
      return () => timers.forEach(clearTimeout)
    }
  }, [onComplete, type])

  // QR Card Full Screen View
  if (showQRCard && type === 'success' && orderDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 animate-float-up">
        <div className="w-full max-w-sm">
          {/* Close Button */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* QR Card */}
          <div className="rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-emerald-600 p-1 shadow-2xl shadow-primary/30">
            <div className="rounded-[22px] bg-card p-6 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Order Confirmed
                </div>
                <h2 className="text-xl font-bold text-foreground">Show this at counter</h2>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl">
                  <QRCode
                    value={JSON.stringify({
                      orderId: orderDetails.orderId,
                      pickupToken: orderDetails.pickupToken,
                      total: orderDetails.total,
                    })}
                    size={180}
                    level="H"
                  />
                </div>
              </div>

              {/* Pickup Token */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Pickup Token</p>
                <p className="text-5xl font-bold text-primary tracking-widest">{orderDetails.pickupToken}</p>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-border" />

              {/* Order Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-foreground">{orderDetails.orderId}</span>
                </div>
                
                {/* Items */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Items</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.name} x{item.quantity}</span>
                        <span className="text-muted-foreground">Rs. {(item.offerPrice || item.price) * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total Paid</span>
                  <span className="font-bold text-primary text-lg">Rs. {orderDetails.total}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Ready in <span className="text-primary font-semibold">15-20 min</span>
                </p>
              </div>
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={onComplete}
            className="w-full mt-4 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  if (type === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 px-8 text-center">
          {/* Confetti particles */}
          {stage >= 2 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-confetti"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: '50%',
                    backgroundColor: ['#22c55e', '#10b981', '#fbbf24', '#f59e0b'][i % 4],
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.8 + Math.random() * 0.4}s`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Box animation */}
          <div className={`relative ${stage >= 1 ? 'animate-box-open' : ''}`}>
            <div className="relative">
              {/* Pulse rings */}
              {stage >= 2 && (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                {stage < 2 ? (
                  <Package className="w-24 h-24 text-primary" strokeWidth={1.5} />
                ) : (
                  <div className="animate-success-check">
                    <CheckCircle2 className="w-24 h-24 text-primary" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Sparkles */}
            {stage >= 2 && (
              <>
                <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-yellow-400 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-4 w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </>
            )}
          </div>
          
          {/* Text */}
          <div className={`space-y-2 transition-opacity duration-500 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-2xl font-bold text-foreground">Order Confirmed</h2>
            <p className="text-muted-foreground">
              Your order has been placed successfully
            </p>
          </div>

          {/* Pickup Token Card */}
          {pickupToken && stage >= 3 && (
            <div className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-center shadow-lg shadow-blue-500/30 animate-float-up">
              <p className="text-blue-100 text-sm font-medium tracking-wider uppercase mb-2">
                Pickup Token
              </p>
              <p className="text-white text-5xl font-bold tracking-wider mb-3">
                {pickupToken}
              </p>
              <p className="text-blue-100 text-sm">
                Show this code at the counter
              </p>
            </div>
          )}

          <p className={`text-sm text-muted-foreground transition-opacity duration-500 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            Get ready in <span className="text-primary font-semibold">15-20 min</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <div className={`${stage >= 1 ? 'animate-failure-shake' : ''}`}>
          <div className="w-32 h-32 flex items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="w-24 h-24 text-destructive" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className={`space-y-2 transition-opacity duration-500 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-2xl font-bold text-foreground">Order Failed</h2>
          <p className="text-muted-foreground">
            Something went wrong. Please try again.
          </p>
          <p className="text-sm text-destructive">
            Insufficient balance or item unavailable
          </p>
        </div>
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
    </div>
  )
}
