'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Search, Users, IndianRupee, Calendar, Bell,
  CheckCircle2, XCircle, Clock, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Filter, X, Eye
} from 'lucide-react'
import {
  getPaymentRequests,
  createPaymentRequest,
  closePaymentRequest,
  getStudentsForPaymentRequest,
  sendPaymentReminders,
  type CreatePaymentRequestData,
  type StudentsResponse
} from '@/lib/services/adhoc-payments-api'
import { getUsers, type SuperadminUser } from '@/lib/services/superadmin-api'
import type { PaymentRequest, StudentPaymentStatus } from '@/lib/types'

type ViewMode = 'list' | 'create' | 'details'

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'OTHER'] as const
const YEARS = [1, 2, 3, 4] as const

export function SuperAdminPayments() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('active')
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)

  // Create form state
  const [formData, setFormData] = useState<CreatePaymentRequestData>({
    title: '',
    description: '',
    amount: 0,
    targetType: 'all',
    targetStudents: [],
    targetDepartment: undefined,
    targetYear: undefined,
    dueDate: undefined,
    isVisibleOnDashboard: true,
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Student selection for 'selected' target type
  const [students, setStudents] = useState<SuperadminUser[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Details view state
  const [detailsStudents, setDetailsStudents] = useState<StudentPaymentStatus[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsFilter, setDetailsFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [sendingReminders, setSendingReminders] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)

    const result = await getPaymentRequests({
      status: statusFilter === 'all' ? undefined : statusFilter,
    })

    if (result.success && result.data) {
      setRequests(result.data.requests)
    } else {
      setError(result.error || 'Failed to load payment requests')
    }
    setLoading(false)
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    const result = await getUsers({ role: 'student', isApproved: true, isActive: true, limit: 100 })
    if (result.success && result.data && result.data.users) {
      setStudents(result.data.users)
    } else {
      setStudents([])
    }
    setLoadingStudents(false)
  }

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)

    const data: CreatePaymentRequestData = {
      ...formData,
      targetStudents: formData.targetType === 'selected' ? selectedStudentIds : undefined,
    }

    const result = await createPaymentRequest(data)

    if (result.success) {
      setViewMode('list')
      resetForm()
      fetchRequests()
    } else {
      setCreateError(result.error || 'Failed to create payment request')
    }
    setCreating(false)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      targetType: 'all',
      targetStudents: [],
      targetDepartment: undefined,
      targetYear: undefined,
      dueDate: undefined,
      isVisibleOnDashboard: true,
    })
    setSelectedStudentIds([])
    setCreateError(null)
  }

  const handleViewDetails = async (request: PaymentRequest) => {
    setSelectedRequest(request)
    setViewMode('details')
    setDetailsLoading(true)

    const result = await getStudentsForPaymentRequest(request.id, { status: 'all' })
    if (result.success && result.data) {
      setDetailsStudents(result.data.students)
    }
    setDetailsLoading(false)
  }

  const handleCloseRequest = async (status: 'closed' | 'cancelled') => {
    if (!selectedRequest) return

    const result = await closePaymentRequest(selectedRequest.id, status)
    if (result.success) {
      setViewMode('list')
      setSelectedRequest(null)
      fetchRequests()
    }
  }

  const handleSendReminders = async () => {
    if (!selectedRequest) return

    setSendingReminders(true)
    const result = await sendPaymentReminders(selectedRequest.id)
    if (result.success) {
      alert(`Reminders sent to ${result.count} students`)
    } else {
      alert(result.error || 'Failed to send reminders')
    }
    setSendingReminders(false)
  }

  const filteredStudents = (students || []).filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const filteredDetailsStudents = (detailsStudents || []).filter(s =>
    detailsFilter === 'all' || s.status === detailsFilter
  )

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Payment Requests</h2>
            <p className="text-sm text-muted-foreground mt-1">Collect fees from students</p>
          </div>
          <button
            onClick={() => {
              setViewMode('create')
              fetchStudents()
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['active', 'closed', 'all'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive">{error}</p>
            <button onClick={fetchRequests} className="mt-3 text-primary hover:underline">
              Try again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-card border border-border">
            <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No payment requests found</p>
            <button
              onClick={() => {
                setViewMode('create')
                fetchStudents()
              }}
              className="mt-4 text-primary hover:underline"
            >
              Create your first payment request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(request => (
              <button
                key={request.id}
                onClick={() => handleViewDetails(request)}
                className="w-full p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{request.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'active' ? 'bg-primary/10 text-primary' :
                        request.status === 'closed' ? 'bg-muted text-muted-foreground' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{request.description}</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">Rs.{request.amount}</p>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{request.paidCount} paid</span>
                    <span>{request.totalTargetCount} total</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${request.totalTargetCount > 0 ? (request.paidCount / request.totalTargetCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Collected: <span className="font-semibold text-foreground">Rs.{request.totalCollected}</span>
                  </span>
                  {request.dueDate && (
                    <span className="text-orange-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(request.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Create View
  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setViewMode('list')
              resetForm()
            }}
            className="p-2 rounded-xl hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Create Payment Request</h2>
            <p className="text-sm text-muted-foreground mt-1">Collect fees from students</p>
          </div>
        </div>

        {createError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {createError}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Exam Fee - Semester 1"
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Description *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this payment..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Amount (Rs.) *</label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={e => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              placeholder="0"
              min="1"
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Target Type */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Target Students *</label>
            <div className="grid grid-cols-2 gap-2">
              {(['all', 'department', 'year', 'selected'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFormData(prev => ({ ...prev, targetType: type }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    formData.targetType === type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {type === 'all' && 'All Students'}
                  {type === 'department' && 'By Department'}
                  {type === 'year' && 'By Year'}
                  {type === 'selected' && 'Select Students'}
                </button>
              ))}
            </div>
          </div>

          {/* Department selector */}
          {formData.targetType === 'department' && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Department *</label>
              <select
                value={formData.targetDepartment || ''}
                onChange={e => setFormData(prev => ({ ...prev, targetDepartment: e.target.value as typeof DEPARTMENTS[number] }))}
                className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}

          {/* Year selector */}
          {formData.targetType === 'year' && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Year *</label>
              <div className="grid grid-cols-4 gap-2">
                {YEARS.map(year => (
                  <button
                    key={year}
                    onClick={() => setFormData(prev => ({ ...prev, targetYear: year }))}
                    className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                      formData.targetYear === year
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    Year {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student selector */}
          {formData.targetType === 'selected' && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Students * ({selectedStudentIds.length} selected)
              </label>
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search by name, roll number, or email..."
                className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
              />
              {loadingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
                  {filteredStudents.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedStudentIds(prev => [...prev, student.id])
                          } else {
                            setSelectedStudentIds(prev => prev.filter(id => id !== student.id))
                          }
                        }}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.rollNumber} • {student.department}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Due Date (Optional)</label>
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value || undefined }))}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Visibility Toggle */}
          <label className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isVisibleOnDashboard}
              onChange={e => setFormData(prev => ({ ...prev, isVisibleOnDashboard: e.target.checked }))}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Show on Student Dashboard</p>
              <p className="text-xs text-muted-foreground">Display this payment request on student home screen</p>
            </div>
          </label>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={creating || !formData.title || !formData.description || !formData.amount ||
              (formData.targetType === 'selected' && selectedStudentIds.length === 0) ||
              (formData.targetType === 'department' && !formData.targetDepartment) ||
              (formData.targetType === 'year' && !formData.targetYear)
            }
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Payment Request
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Details View
  if (viewMode === 'details' && selectedRequest) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setViewMode('list')
              setSelectedRequest(null)
            }}
            className="p-2 rounded-xl hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{selectedRequest.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedRequest.status === 'active' ? 'bg-primary/10 text-primary' :
            selectedRequest.status === 'closed' ? 'bg-muted text-muted-foreground' :
            'bg-destructive/10 text-destructive'
          }`}>
            {selectedRequest.status}
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-xl font-bold text-foreground">Rs.{selectedRequest.amount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-xl font-bold text-foreground">Rs.{selectedRequest.totalCollected}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-xl font-bold text-foreground">{selectedRequest.paidCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-foreground">{selectedRequest.totalTargetCount - selectedRequest.paidCount}</p>
          </div>
        </div>

        {/* Actions */}
        {selectedRequest.status === 'active' && (
          <div className="flex gap-3">
            <button
              onClick={handleSendReminders}
              disabled={sendingReminders}
              className="flex-1 h-11 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sendingReminders ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              Send Reminders
            </button>
            <button
              onClick={() => handleCloseRequest('closed')}
              className="flex-1 h-11 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Close Request
            </button>
          </div>
        )}

        {/* Student Filter */}
        <div className="flex gap-2">
          {(['all', 'paid', 'pending'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setDetailsFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                detailsFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Students List */}
        {detailsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDetailsStudents.map(student => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.rollNumber} • {student.department}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">Rs.{student.amount}</span>
                  {student.status === 'paid' ? (
                    <span className="flex items-center gap-1 text-primary text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-500 text-sm">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filteredDetailsStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return null
}
