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
import { Item } from './Item'

export function ItemList() {
  const { items, reorderItems } = usePinboard()

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
      // Require a small drag distance to start dragging
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
      <p className="mt-4 text-center text-gray-500 text-lg">
        All items are completed 🎉🎉🎉
      </p>
    )
  }

  return (
    <div className="w-full max-w-md">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {sortedItems.map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
