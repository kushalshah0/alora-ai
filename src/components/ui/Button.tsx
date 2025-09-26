import { cn } from '../../lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg' }

export function Button({ className, variant = 'primary', size = 'md', ...props }: Props) {
  const variantCls = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  }[variant]

  const sizeCls = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-12 px-5 text-lg' }[size]

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-blue-500/30',
        variantCls,
        sizeCls,
        className,
      )}
      {...props}
    />
  )
} 