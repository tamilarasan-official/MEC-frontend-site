'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Layers, Eye, EyeOff, ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/lib/context'
import { authService } from '@/lib/auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML']
const years = [
  { label: '1st Year', value: 1 },
  { label: '2nd Year', value: 2 },
  { label: '3rd Year', value: 3 },
  { label: '4th Year', value: 4 },
]

export default function Home() {
  const [mode, setMode] = useState<'login' | 'signup' | 'pending'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Signup fields
  const [name, setName] = useState('')
  const [regNo, setRegNo] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const { login, isLoading: contextLoading } = useApp()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(username, password)

      if (result.success) {
        // Get user from localStorage to determine role
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          router.push(`/dashboard/${user.role}`)
        }
      } else {
        // Check for specific error codes
        if (result.error?.includes('pending approval') || result.error?.includes('ACCOUNT_NOT_APPROVED')) {
          setMode('pending')
        } else {
          setError(result.error || 'Invalid username or password')
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate username (derived from roll number)
    const generatedUsername = regNo.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (generatedUsername.length < 4) {
      setError('Roll number must result in at least 4 valid characters (letters, numbers, underscores)')
      return
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(signupPassword)) {
      setError('Password must contain at least one uppercase letter')
      return
    }

    if (!/[a-z]/.test(signupPassword)) {
      setError('Password must contain at least one lowercase letter')
      return
    }

    if (!/[0-9]/.test(signupPassword)) {
      setError('Password must contain at least one number')
      return
    }

    // Validate phone number (Indian mobile numbers start with 6-9)
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)')
      return
    }

    if (!department || !year) {
      setError('Please select department and year')
      return
    }

    setIsLoading(true)

    try {
      const result = await authService.register({
        username: regNo.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        password: signupPassword,
        name,
        email,
        phone,
        rollNumber: regNo,
        department,
        year: parseInt(year),
      })

      if (result.success) {
        setMode('pending')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === 'pending') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Waiting for Approval</h1>
          <p className="text-muted-foreground mb-8">
            Your registration is pending approval from the admin. You will be able to login once approved.
          </p>
          <Button
            onClick={() => {
              setMode('login')
              setUsername('')
              setPassword('')
            }}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-8 px-6 text-center">
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 mb-5 shadow-lg shadow-primary/20">
          <Layers className="w-10 h-10 text-primary-foreground" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">MadrasOne</h1>
        <p className="text-muted-foreground text-sm mt-2">Your campus, one tap away</p>
      </header>

      {/* Form */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-sm mx-auto">
          {mode === 'login' ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
                <p className="text-muted-foreground text-sm mt-1">Sign in to continue to your account</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">Username or Email</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-card border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl px-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl px-4 pr-14 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-10 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground">New to MadrasOne?</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setMode('signup')}
                  className="w-full mt-6 h-14 rounded-2xl text-base font-medium border-border hover:bg-card hover:border-primary/50 transition-all"
                >
                  Create an Account
                </Button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode('login')}
                className="mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
              
              <h2 className="text-lg font-semibold text-foreground mb-6">Student Registration</h2>
              
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regNo" className="text-foreground">MEC Registration No</Label>
                  <Input
                    id="regNo"
                    type="text"
                    placeholder="e.g., MEC2024001"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Department</Label>
                    <Select value={department} onValueChange={setDepartment} required>
                      <SelectTrigger className="bg-secondary border-border text-foreground h-12">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept} className="text-foreground">{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Year of Study</Label>
                    <Select value={year} onValueChange={setYear} required>
                      <SelectTrigger className="bg-secondary border-border text-foreground h-12">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {years.map(y => (
                          <SelectItem key={y.value} value={y.value.toString()} className="text-foreground">{y.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-foreground">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !department || !year}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Registering...
                    </div>
                  ) : (
                    <>
                      Register
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          MadrasOne - Madras Engineering College
        </p>
      </footer>
    </div>
  )
}
