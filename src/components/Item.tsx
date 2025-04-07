import { useRef, useState } from 'react'
import { usePinboard } from '../context/PinboardContext'
import type { PinboardItem } from '../types'

interface ItemProps {
  item: PinboardItem
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
}

export function Item({ item, onDragStart, onDragOver }: ItemProps) {
  const { completeItem, deleteItem } = usePinboard()
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [longPressProgress, setLongPressProgress] = useState(0)
  const longPressTimerRef = useRef<number | null>(null)
  const progressTimerRef = useRef<number | null>(null)

  // Format deadline if it exists
  const formattedDeadline = item.deadline
    ? new Date(item.deadline).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

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
    }, 20) // Update every 20ms for smooth animation

    // Complete after 2 seconds
    longPressTimerRef.current = window.setTimeout(() => {
      completeItem(item.id)
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }, 2000)
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
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={() => onDragOver(item.id)}
      className="mb-2 flex cursor-grab items-center justify-between rounded-lg bg-white p-3 shadow-sm hover:shadow-md"
    >
      <div className="flex-1">
        <h3 className="font-medium">{item.title}</h3>

        {formattedDeadline && (
          <p className="mt-1 text-gray-600 text-sm">
            期限: {formattedDeadline}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="ml-4 flex items-center">
        <button
          type="button"
          className="relative mr-2 h-8 w-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            ✓
          </span>

          {isLongPressing && (
            <svg
              className="absolute inset-0"
              viewBox="0 0 36 36"
              aria-label="完了進行状況"
            >
              <title>Progress</title>
              <circle
                className="stroke-green-600"
                cx="18"
                cy="18"
                r="16"
                fill="none"
                strokeWidth="2"
                strokeDasharray={`${longPressProgress} 100`}
                transform="rotate(-90 18 18)"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => deleteItem(item.id)}
          className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
        >
          ×
        </button>
      </div>
    </div>
  )
}
