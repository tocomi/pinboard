import { useState } from 'react'
import { usePinboard } from '../context/PinboardContext'
import { Item } from './Item'

export function ItemList() {
  const { items, reorderItems } = usePinboard()
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)

  // Sort items by their order property
  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  const handleDragStart = (id: string) => {
    setDraggedItemId(id)
  }

  const handleDragOver = (id: string) => {
    if (!draggedItemId || draggedItemId === id) return

    // Reorder the items
    const itemsCopy = [...sortedItems]
    const draggedItemIndex = itemsCopy.findIndex(
      (item) => item.id === draggedItemId,
    )
    const targetItemIndex = itemsCopy.findIndex((item) => item.id === id)

    if (draggedItemIndex === -1 || targetItemIndex === -1) return

    // Remove the dragged item from the array
    const [draggedItem] = itemsCopy.splice(draggedItemIndex, 1)

    // Insert it at the target position
    itemsCopy.splice(targetItemIndex, 0, draggedItem)

    // Update the order property and save
    reorderItems(itemsCopy)
  }

  const handleDragEnd = () => {
    setDraggedItemId(null)
  }

  if (items.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500">
        アイテムがありません。新しいアイテムを追加してください。
      </div>
    )
  }

  return (
    <div className="w-full max-w-md" onDragEnd={handleDragEnd}>
      {sortedItems.map((item) => (
        <Item
          key={item.id}
          item={item}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
        />
      ))}
    </div>
  )
}
