import { formatDistanceToNow } from 'date-fns'

export function formatRelativeTime(date: Date | number | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
} 