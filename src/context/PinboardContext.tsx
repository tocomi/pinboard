import { createContext, useContext, useEffect, useState } from 'react'
import type { PinboardItem } from '../types'

interface PinboardContextType {
  items: PinboardItem[]
  completedItems: PinboardItem[]
  addItem: (title: string, deadline?: Date, tags?: string[]) => void
  updateItem: (item: PinboardItem) => void
  completeItem: (id: string) => void
  deleteItem: (id: string) => void
  reorderItems: (items: PinboardItem[]) => void
  showCompleted: boolean
  toggleShowCompleted: () => void
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

  // Load items from storage on initial render
  useEffect(() => {
    const loadItems = async () => {
      try {
        const result = await chrome.storage.local.get([
          'items',
          'completedItems',
        ])
        if (result.items) {
          setItems(result.items as PinboardItem[])
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

  const addItem = (title: string, deadline?: Date, tags?: string[]) => {
    const newItem: PinboardItem = {
      id: crypto.randomUUID(),
      title,
      deadline,
      tags,
      completed: false,
      order: items.length,
    }

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

    const completedItem = { ...itemToComplete, completed: true }

    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    setCompletedItems((prevItems) => [...prevItems, completedItem])
  }

  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    setCompletedItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const reorderItems = (reorderedItems: PinboardItem[]) => {
    // Update the order property based on the new order
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index,
    }))

    setItems(updatedItems)
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
  }

  return (
    <PinboardContext.Provider value={value}>
      {children}
    </PinboardContext.Provider>
  )
}
