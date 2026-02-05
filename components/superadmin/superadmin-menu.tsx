'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react'
import { cn, getCategoryName } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'
import type { FoodItem } from '@/lib/types'

export function SuperAdminMenu() {
  const { foodItems, shops, updateFoodItem, addFoodItem, deleteFoodItem, toggleFoodAvailability } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShop, setSelectedShop] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)

  // Default to MEC CANTEEN if it exists
  useEffect(() => {
    if (shops.length > 0 && selectedShop === 'all') {
      const mecCanteen = shops.find(shop =>
        shop.name.toLowerCase().includes('mec') && shop.name.toLowerCase().includes('canteen')
      )
      if (mecCanteen) {
        setSelectedShop(mecCanteen.id)
      }
    }
  }, [shops, selectedShop])

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesShop = selectedShop === 'all' || item.shopId === selectedShop
    return matchesSearch && matchesShop
  })

  const categories = [...new Set(foodItems.map(item => getCategoryName(item.category as string | { name?: string })))]

  const handleSaveItem = (item: FoodItem) => {
    if (editingItem) {
      updateFoodItem(item)
    } else {
      addFoodItem({ ...item, id: `item-${Date.now()}` })
    }
    setEditingItem(null)
    setShowAddModal(false)
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteFoodItem(itemId)
    }
  }

  // Get selected shop name for display
  const selectedShopName = selectedShop === 'all'
    ? 'All Shops'
    : shops.find(s => s.id === selectedShop)?.name || 'Unknown Shop'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Menu Management</h2>
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} items in {selectedShopName}
            {selectedShop !== 'all' && ` (${foodItems.length} total)`}
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowAddModal(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={selectedShop}
          onChange={(e) => setSelectedShop(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Shops</option>
          {shops.map(shop => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <FoodImage
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {getCategoryName(item.category as string | { name?: string })}
                </span>
                {!item.isAvailable && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                    Unavailable
                  </span>
                )}
              </div>
              <p className="text-sm text-primary font-medium">
                {item.shopName || shops.find(s => s.id === item.shopId)?.name || 'No Shop Assigned'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-foreground font-medium">Rs. {item.price}</span>
                {item.costPrice && (
                  <span className="text-xs text-muted-foreground">Cost: Rs. {item.costPrice}</span>
                )}
                {item.costPrice && (
                  <span className="text-xs text-primary">Profit: Rs. {item.price - item.costPrice}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFoodAvailability(item.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  item.isAvailable 
                    ? "bg-primary/10 text-primary" 
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </button>
              <button
                onClick={() => { setEditingItem(item); setShowAddModal(true) }}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <MenuItemModal
          item={editingItem}
          shops={shops}
          categories={categories}
          onSave={handleSaveItem}
          onClose={() => { setShowAddModal(false); setEditingItem(null) }}
        />
      )}
    </div>
  )
}

function MenuItemModal({ 
  item, 
  shops, 
  categories, 
  onSave, 
  onClose 
}: { 
  item: FoodItem | null
  shops: { id: string; name: string }[]
  categories: string[]
  onSave: (item: FoodItem) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState<Partial<FoodItem>>(item || {
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    category: categories[0] || 'Snacks',
    shopId: shops[0]?.id || '',
    shopName: shops[0]?.name || '',
    image: '',
    isAvailable: true,
    rating: 0,
    preparationTime: ''
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validate required fields
    if (!formData.shopId || !formData.shopName) {
      setValidationError('Please select a shop')
      return
    }
    if (!formData.preparationTime) {
      setValidationError('Please enter preparation time')
      return
    }

    onSave(formData as FoodItem)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {item ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {validationError}
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Price (Rs.)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cost Price (Rs.)</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Shop</label>
              <select
                value={formData.shopId}
                onChange={(e) => {
                  const shop = shops.find(s => s.id === e.target.value)
                  setFormData({ ...formData, shopId: e.target.value, shopName: shop?.name || '' })
                }}
                className="w-full mt-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
              >
                <option value="">Select a shop</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Image URL</label>
            <div className="flex gap-3 mt-1">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
                placeholder="Enter image URL (optional)"
              />
              <FoodImage
                src={formData.image}
                alt={formData.name || 'Preview'}
                className="w-12 h-12 rounded-xl flex-shrink-0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Preparation Time</label>
            <input
              type="text"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
              placeholder="e.g., 15 min"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {item ? 'Update' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
