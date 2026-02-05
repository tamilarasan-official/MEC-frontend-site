'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  User,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getUsers,
  getShops,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  type SuperadminUser,
  type UsersQueryParams,
  type Shop,
} from '@/lib/services/superadmin-api'

const ROLES = [
  { value: 'student', label: 'Student', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'captain', label: 'Captain', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'owner', label: 'Shop Owner', color: 'bg-orange-500/10 text-orange-500' },
  { value: 'accountant', label: 'Accountant', color: 'bg-emerald-500/10 text-emerald-500' },
  { value: 'superadmin', label: 'Super Admin', color: 'bg-red-500/10 text-red-500' },
]

const DEPARTMENTS = [
  'CSE',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'IT',
  'AIDS',
  'AIML',
  'Other',
]

export function SuperAdminUsers() {
  const [users, setUsers] = useState<SuperadminUser[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  // Modal states
  const [selectedUser, setSelectedUser] = useState<SuperadminUser | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [newShopId, setNewShopId] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: UsersQueryParams = {
        page,
        limit,
      }

      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (departmentFilter) params.department = departmentFilter
      if (statusFilter === 'active') params.isActive = true
      if (statusFilter === 'inactive') params.isActive = false
      if (statusFilter === 'approved') params.isApproved = true
      if (statusFilter === 'pending') params.isApproved = false

      const result = await getUsers(params)

      if (result.success && result.data) {
        setUsers(result.data.users)
        setTotalPages(result.data.pagination.totalPages)
        setTotal(result.data.pagination.total)
      } else {
        setError(result.error || 'Failed to load users')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Users fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, departmentFilter, statusFilter])

  const fetchShops = async () => {
    const result = await getShops()
    if (result.success && result.data) {
      setShops(result.data)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchShops()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return

    setActionLoading(selectedUser.id)
    try {
      const result = await updateUserRole(
        selectedUser.id,
        newRole,
        newRole === 'owner' ? newShopId : undefined
      )

      if (result.success) {
        await fetchUsers()
        setShowRoleModal(false)
        setSelectedUser(null)
        setNewRole('')
        setNewShopId('')
      } else {
        alert(result.error || 'Failed to update role')
      }
    } catch (err) {
      alert('An error occurred while updating role')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (user: SuperadminUser) => {
    setActionLoading(user.id)
    try {
      const result = user.isActive
        ? await deactivateUser(user.id)
        : await reactivateUser(user.id)

      if (result.success) {
        await fetchUsers()
      } else {
        alert(result.error || 'Failed to update user status')
      }
    } catch (err) {
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const openRoleModal = (user: SuperadminUser) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setNewShopId(user.shopId || '')
    setShowRoleModal(true)
  }

  const getRoleStyle = (role: string) => {
    return ROLES.find((r) => r.value === role)?.color || 'bg-muted text-muted-foreground'
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('')
    setDepartmentFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const hasActiveFilters = search || roleFilter || departmentFilter || statusFilter

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Failed to Load Users</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">User Management</h2>
        <p className="text-sm text-muted-foreground">{total} users total</p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-2',
              showFilters || hasActiveFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-card border border-border space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                >
                  <option value="">All Roles</option>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}

        {users.map((user) => (
          <div
            key={user.id}
            className={cn(
              'p-4 rounded-2xl bg-card border border-border',
              !user.isActive && 'opacity-60'
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                  user.isActive
                    ? 'bg-gradient-to-br from-primary to-blue-600 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {user.name?.charAt(0) || 'U'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', getRoleStyle(user.role))}>
                    {ROLES.find((r) => r.value === user.role)?.label || user.role}
                  </span>
                  {!user.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      Inactive
                    </span>
                  )}
                  {!user.isApproved && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  {user.rollNumber && <span>Roll: {user.rollNumber}</span>}
                  {user.department && <span>{user.department}</span>}
                  {user.year && <span>Year {user.year}</span>}
                  {user.balance !== undefined && (
                    <span className="text-primary font-medium">Rs. {user.balance}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Change Role */}
                <button
                  onClick={() => openRoleModal(user)}
                  disabled={actionLoading === user.id}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  title="Change Role"
                >
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Toggle Active */}
                <button
                  onClick={() => handleToggleActive(user)}
                  disabled={actionLoading === user.id}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    user.isActive
                      ? 'bg-destructive/10 hover:bg-destructive/20'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20'
                  )}
                  title={user.isActive ? 'Deactivate User' : 'Reactivate User'}
                >
                  {actionLoading === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : user.isActive ? (
                    <UserX className="w-4 h-4 text-destructive" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-lg bg-card border border-border disabled:opacity-50 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-lg bg-card border border-border disabled:opacity-50 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Change User Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedUser(null)
                }}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">User</p>
                <p className="font-medium text-foreground">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {newRole === 'owner' && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Assign to Shop
                  </label>
                  <select
                    value={newShopId}
                    onChange={(e) => setNewShopId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground"
                  >
                    <option value="">Select a shop</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleUpdate}
                  disabled={actionLoading === selectedUser.id || (newRole === 'owner' && !newShopId)}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === selectedUser.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Update Role
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
