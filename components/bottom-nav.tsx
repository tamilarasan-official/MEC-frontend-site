'use client'

import React from "react"

import { Home, ShoppingBag, User, History, Settings, LayoutDashboard, Users, Wallet, UtensilsCrossed, Gift, BookOpen, PieChart, TrendingUp, UserCheck, Store, ClipboardList, Menu, FileText, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

interface NavItem {
  icon: React.ElementType
  label: string
  id: string
}

const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Store, label: 'Stores', id: 'stores' },
    { icon: History, label: 'Orders', id: 'history' },
    { icon: Gift, label: 'Offers', id: 'offers' },
    { icon: User, label: 'Profile', id: 'profile' },
  ],
  captain: [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: ClipboardList, label: 'Orders', id: 'orders' },
    { icon: History, label: 'History', id: 'history' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ],
  owner: [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: ClipboardList, label: 'Orders', id: 'orders' },
    { icon: PieChart, label: 'Analytics', id: 'analytics' },
    { icon: Menu, label: 'Menu', id: 'menu' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ],
  accountant: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: UserCheck, label: 'Approvals', id: 'approvals' },
    { icon: Users, label: 'Students', id: 'students' },
    { icon: CreditCard, label: 'Payments', id: 'payments' },
    { icon: FileText, label: 'Reports', id: 'reports' },
  ],
  superadmin: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: TrendingUp, label: 'Analytics', id: 'analytics' },
    { icon: UtensilsCrossed, label: 'Menu', id: 'menu' },
    { icon: Store, label: 'Shops', id: 'shops' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ],
}

interface BottomNavProps {
  role: UserRole
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNav({ role, activeTab, onTabChange }: BottomNavProps) {
  const items = navConfig[role]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl transition-all duration-300",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-scale-in" />
              )}
              <div className="relative">
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-300",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
