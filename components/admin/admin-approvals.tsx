'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { Check, X, User, Mail, Phone, GraduationCap, Calendar, Building2, Clock, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AdminApprovals() {
  const { pendingStudents, approveStudent, rejectStudent } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filteredStudents = pendingStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleApprove = async (studentId: string) => {
    setProcessingId(studentId)
    await new Promise(resolve => setTimeout(resolve, 500))
    approveStudent(studentId)
    setProcessingId(null)
  }

  const handleReject = async (studentId: string) => {
    setProcessingId(studentId)
    await new Promise(resolve => setTimeout(resolve, 500))
    rejectStudent(studentId)
    setProcessingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
        <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
          {pendingStudents.length} pending
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, reg no, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary border-border text-foreground"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {pendingStudents.length === 0 
              ? 'No pending approvals' 
              : 'No matching students found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-card rounded-xl border border-border p-4 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{student.name}</h3>
                    <p className="text-sm text-primary font-medium">{student.rollNumber}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md bg-warning/10 text-warning text-xs font-medium">
                  Pending
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{student.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span>Batch {student.year}</span>
                </div>
              </div>

              {/* Applied date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <Calendar className="w-3 h-3" />
                <span>Applied: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Just now'}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <Button
                  onClick={() => handleReject(student.id)}
                  disabled={processingId === student.id}
                  variant="outline"
                  className="flex-1 h-14 text-base font-semibold border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-all"
                >
                  <X className="w-5 h-5 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(student.id)}
                  disabled={processingId === student.id}
                  className="flex-[2] h-14 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                >
                  {processingId === student.id ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
