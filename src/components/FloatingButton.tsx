import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface FloatingButtonProps {
  onClick: () => void
  isHidden?: boolean
  children: ReactNode
  label: string
}

export function FloatingButton({
  onClick,
  isHidden = false,
  children,
  label,
}: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-translate-x-1/2 fixed bottom-6 left-1/2 z-10 flex h-14 w-14 items-center justify-center',
        'rounded-full bg-blue-500 text-white shadow-lg transition-all hover:bg-blue-600',
        'cursor-pointer focus:outline-none',
        isHidden ? 'scale-0' : 'scale-100',
      )}
      aria-label={label}
    >
      {children}
    </button>
  )
}
