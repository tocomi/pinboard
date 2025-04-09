import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PinboardProvider } from '../../context/PinboardContext'
import type { PinboardItem } from '../../types'
import { ItemList } from '../ItemList'

// Mock chrome.storage API
const mockChrome = {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue({}),
    },
  },
}

// @ts-ignore - Mock chrome global
window.chrome = mockChrome

// Mock the dnd-kit libraries
const mockDndContextProps = {
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDragEnd: vi.fn(),
}

const MockDndContext = vi.fn(
  ({ children, onDragStart, onDragOver, onDragEnd }) => {
    mockDndContextProps.onDragStart = onDragStart
    mockDndContextProps.onDragOver = onDragOver
    mockDndContextProps.onDragEnd = onDragEnd
    return <div data-testid="dnd-context">{children}</div>
  },
)

vi.mock('@dnd-kit/core', () => ({
  DndContext: (props: {
    children: React.ReactNode
    onDragStart?: (event: unknown) => void
    onDragOver?: (event: unknown) => void
    onDragEnd?: (event: unknown) => void
    sensors?: unknown
    collisionDetection?: unknown
  }) => MockDndContext(props),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => ({})),
  PointerSensor: vi.fn(),
  closestCenter: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual('@dnd-kit/sortable')
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sortable-context">{children}</div>
    ),
    arrayMove: vi.fn((items, from, to) => {
      const result = [...items]
      const [removed] = result.splice(from, 1)
      result.splice(to, 0, removed)
      return result
    }),
    verticalListSortingStrategy: {},
  }
})

// Mock the Item component
vi.mock('../Item', () => ({
  Item: ({ item }: { item: PinboardItem }) => (
    <div data-testid={`item-${item.id}`}>{item.title}</div>
  ),
}))

// Mock the PinboardContext
const mockItems: PinboardItem[] = [
  {
    id: '1',
    title: 'Item 1',
    completed: false,
    order: 0,
    tags: ['ToDo'],
  },
  {
    id: '2',
    title: 'Item 2',
    completed: false,
    order: 1,
    tags: ['やりたい'],
  },
  {
    id: '3',
    title: 'Item 3',
    completed: false,
    order: 2,
    tags: ['目標'],
  },
]

const mockReorderItems = vi.fn()

// Define the PinboardContextType for testing
interface PinboardContextType {
  items: PinboardItem[]
  completedItems: PinboardItem[]
  addItem: (title: string, deadline?: number, tags?: string[]) => void
  updateItem: (item: PinboardItem) => void
  completeItem: (id: string) => void
  deleteItem: (id: string) => void
  reorderItems: (items: PinboardItem[]) => void
  showCompleted: boolean
  toggleShowCompleted: () => void
  newItemIds: Set<string>
  removingItemIds: Set<string>
  celebratingItemId: string | null
  setCelebratingItemId: (id: string | null) => void
}

// Create a mock for usePinboard
const mockUsePinboard = vi.fn(() => ({
  items: mockItems,
  completedItems: [],
  addItem: vi.fn(),
  updateItem: vi.fn(),
  completeItem: vi.fn(),
  deleteItem: vi.fn(),
  reorderItems: mockReorderItems,
  showCompleted: false,
  toggleShowCompleted: vi.fn(),
  newItemIds: new Set<string>(),
  removingItemIds: new Set<string>(),
  celebratingItemId: null,
  setCelebratingItemId: vi.fn(),
}))

vi.mock('../../context/PinboardContext', () => ({
  usePinboard: () => mockUsePinboard(),
  PinboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pinboard-provider">{children}</div>
  ),
}))

describe('ItemList', () => {
  it('renders correctly with items', () => {
    render(
      <PinboardProvider>
        <ItemList />
      </PinboardProvider>,
    )

    // Check if DndContext and SortableContext are rendered
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument()

    // Check if all items are rendered
    for (const item of mockItems) {
      expect(screen.getByTestId(`item-${item.id}`)).toBeInTheDocument()
      expect(screen.getByText(item.title)).toBeInTheDocument()
    }
  })

  it('renders empty state when no items', () => {
    // Override the mock to return empty items
    mockUsePinboard.mockReturnValueOnce({
      items: [],
      completedItems: [],
      addItem: vi.fn(),
      updateItem: vi.fn(),
      completeItem: vi.fn(),
      deleteItem: vi.fn(),
      reorderItems: mockReorderItems,
      showCompleted: false,
      toggleShowCompleted: vi.fn(),
      newItemIds: new Set<string>(),
      removingItemIds: new Set<string>(),
      celebratingItemId: null,
      setCelebratingItemId: vi.fn(),
    })

    render(
      <PinboardProvider>
        <ItemList />
      </PinboardProvider>,
    )

    // Check if empty state message is rendered
    expect(
      screen.getByText('All items are completed 🎉🎉🎉'),
    ).toBeInTheDocument()
  })

  it('handles drag end event correctly', async () => {
    render(
      <PinboardProvider>
        <ItemList />
      </PinboardProvider>,
    )

    // Get the DndContext component
    const dndContext = screen.getByTestId('dnd-context')

    // Simulate drag end event
    const dragEndEvent = {
      active: { id: '1' },
      over: { id: '3' },
    }

    // Call the onDragEnd handler directly from our mock
    mockDndContextProps.onDragEnd(dragEndEvent)

    // Check if reorderItems was called with the correct arguments
    expect(mockReorderItems).toHaveBeenCalledTimes(1)

    // The expected result should be the items array with item 1 moved to position 3
    const expectedItems = [
      mockItems[1], // Item 2
      mockItems[2], // Item 3
      mockItems[0], // Item 1 (moved to the end)
    ]

    expect(mockReorderItems).toHaveBeenCalledWith(expectedItems)
  })
})
