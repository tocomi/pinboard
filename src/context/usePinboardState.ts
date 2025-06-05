import { useEffect, useState } from 'react'
import type { PinboardItem } from '../types'

export interface PinboardStateOptions {
  storage?: chrome.storage.StorageArea
}

export interface PinboardContextType {
  items: PinboardItem[]
  completedItems: PinboardItem[]
  addItem: ({
    title,
    tags,
    deadline,
  }: {
    title: string
    tags: string[]
    deadline?: number
  }) => void
  updateItem: (item: PinboardItem) => void
  completeItem: (id: string) => void
  deleteItem: (id: string) => void
  reorderItems: (items: PinboardItem[], tag?: string) => void
  showCompleted: boolean
  toggleShowCompleted: () => void
  newItemIds: Set<string>
  removingItemIds: Set<string>
  celebratingItemId: string | null
  setCelebratingItemId: (id: string | null) => void
}

export function usePinboardState(
  options: PinboardStateOptions = {},
): PinboardContextType {
  const storage = options.storage ?? chrome.storage.local

  const [items, setItems] = useState<PinboardItem[]>([])
  const [completedItems, setCompletedItems] = useState<PinboardItem[]>([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set())
  const [removingItemIds, setRemovingItemIds] = useState<Set<string>>(new Set())
  const [celebratingItemId, setCelebratingItemId] = useState<string | null>(null)

  useEffect(() => {
    const loadItems = async () => {
      try {
        const result = await storage.get(['items', 'completedItems'])
        if (result.items) {
          const itemsWithTags = (result.items as PinboardItem[]).map((item) => {
            if (!item.tags || item.tags.length === 0) {
              return { ...item, tags: ['ToDo'] }
            }
            return item
          })
          setItems(itemsWithTags)
        }
        if (result.completedItems) {
          setCompletedItems(result.completedItems as PinboardItem[])
        }
      } catch (error) {
        console.error('Failed to load items from storage', error)
      }
    }

    loadItems()
  }, [storage])

  useEffect(() => {
    const saveItems = async () => {
      try {
        await storage.set({ items, completedItems })
      } catch (error) {
        console.error('Failed to save items to storage', error)
      }
    }

    saveItems()
  }, [items, completedItems, storage])

  const addItem = ({
    title,
    tags,
    deadline,
  }: { title: string; deadline?: number; tags: string[] }) => {
    const newItem: PinboardItem = {
      id: crypto.randomUUID(),
      title,
      deadline,
      tags,
      completed: false,
      order: items.length,
    }

    setNewItemIds((prev) => new Set(prev).add(newItem.id))

    setTimeout(() => {
      setNewItemIds((prev) => {
        const updated = new Set(prev)
        updated.delete(newItem.id)
        return updated
      })
    }, 500)

    setItems((prevItems) => [...prevItems, newItem])
  }

  const updateItem = (updatedItem: PinboardItem) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    )
  }

  const completeItem = (id: string) => {
    const itemToComplete = items.find((item) => item.id === id)
    if (!itemToComplete) return

    setCelebratingItemId(id)
    setRemovingItemIds((prev) => new Set(prev).add(id))

    setTimeout(() => {
      const completedItem = { ...itemToComplete, completed: true }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
      setCompletedItems((prevItems) => [...prevItems, completedItem])

      setRemovingItemIds((prev) => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }, 500)
  }

  const deleteItem = (id: string) => {
    setRemovingItemIds((prev) => new Set(prev).add(id))

    setTimeout(() => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
      setCompletedItems((prevItems) =>
        prevItems.filter((item) => item.id !== id),
      )

      setRemovingItemIds((prev) => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }, 500)
  }

  const reorderItems = (reorderedItems: PinboardItem[], tag?: string) => {
    if (!tag) {
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index,
      }))
      setItems(updatedItems)
      return
    }

    setItems((prevItems) => {
      const orderMap = new Map(reorderedItems.map((item, idx) => [item.id, idx]))
      return prevItems.map((item) => {
        if (orderMap.has(item.id)) {
          const newOrder = orderMap.get(item.id)
          return { ...item, order: newOrder ?? item.order }
        }
        return item
      })
    })
  }

  const toggleShowCompleted = () => {
    setShowCompleted((prev) => !prev)
  }

  const value: PinboardContextType = {
    items,
    completedItems,
    addItem,
    updateItem,
    completeItem,
    deleteItem,
    reorderItems,
    showCompleted,
    toggleShowCompleted,
    newItemIds,
    removingItemIds,
    celebratingItemId,
    setCelebratingItemId,
  }

  function __debugAddSampleItems() {
    const tags = ['ToDo', 'やりたい', '目標']
    const now = Date.now()
    const items: PinboardItem[] = []
    tags.forEach((tag, tIdx) => {
      for (let i = 0; i < 5; i++) {
        items.push({
          id: crypto.randomUUID(),
          title: `${tag}のタスク${i + 1}`.repeat(i + 1),
          tags: [tag],
          completed: false,
          order: i,
          deadline: now + (i + tIdx) * 86400000,
        })
      }
    })
    setItems(items)
  }

  if (typeof window !== 'undefined') {
    window.__debugAddSampleItems = __debugAddSampleItems
  }

  return value
}
