'use client'

import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { User, Bell, LogOut, ChevronRight, Store, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OwnerSettings() {
  const { user, setUser } = useApp()
  const router = useRouter()

  const handleLogout = () => {
    setUser(null)
    router.push('/')
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-primary">
              <Store className="w-3 h-3" />
              {user?.shopName} - Owner
            </div>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-card/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Staff Management</p>
              <p className="text-sm text-muted-foreground">Manage captains</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-card/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Notifications</p>
              <p className="text-sm text-muted-foreground">Manage alerts</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </div>
  )
}
