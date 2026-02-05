'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { studentApi, LeaderboardEntry } from '@/lib/studentApi'
import { Trophy, Medal, Crown, Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const rankIcons = [Crown, Medal, Medal]
const rankColors = ['text-yellow-400', 'text-slate-400', 'text-amber-600']

export function StudentLeaderboard() {
  const { user } = useApp()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true)
      try {
        const result = await studentApi.getLeaderboard()
        if (result.success && result.data) {
          setLeaderboard(result.data)
        } else {
          setError(result.error || 'Failed to load leaderboard')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.totalSpent - a.totalSpent)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (sortedLeaderboard.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Top food enthusiasts this month</p>
        </div>
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No leaderboard data available yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
        <p className="text-sm text-muted-foreground">Top food enthusiasts this month</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 py-6">
        {/* 2nd Place */}
        {sortedLeaderboard[1] && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-500/10 border-2 border-slate-400 flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-foreground">
                {sortedLeaderboard[1]?.name.charAt(0)}
              </span>
            </div>
            <Medal className="w-6 h-6 text-slate-400 mb-1" />
            <p className="text-xs font-medium text-foreground text-center truncate w-20">
              {sortedLeaderboard[1]?.name.split(' ')[0]}
            </p>
            <p className="text-xs text-muted-foreground">Rs. {sortedLeaderboard[1]?.totalSpent}</p>
            <div className="w-16 h-16 mt-2 rounded-t-lg bg-slate-500/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {sortedLeaderboard[0] && (
          <div className="flex flex-col items-center -mt-8">
            <Crown className="w-8 h-8 text-yellow-400 mb-2 animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-400 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-foreground">
                {sortedLeaderboard[0]?.name.charAt(0)}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground text-center truncate w-24">
              {sortedLeaderboard[0]?.name.split(' ')[0]}
            </p>
            <p className="text-xs text-primary font-medium">Rs. {sortedLeaderboard[0]?.totalSpent}</p>
            <div className="w-20 h-24 mt-2 rounded-t-lg bg-yellow-500/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-yellow-400">1</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {sortedLeaderboard[2] && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-600/10 border-2 border-amber-600 flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-foreground">
                {sortedLeaderboard[2]?.name.charAt(0)}
              </span>
            </div>
            <Medal className="w-6 h-6 text-amber-600 mb-1" />
            <p className="text-xs font-medium text-foreground text-center truncate w-20">
              {sortedLeaderboard[2]?.name.split(' ')[0]}
            </p>
            <p className="text-xs text-muted-foreground">Rs. {sortedLeaderboard[2]?.totalSpent}</p>
            <div className="w-16 h-12 mt-2 rounded-t-lg bg-amber-600/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-600">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the leaderboard */}
      <div className="space-y-2">
        {sortedLeaderboard.slice(3).map((entry, index) => {
          const isCurrentUser = entry.id === user?.id

          return (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-colors animate-float-up",
                isCurrentUser
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">{index + 4}</span>
              </div>

              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {entry.name.charAt(0)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {entry.name}
                  {isCurrentUser && <span className="text-primary text-xs ml-2">(You)</span>}
                </p>
                <p className="text-xs text-muted-foreground">{entry.ordersCount} orders</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-primary">Rs. {entry.totalSpent}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  Top {Math.round((index + 4) / sortedLeaderboard.length * 100)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
