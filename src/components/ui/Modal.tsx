import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Modal({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; className?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn('w-full max-w-lg rounded-xl backdrop-blur-lg bg-white/85 dark:bg-gray-900/85 border border-white/25 dark:border-gray-700/35 shadow-xl', className)}>
          <div className="flex items-center justify-between p-3 border-b border-white/20 dark:border-gray-700/30">
            <div className="text-sm font-semibold">{title}</div>
            <button className="p-1 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 