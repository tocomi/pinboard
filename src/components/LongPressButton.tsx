import { useRef, useState } from 'react'

interface LongPressButtonProps {
  color: 'green' | 'red'
  icon: string
  label: string
  onLongPressComplete: () => void
}

export function LongPressButton({
  color,
  icon,
  label,
  onLongPressComplete,
}: LongPressButtonProps) {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [longPressProgress, setLongPressProgress] = useState(0)
  const longPressTimerRef = useRef<number | null>(null)
  const progressTimerRef = useRef<number | null>(null)

  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      hover: 'hover:bg-green-200',
      stroke: 'stroke-green-600',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      hover: 'hover:bg-red-200',
      stroke: 'stroke-red-600',
    },
  }

  const handleLongPressStart = () => {
    setIsLongPressing(true)
    setLongPressProgress(0)

    // Start progress animation
    let progress = 0
    progressTimerRef.current = window.setInterval(() => {
      progress += 2
      setLongPressProgress(Math.min(progress, 100))

      if (progress >= 100 && progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }, 20) // Update every 20ms for smooth animation (2% per 20ms = 100% in 1000ms)

    // Complete after 1 second
    longPressTimerRef.current = window.setTimeout(() => {
      onLongPressComplete()
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }, 1000)
  }

  const handleLongPressEnd = () => {
    setIsLongPressing(false)
    setLongPressProgress(0)

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }

  return (
    <button
      type="button"
      className={`relative h-8 w-8 rounded-full ${colorClasses[color].bg} ${colorClasses[color].text} ${colorClasses[color].hover}`}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {icon}
      </span>

      {isLongPressing && (
        <svg
          className="absolute inset-0"
          viewBox="0 0 36 36"
          aria-label={`${label}進行状況`}
        >
          <title>{label}進行状況</title>
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="transparent"
            strokeWidth="2"
            className={colorClasses[color].stroke}
            strokeDasharray={`${(longPressProgress / 100) * 100.53} 100.53`}
            strokeDashoffset="0"
            transform="rotate(-90 18 18)"
          />
        </svg>
      )}
    </button>
  )
}
