'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { studentApi, type ProfileResponse, type TransactionResponse } from '@/lib/studentApi'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  User,
  Mail,
  Hash,
  Building2,
  Wallet,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
  Loader2,
  AlertCircle,
  RefreshCw,
  History,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function StudentProfile() {
  const { user, setUser } = useApp()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTransactions, setShowTransactions] = useState(false)
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  // Fetch profile and wallet data from API
  useEffect(() => {
    fetchProfileData()
  }, [])

  async function fetchProfileData() {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch profile and wallet in parallel
      const [profileResult, walletResult] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getWallet()
      ])

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data)
        // Update local user context with fresh data
        if (user) {
          setUser({
            ...user,
            name: profileResult.data.name,
            email: profileResult.data.email,
            phone: profileResult.data.phone,
            rollNumber: profileResult.data.rollNumber,
            department: profileResult.data.department,
            balance: profileResult.data.balance,
          })
        }
      }

      if (walletResult.success && walletResult.data) {
        setWalletBalance(walletResult.data.balance)
      } else if (profileResult.success && profileResult.data) {
        // Fallback to profile balance if wallet endpoint fails
        setWalletBalance(profileResult.data.balance)
      }

      if (!profileResult.success && !walletResult.success) {
        setError('Failed to load profile data')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchTransactions() {
    setTransactionsLoading(true)
    try {
      const result = await studentApi.getTransactions()
      if (result.success && result.data) {
        setTransactions(result.data)
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const handleShowTransactions = () => {
    if (!showTransactions && transactions.length === 0) {
      fetchTransactions()
    }
    setShowTransactions(!showTransactions)
  }

  const handleLogout = () => {
    setUser(null)
    router.push('/')
  }

  const handleRetry = () => {
    fetchProfileData()
  }

  // Use profile data or fall back to context user
  const displayName = profile?.name || user?.name || ''
  const displayEmail = profile?.email || user?.email || ''
  const displayRollNumber = profile?.rollNumber || user?.rollNumber || ''
  const displayDepartment = profile?.department || user?.department || ''
  const displayBalance = walletBalance ?? profile?.balance ?? user?.balance ?? 0

  const menuItems = [
    { icon: Bell, label: 'Notifications', description: 'Manage your notifications' },
    { icon: Shield, label: 'Privacy & Security', description: 'Account security settings' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help with your orders' },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  // Error state (but still show profile if we have user context)
  if (error && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-foreground font-medium">Failed to load profile</p>
        <p className="text-muted-foreground text-sm text-center max-w-xs">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  if (!user && !profile) return null

  return (
    <div className="space-y-6">
      {/* Error banner if API failed but we have cached data */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-700 dark:text-yellow-400 text-sm flex-1">
            Could not refresh profile. Showing cached data.
          </p>
          <button
            onClick={handleRetry}
            className="p-1.5 hover:bg-yellow-500/20 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-yellow-600" />
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-emerald-500/10 to-teal-500/10 border border-primary/20 p-6">
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/30">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">{displayName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{displayDepartment} Department</p>
            <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              MEC Student
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-2xl font-bold text-primary">Rs.{displayBalance?.toFixed(0) || 0}</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
            Add Money
          </button>
        </div>

        {/* Transaction History Toggle */}
        <button
          onClick={handleShowTransactions}
          className="w-full mt-4 flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">Transaction History</span>
          </div>
          <ChevronRight className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            showTransactions && "rotate-90"
          )} />
        </button>

        {/* Transactions List */}
        {showTransactions && (
          <div className="mt-3 space-y-2">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No transactions yet
              </p>
            ) : (
              transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    txn.type === 'credit' ? 'bg-primary/10' : 'bg-orange-500/10'
                  )}>
                    {txn.type === 'credit' ? (
                      <ArrowDownLeft className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className={cn(
                    "font-semibold",
                    txn.type === 'credit' ? 'text-primary' : 'text-orange-500'
                  )}>
                    {txn.type === 'credit' ? '+' : '-'}Rs.{txn.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
          <Mail className="w-5 h-5 text-primary mb-3" />
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-medium text-foreground truncate mt-1">{displayEmail}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
          <Hash className="w-5 h-5 text-blue-400 mb-3" />
          <p className="text-xs text-muted-foreground">Roll Number</p>
          <p className="text-sm font-medium text-foreground mt-1">{displayRollNumber}</p>
        </div>
        <div className="col-span-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
          <Building2 className="w-5 h-5 text-orange-400 mb-3" />
          <p className="text-xs text-muted-foreground">Department</p>
          <p className="text-sm font-medium text-foreground mt-1">{displayDepartment} - Madras Engineering College</p>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : theme === 'light' ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Monitor className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">Appearance</p>
            <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-medium ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              theme === 'system'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-medium ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`}>System</span>
          </button>
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
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
        className="w-full h-14 rounded-2xl text-base font-semibold border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all bg-transparent active:scale-[0.98]"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </Button>

      {/* App Version */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        MadrasOne v1.0.0
      </p>
    </div>
  )
}
