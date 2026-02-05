import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to extract category name (handles both string and object formats from API)
export function getCategoryName(category: string | { _id?: string; id?: string; name?: string } | undefined | null): string {
  if (!category) return 'Uncategorized'
  if (typeof category === 'string') return category
  if (typeof category === 'object' && category.name) return category.name
  return 'Uncategorized'
}
