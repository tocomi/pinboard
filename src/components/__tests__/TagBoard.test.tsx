import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PinboardProvider } from '../../context/PinboardContext'
import type { PinboardItem } from '../../types'
import { TagBoard } from '../TagBoard'

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

// Mock the Card component
vi.mock('../ui/card', () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}))

// Mock items for a specific tag
const mockItems: PinboardItem[] = [
  {
    id: '1',
    title: 'Item 1',
    completed: false,
    order: 0,
    tags: ['ToDo'],
  },
  {
    id: '4',
    title: 'Item 4',
    completed: false,
    order: 3,
    tags: ['ToDo'],
  },
]

const mockReorderItems = vi.fn()

// Create a mock for usePinboard
const mockUsePinboard = vi.fn(() => ({
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
}))

vi.mock('../../context/PinboardContext', () => ({
  usePinboard: () => mockUsePinboard(),
  PinboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pinboard-provider">{children}</div>
  ),
}))

describe('TagBoard', () => {
  it('renders correctly with items', () => {
    render(
      <PinboardProvider>
        <TagBoard tag="ToDo" items={mockItems} />
      </PinboardProvider>,
    )

    // Check if tag title is rendered
    expect(screen.getByText('ToDo')).toBeInTheDocument()

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
    render(
      <PinboardProvider>
        <TagBoard tag="空のタグ" items={[]} />
      </PinboardProvider>,
    )

    // Check if tag title is rendered
    expect(screen.getByText('空のタグ')).toBeInTheDocument()

    // Check if empty state message is rendered
    expect(
      screen.getByText('このタグのアイテムはありません'),
    ).toBeInTheDocument()
  })

  it('handles drag end event correctly', () => {
    render(
      <PinboardProvider>
        <TagBoard tag="ToDo" items={mockItems} />
      </PinboardProvider>,
    )

    // Simulate drag end event
    const dragEndEvent = {
      active: { id: '1' },
      over: { id: '4' },
    }

    // Call the onDragEnd handler directly from our mock
    mockDndContextProps.onDragEnd(dragEndEvent)

    // Check if reorderItems was called with the correct arguments
    expect(mockReorderItems).toHaveBeenCalledTimes(1)

    // The expected result should be the items array with item 1 moved to position 2
    const expectedItems = [
      mockItems[1], // Item 4
      mockItems[0], // Item 1 (moved to the end)
    ]

    expect(mockReorderItems).toHaveBeenCalledWith(expectedItems)
  })
})
