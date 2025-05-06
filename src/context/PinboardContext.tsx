import { createContext, useContext, useEffect, useState } from 'react'
import type { PinboardItem } from '../types'

interface PinboardContextType {
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

const PinboardContext = createContext<PinboardContextType | undefined>(
  undefined,
)

export function usePinboard() {
  const context = useContext(PinboardContext)
  if (context === undefined) {
    throw new Error('usePinboard must be used within a PinboardProvider')
  }
  return context
}

export function PinboardProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PinboardItem[]>([])
  const [completedItems, setCompletedItems] = useState<PinboardItem[]>([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set())
  const [removingItemIds, setRemovingItemIds] = useState<Set<string>>(new Set())
  const [celebratingItemId, setCelebratingItemId] = useState<string | null>(
    null,
  )

  // Load items from storage on initial render
  useEffect(() => {
    const loadItems = async () => {
      try {
        const result = await chrome.storage.local.get([
          'items',
          'completedItems',
        ])
        if (result.items) {
          // タグなしアイテムにデフォルトタグを割り当て
          const itemsWithTags = (result.items as PinboardItem[]).map((item) => {
            if (!item.tags || item.tags.length === 0) {
              return { ...item, tags: ['ToDo'] } // デフォルトタグを割り当て
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
  }, [])

  // Save items to storage whenever they change
  useEffect(() => {
    const saveItems = async () => {
      try {
        await chrome.storage.local.set({ items, completedItems })
      } catch (error) {
        console.error('Failed to save items to storage', error)
      }
    }

    saveItems()
  }, [items, completedItems])

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

    // Add the new item ID to the set of new items
    setNewItemIds((prev) => new Set(prev).add(newItem.id))

    // Remove the item from the new items set after animation completes
    setTimeout(() => {
      setNewItemIds((prev) => {
        const updated = new Set(prev)
        updated.delete(newItem.id)
        return updated
      })
    }, 500) // Animation duration

    setItems((prevItems) => [...prevItems, newItem])
  }

  const updateItem = (updatedItem: PinboardItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    )
  }

  const completeItem = (id: string) => {
    const itemToComplete = items.find((item) => item.id === id)
    if (!itemToComplete) return

    // お祝いエフェクトを表示
    setCelebratingItemId(id)

    // Add the item to the removing set for animation
    setRemovingItemIds((prev) => new Set(prev).add(id))

    // Wait for animation to complete before removing
    setTimeout(() => {
      const completedItem = { ...itemToComplete, completed: true }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
      setCompletedItems((prevItems) => [...prevItems, completedItem])

      // Remove from the removing set
      setRemovingItemIds((prev) => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }, 500) // Animation duration
  }

  const deleteItem = (id: string) => {
    // Add the item to the removing set for animation
    setRemovingItemIds((prev) => new Set(prev).add(id))

    // Wait for animation to complete before removing
    setTimeout(() => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
      setCompletedItems((prevItems) =>
        prevItems.filter((item) => item.id !== id),
      )

      // Remove from the removing set
      setRemovingItemIds((prev) => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }, 500) // Animation duration
  }

  const reorderItems = (reorderedItems: PinboardItem[], tag?: string) => {
    if (!tag) {
      // 後方互換: タグが指定されていない場合は従来通り全体を上書き
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index,
      }))
      setItems(updatedItems)
      return
    }

    setItems((prevItems) => {
      // タグ内のアイテムだけorderを更新し、配列の順序自体は変えない
      const orderMap = new Map(
        reorderedItems.map((item, idx) => [item.id, idx]),
      )
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

  const value = {
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

  // デバッグ用: 各カテゴリに5つずつダミーデータを追加する関数（本番ロジックにはexportしない）
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

  // 開発時のみwindowに登録
  if (typeof window !== 'undefined') {
    window.__debugAddSampleItems = __debugAddSampleItems
  }

  return (
    <PinboardContext.Provider value={value}>
      {children}
    </PinboardContext.Provider>
  )
}
