import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { usePinboard } from '../context/PinboardContext'
import type { PinboardItem } from '../types'
import { Item } from './Item'
import { Card } from './ui/card'

interface TagBoardProps {
  tag: string
  items: PinboardItem[]
}

export function TagBoard({ tag, items }: TagBoardProps) {
  const { reorderItems } = usePinboard()

  // Sort items by their order property
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.order - b.order),
    [items],
  )

  // Extract item IDs for SortableContext
  const itemIds = useMemo(
    () => sortedItems.map((item) => item.id),
    [sortedItems],
  )

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Find the indices of the dragged item and the target item
    const activeIndex = sortedItems.findIndex((item) => item.id === active.id)
    const overIndex = sortedItems.findIndex((item) => item.id === over.id)

    if (activeIndex === -1 || overIndex === -1) return

    // Create a new array with the items in the new order
    const newItems = arrayMove(sortedItems, activeIndex, overIndex)

    // Update the order property and save
    reorderItems(newItems)
  }

  if (items.length === 0) {
    return (
      <Card className="flex h-full w-[350px] flex-col items-center justify-center p-4">
        <h2 className="mb-2 font-bold text-lg">{tag}</h2>
        <p className="text-center text-gray-500">
          このタグのアイテムはありません
        </p>
      </Card>
    )
  }

  return (
    <Card className="flex h-auto min-h-[200px] w-[350px] flex-col p-4">
      <h2 className="mb-4 font-bold text-lg">{tag}</h2>
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {sortedItems.map((item) => (
              <Item key={item.id} item={item} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </Card>
  )
}
