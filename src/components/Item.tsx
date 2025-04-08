import { Clock, Tag } from 'lucide-react'
import { usePinboard } from '../context/PinboardContext'
import { cn } from '../lib/utils'
import type { PinboardItem } from '../types'
import { LongPressButton } from './LongPressButton'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

interface ItemProps {
  item: PinboardItem
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
}

export function Item({ item, onDragStart, onDragOver }: ItemProps) {
  const { completeItem, deleteItem, newItemIds, removingItemIds } =
    usePinboard()
  const isNewItem = newItemIds.has(item.id)
  const isRemoving = removingItemIds.has(item.id)

  // Format deadline if it exists
  const formattedDeadline = item.deadline
    ? new Date(item.deadline).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null

  return (
    <Card
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={() => onDragOver(item.id)}
      className={cn(
        'mb-2 min-h-[58px] cursor-grab p-0 py-2 transition-all duration-500 hover:shadow-md',
        isNewItem ? 'animate-slide-in' : '',
        isRemoving ? 'animate-fade-out' : '',
      )}
    >
      <div className="flex items-start justify-between px-4">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{item.title}</h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3">
            {formattedDeadline && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="h-3 w-3" />
                <span>{formattedDeadline}</span>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {item.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="h-4 px-2 py-0 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ml-2 flex items-center gap-2">
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
    </Card>
  )
}
