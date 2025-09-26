import { cn } from '../../lib/cn'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ className, ...props }, ref) {
  return (
    <input ref={ref} className={cn('h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50', className)} {...props} />
  )
}) 