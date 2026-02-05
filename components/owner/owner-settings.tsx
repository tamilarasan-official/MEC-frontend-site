'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'
import {
  User,
  Bell,
  LogOut,
  ChevronRight,
  Store,
  UserPlus,
  Users,
  X,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  createCaptain,
  getCaptains,
  removeCaptain,
  type Captain,
  type CreateCaptainData
} from '@/lib/services/owner-api'

export function OwnerSettings() {
  const { user, setUser } = useApp()
  const router = useRouter()

  // Captains state
  const [captains, setCaptains] = useState<Captain[]>([])
  const [loadingCaptains, setLoadingCaptains] = useState(true)
  const [captainsError, setCaptainsError] = useState<string | null>(null)

  // Modal state
  const [showAddCaptain, setShowAddCaptain] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form data
  const [captainForm, setCaptainForm] = useState<CreateCaptainData>({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Action loading
  const [removingCaptainId, setRemovingCaptainId] = useState<string | null>(null)

  // Fetch captains
  const fetchCaptains = useCallback(async () => {
    setLoadingCaptains(true)
    setCaptainsError(null)
    try {
      const result = await getCaptains()
      if (result.success && result.data) {
        setCaptains(result.data)
      } else {
        setCaptainsError(result.error || 'Failed to load captains')
      }
    } catch (err) {
      setCaptainsError('An unexpected error occurred')
      console.error('Fetch captains error:', err)
    } finally {
      setLoadingCaptains(false)
    }
  }, [])

  useEffect(() => {
    fetchCaptains()
  }, [fetchCaptains])

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleLogout = () => {
    setUser(null)
    router.push('/')
  }

  const resetForm = () => {
    setCaptainForm({ name: '', email: '', password: '', phone: '' })
    setFormError(null)
    setShowPassword(false)
  }

  const openAddCaptainModal = () => {
    resetForm()
    setShowAddCaptain(true)
  }

  const closeAddCaptainModal = () => {
    setShowAddCaptain(false)
    resetForm()
  }

  const handleAddCaptain = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    // Validate
    if (!captainForm.name.trim()) {
      setFormError('Captain name is required')
      setFormLoading(false)
      return
    }
    if (!captainForm.email.trim()) {
      setFormError('Email is required')
      setFormLoading(false)
      return
    }
    if (!captainForm.password) {
      setFormError('Password is required')
      setFormLoading(false)
      return
    }
    if (captainForm.password.length < 8) {
      setFormError('Password must be at least 8 characters')
      setFormLoading(false)
      return
    }
    if (!/[A-Z]/.test(captainForm.password)) {
      setFormError('Password must contain at least one uppercase letter')
      setFormLoading(false)
      return
    }
    if (!/[a-z]/.test(captainForm.password)) {
      setFormError('Password must contain at least one lowercase letter')
      setFormLoading(false)
      return
    }
    if (!/[0-9]/.test(captainForm.password)) {
      setFormError('Password must contain at least one number')
      setFormLoading(false)
      return
    }

    try {
      const result = await createCaptain({
        name: captainForm.name.trim(),
        email: captainForm.email.trim(),
        password: captainForm.password,
        phone: captainForm.phone?.trim() || undefined,
      })

      if (result.success && result.data) {
        await fetchCaptains()
        setSuccessMessage(`Captain "${result.data.name}" added successfully`)
        closeAddCaptainModal()
      } else {
        setFormError(result.error || 'Failed to add captain')
      }
    } catch (err) {
      setFormError('An unexpected error occurred')
      console.error('Add captain error:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleRemoveCaptain = async (captain: Captain) => {
    if (!confirm(`Are you sure you want to remove ${captain.name}?`)) return

    setRemovingCaptainId(captain.id)
    try {
      const result = await removeCaptain(captain.id)
      if (result.success) {
        await fetchCaptains()
        setSuccessMessage(`Captain "${captain.name}" removed`)
      } else {
        setCaptainsError(result.error || 'Failed to remove captain')
      }
    } catch (err) {
      setCaptainsError('An unexpected error occurred')
      console.error('Remove captain error:', err)
    } finally {
      setRemovingCaptainId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

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

      {/* Captain Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Shop Captains</h3>
            <p className="text-sm text-muted-foreground">Manage staff who can handle orders</p>
          </div>
          <button
            onClick={openAddCaptainModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Captain
          </button>
        </div>

        {/* Captains List */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {loadingCaptains ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : captainsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <AlertCircle className="w-10 h-10 text-destructive mb-3" />
              <p className="text-sm text-destructive">{captainsError}</p>
              <button
                onClick={fetchCaptains}
                className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          ) : captains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Users className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-foreground font-medium">No Captains Yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add captains to help manage orders</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {captains.map((captain) => (
                <div
                  key={captain.id}
                  className={cn(
                    "flex items-center justify-between p-4",
                    !captain.isActive && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{captain.name}</p>
                      <p className="text-sm text-muted-foreground">{captain.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCaptain(captain)}
                    disabled={removingCaptainId === captain.id}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    title="Remove captain"
                  >
                    {removingCaptainId === captain.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-2">
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

      {/* Add Captain Modal */}
      {showAddCaptain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add New Captain</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Create a captain account</p>
              </div>
              <button
                onClick={closeAddCaptainModal}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddCaptain} className="p-6 space-y-4">
              {/* Captain Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={captainForm.name}
                    onChange={(e) => setCaptainForm({ ...captainForm, name: e.target.value })}
                    placeholder="Enter captain's name"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Captain Email */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={captainForm.email}
                    onChange={(e) => setCaptainForm({ ...captainForm, email: e.target.value })}
                    placeholder="captain@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">This will be used for login</p>
              </div>

              {/* Captain Password */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={captainForm.password}
                    onChange={(e) => setCaptainForm({ ...captainForm, password: e.target.value })}
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Min 8 chars, include uppercase, lowercase & number</p>
              </div>

              {/* Captain Phone */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={captainForm.phone}
                    onChange={(e) => setCaptainForm({ ...captainForm, phone: e.target.value })}
                    placeholder="10-digit mobile number (optional)"
                    pattern="[6-9][0-9]{9}"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Form Error */}
              {formError && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{formError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddCaptainModal}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add Captain
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
