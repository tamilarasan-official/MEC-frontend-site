'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/context'
import {
  Store,
  UtensilsCrossed,
  Shirt,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Power,
  X,
  Loader2,
  AlertCircle,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createShop,
  updateShop,
  toggleShopStatus,
  getShops,
  type Shop,
  type ShopCreateData,
  type ShopUpdateData,
} from '@/lib/services/superadmin-api'

const shopIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  canteen: UtensilsCrossed,
  laundry: Shirt,
  xerox: FileText,
  other: Store,
}

const SHOP_CATEGORIES = [
  { value: 'canteen', label: 'Canteen', icon: UtensilsCrossed, description: 'Food & Beverages' },
  { value: 'laundry', label: 'Laundry', icon: Shirt, description: 'Washing & Ironing' },
  { value: 'xerox', label: 'Xerox', icon: FileText, description: 'Printing & Copies' },
  { value: 'other', label: 'Other', icon: Store, description: 'Other Services' },
] as const

type ShopCategory = 'canteen' | 'laundry' | 'xerox' | 'other'

interface ShopFormData {
  name: string
  description: string
  category: ShopCategory
  contactPhone: string
}

const initialFormData: ShopFormData = {
  name: '',
  description: '',
  category: 'canteen',
  contactPhone: '',
}

export function SuperAdminShops() {
  const { shops: contextShops, foodItems, orders, fetchShops: refreshContextShops } = useApp()

  // Local state for shops
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [formData, setFormData] = useState<ShopFormData>(initialFormData)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Action loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch shops from API
  const fetchShops = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getShops()
      if (result.success && result.data) {
        setShops(result.data)
      } else {
        setError(result.error || 'Failed to fetch shops')
        // Fallback to context shops
        if (contextShops.length > 0) {
          setShops(contextShops.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category as ShopCategory,
            isActive: s.isActive,
          })))
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Shops fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [contextShops])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Open create modal
  const openCreateModal = () => {
    setEditingShop(null)
    setFormData(initialFormData)
    setFormError(null)
    setShowModal(true)
  }

  // Open edit modal
  const openEditModal = (shop: Shop) => {
    setEditingShop(shop)
    setFormData({
      name: shop.name,
      description: shop.description || '',
      category: shop.category,
      contactPhone: '',
    })
    setFormError(null)
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setEditingShop(null)
    setFormData(initialFormData)
    setFormError(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    // Validate form
    if (!formData.name.trim()) {
      setFormError('Shop name is required')
      setFormLoading(false)
      return
    }

    if (formData.name.trim().length < 2) {
      setFormError('Shop name must be at least 2 characters')
      setFormLoading(false)
      return
    }

    try {
      if (editingShop) {
        // Update existing shop
        const updateData: ShopUpdateData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
        }

        const result = await updateShop(editingShop.id, updateData)

        if (result.success) {
          await fetchShops()
          if (refreshContextShops) refreshContextShops()
          setSuccessMessage(`Shop "${formData.name}" updated successfully`)
          closeModal()
        } else {
          setFormError(result.error || 'Failed to update shop')
        }
      } else {
        // Create new shop
        const createData: ShopCreateData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
        }

        const result = await createShop(createData)

        if (result.success) {
          await fetchShops()
          if (refreshContextShops) refreshContextShops()
          setSuccessMessage(`Shop "${formData.name}" created successfully`)
          closeModal()
        } else {
          setFormError(result.error || 'Failed to create shop')
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred')
      console.error('Form submit error:', err)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle toggle shop status
  const handleToggleStatus = async (shop: Shop) => {
    setActionLoading(shop.id)
    try {
      const result = await toggleShopStatus(shop.id)

      if (result.success) {
        await fetchShops()
        if (refreshContextShops) refreshContextShops()
        setSuccessMessage(`Shop "${shop.name}" ${shop.isActive ? 'deactivated' : 'activated'} successfully`)
      } else {
        setError(result.error || 'Failed to toggle shop status')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Toggle status error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Render loading content
  const renderLoadingContent = () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading shops...</p>
      </div>
    </div>
  )

  // Render error content
  const renderErrorContent = () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3 text-center p-6">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h3 className="text-lg font-semibold text-foreground">Failed to Load Shops</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
        <button
          onClick={fetchShops}
          className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

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

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Shop Management</h2>
          <p className="text-sm text-muted-foreground">
            {shops.length} shop{shops.length !== 1 ? 's' : ''} • {shops.filter(s => s.isActive).length} active
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Store
        </button>
      </div>

      {/* Shops List */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && shops.length === 0 && renderLoadingContent()}

        {/* Error State */}
        {error && shops.length === 0 && !loading && renderErrorContent()}

        {/* Empty State - only show if not loading and no error */}
        {!loading && !error && shops.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Shops Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first shop to start managing your campus services
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Store
            </button>
          </div>
        )}

        {shops.map(shop => {
          const Icon = shopIcons[shop.category] || Store
          const shopItems = foodItems.filter(item => item.shopId === shop.id)
          const shopOrders = orders.filter(order => order.shopId === shop.id)
          const todayOrders = shopOrders.filter(o =>
            new Date(o.createdAt).toDateString() === new Date().toDateString()
          )
          const categoryInfo = SHOP_CATEGORIES.find(c => c.value === shop.category)

          return (
            <div
              key={shop.id}
              className={cn(
                "p-5 rounded-2xl bg-card border transition-all",
                shop.isActive ? "border-border" : "border-border/50 opacity-75"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                  shop.isActive ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-7 h-7",
                    shop.isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">{shop.name}</h3>
                    {shop.isActive ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {categoryInfo?.label || shop.category}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {shop.description || 'No description provided'}
                  </p>

                  {/* Stats - Only show for active shops */}
                  {shop.isActive && (
                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{shopItems.length}</p>
                        <p className="text-xs text-muted-foreground">Menu Items</p>
                      </div>
                      <div className="w-px h-10 bg-border" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{todayOrders.length}</p>
                        <p className="text-xs text-muted-foreground">Orders Today</p>
                      </div>
                      <div className="w-px h-10 bg-border" />
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          Rs. {todayOrders.reduce((sum, o) => sum + o.total, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Revenue Today</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(shop)}
                    className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    title="Edit Shop"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* Toggle Status Button */}
                  <button
                    onClick={() => handleToggleStatus(shop)}
                    disabled={actionLoading === shop.id}
                    className={cn(
                      'p-2.5 rounded-xl transition-colors',
                      shop.isActive
                        ? 'bg-orange-500/10 hover:bg-orange-500/20'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20'
                    )}
                    title={shop.isActive ? 'Deactivate Shop' : 'Activate Shop'}
                  >
                    {actionLoading === shop.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Power className={cn(
                        'w-4 h-4',
                        shop.isActive ? 'text-orange-600' : 'text-emerald-600'
                      )} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingShop ? 'Edit Shop' : 'Create New Store'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editingShop ? 'Update shop details' : 'Add a new shop to your campus'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Shop Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Shop Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter shop name"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Category <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SHOP_CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon
                    const isSelected = formData.category === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/50'
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isSelected ? "bg-primary/10" : "bg-muted"
                        )}>
                          <CatIcon className={cn(
                            "w-5 h-5",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {cat.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this shop offers (optional)"
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.description.length}/500
                </p>
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
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !formData.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingShop ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingShop ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Update Shop
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Store
                        </>
                      )}
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
