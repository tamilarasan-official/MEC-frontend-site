'use client'

import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Store, Clock, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CanteenSettings() {
  const { user, setUser } = useApp()
  const router = useRouter()

  const handleLogout = () => {
    setUser(null)
    router.push('/')
  }

  const menuItems = [
    { icon: Store, label: 'Canteen Profile', description: 'Edit name, logo and details' },
    { icon: Clock, label: 'Operating Hours', description: 'Set your opening times' },
    { icon: Bell, label: 'Notifications', description: 'Order alerts and sounds' },
    { icon: Moon, label: 'Appearance', description: 'Theme and display settings' },
    { icon: Shield, label: 'Security', description: 'Password and access' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help with issues' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your canteen preferences</p>
      </div>

      {/* Canteen Info Card */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Store className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{user?.canteenName || 'Unknown Canteen'}</h3>
            <p className="text-sm text-muted-foreground">{user?.institution || 'Institution'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-medium">Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full h-12 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </div>
  )
}
