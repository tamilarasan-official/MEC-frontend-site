'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context'
import { Search, User, Mail, Building2, Wallet, MoreVertical } from 'lucide-react'

export function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState('')
  const { students } = useApp()

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Manage Students</h2>
        <p className="text-sm text-muted-foreground">View and manage student accounts</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <p className="text-2xl font-bold text-primary">{students.filter(s => (s.balance || 0) > 100).length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <p className="text-2xl font-bold text-amber-500">{students.filter(s => (s.balance || 0) < 100).length}</p>
          <p className="text-xs text-muted-foreground">Low Balance</p>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((student, index) => (
          <div
            key={student.id}
            className="p-4 rounded-2xl bg-card border border-border animate-float-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{student.email.split('@')[0]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{student.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Wallet className="w-4 h-4" />
                <span>Rs. {student.balance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
