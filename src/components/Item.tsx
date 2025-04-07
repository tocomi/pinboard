import { usePinboard } from '../context/PinboardContext'
import type { PinboardItem } from '../types'
import { LongPressButton } from './LongPressButton'

interface ItemProps {
  item: PinboardItem
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
}

export function Item({ item, onDragStart, onDragOver }: ItemProps) {
  const { completeItem, deleteItem } = usePinboard()

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

      <div className="ml-4 flex items-center gap-2">
        <LongPressButton
          color="green"
          icon="✓"
          label="完了"
          onLongPressComplete={() => completeItem(item.id)}
        />
        <LongPressButton
          color="red"
          icon="×"
          label="削除"
          onLongPressComplete={() => deleteItem(item.id)}
        />
      </div>
    </div>
  )
}
