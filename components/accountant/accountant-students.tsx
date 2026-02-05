'use client'

import { useState, useMemo } from 'react'
import { Search, User, Wallet, Loader2, AlertCircle, RefreshCw, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAccountant } from '@/lib/accountant-context'

export function AccountantStudents() {
  const {
    students,
    isLoadingStudents,
    studentsError,
    refreshStudents,
    stats
  } = useAccountant()

  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Ensure students is an array
  const studentList = students || []

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(studentList.map(s => s.department).filter(Boolean))
    return Array.from(depts).sort()
  }, [studentList])

  // Filter students based on search and department
  const filteredStudents = useMemo(() => {
    return studentList.filter(s => {
      const matchesSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())

      const matchesDepartment = !departmentFilter || s.department === departmentFilter

      return matchesSearch && matchesDepartment
    })
  }, [studentList, search, departmentFilter])

  // Calculate stats for filtered results
  const filteredBalance = useMemo(() => {
    return filteredStudents.reduce((sum, s) => sum + (s.balance || 0), 0)
  }, [filteredStudents])

  const clearFilters = () => {
    setSearch('')
    setDepartmentFilter('')
  }

  // Loading state
  if (isLoadingStudents && studentList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    )
  }

  // Error state
  if (studentsError && studentList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load</h3>
        <p className="text-muted-foreground mb-4">{studentsError}</p>
        <Button onClick={refreshStudents} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {studentsError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{studentsError}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-card border-border"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            className="h-12 w-12"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            onClick={refreshStudents}
            disabled={isLoadingStudents}
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingStudents ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="flex gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-200">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-10 px-3 rounded-lg bg-card border border-border text-foreground text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {(search || departmentFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
        <div>
          <p className="text-sm text-muted-foreground">Showing</p>
          <p className="font-semibold text-foreground">
            {filteredStudents.length} of {stats.totalStudents} students
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {search || departmentFilter ? 'Filtered Balance' : 'Total Balance'}
          </p>
          <p className="font-semibold text-primary">
            Rs. {(search || departmentFilter ? filteredBalance : stats.totalBalance).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {search || departmentFilter ? 'No students match your filters' : 'No students found'}
            </p>
            {(search || departmentFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:border-primary/20"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{student.name}</h4>
                <p className="text-sm text-muted-foreground">{student.rollNumber || 'No roll number'}</p>
                <p className="text-xs text-muted-foreground">{student.department || 'No department'}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Wallet className="w-4 h-4" />
                  <span className="font-semibold">Rs. {(student.balance || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {student.email}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
