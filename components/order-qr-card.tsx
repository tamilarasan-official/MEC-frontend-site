'use client'

import { X, CheckCircle2 } from 'lucide-react'
import QRCode from 'react-qr-code'
import type { Order } from '@/lib/types'

interface OrderQRCardProps {
  order: Order
  onClose: () => void
}

export function OrderQRCard({ order, onClose }: OrderQRCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 animate-float-up">
      <div className="w-full max-w-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>

        {/* QR Card */}
        <div className="rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-[2px] shadow-2xl shadow-primary/30 animate-glow">
          <div className="rounded-[22px] bg-card p-6 space-y-5">
            {/* Header */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold mb-3 ${
                order.status === 'completed' ? 'bg-primary/10 text-primary' :
                order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                order.status === 'ready' ? 'bg-blue-500/10 text-blue-400' :
                'bg-orange-500/10 text-orange-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                {order.status === 'completed' ? 'Completed' : 
                 order.status === 'cancelled' ? 'Cancelled' : 
                 order.status === 'ready' ? 'Ready for Pickup' : 'In Progress'}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {order.status === 'completed' || order.status === 'cancelled' 
                  ? 'Order Receipt' 
                  : 'Show at Counter'}
              </h2>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl">
                <QRCode
                  value={JSON.stringify({
                    orderId: order.id,
                    pickupToken: order.pickupToken,
                    total: order.total,
                  })}
                  size={180}
                  level="H"
                />
              </div>
            </div>

            {/* Pickup Token */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Pickup Token</p>
              <p className="text-5xl font-bold text-primary tracking-widest">{order.pickupToken}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-border" />

            {/* Order Details */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-foreground">{order.id}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {/* Items */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Items</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.name} x{item.quantity}</span>
                      <span className="text-muted-foreground">
                        Rs. {(item.isOffer && item.offerPrice ? item.offerPrice : item.price) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-medium text-muted-foreground">Total Paid</span>
                <span className="font-bold text-primary text-2xl">Rs.{order.total}</span>
              </div>
            </div>

            {/* Footer - only show for active orders */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="text-center p-4 rounded-2xl bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {order.status === 'ready' 
                    ? <span className="text-blue-400 font-semibold">Your order is ready! Please collect it.</span>
                    : <>Estimated time: <span className="text-foreground font-semibold">15-20 min</span></>
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          Done
        </button>
      </div>
    </div>
  )
}
