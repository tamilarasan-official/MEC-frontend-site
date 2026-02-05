'use client'

import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { User, Shield, Bell, Database, LogOut, ChevronRight, Moon } from 'lucide-react'

export function SuperAdminSettings() {
  const { user, setUser } = useApp()
  const router = useRouter()

  const handleLogout = () => {
    setUser(null)
    router.push('/')
  }

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Settings', description: 'Update your personal information' },
        { icon: Shield, label: 'Security', description: 'Password and authentication' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', description: 'Configure alert preferences' },
        { icon: Moon, label: 'Appearance', description: 'Dark mode and display settings' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Database, label: 'Data Management', description: 'Backup and restore data' },
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Super Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">{group.title}</h3>
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            {group.items.map((item, index) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors ${
                  index > 0 ? 'border-t border-border' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  )
}
