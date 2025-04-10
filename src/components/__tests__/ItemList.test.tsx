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

// Mock the BoardContainer component
vi.mock('../BoardContainer', () => ({
  BoardContainer: () => (
    <div data-testid="board-container">Board Container</div>
  ),
}))

// Mock the Item component
vi.mock('../Item', () => ({
  Item: ({ item }: { item: PinboardItem }) => (
    <div data-testid={`item-${item.id}`}>{item.title}</div>
  ),
}))

// Mock the TagBoard component
vi.mock('../TagBoard', () => ({
  TagBoard: ({ tag, items }: { tag: string; items: PinboardItem[] }) => (
    <div data-testid={`tag-board-${tag}`}>
      <h2>{tag}</h2>
      {items.map((item) => (
        <div key={item.id} data-testid={`tag-item-${item.id}`}>
          {item.title}
        </div>
      ))}
    </div>
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
  it('renders BoardContainer component', () => {
    render(
      <PinboardProvider>
        <ItemList />
      </PinboardProvider>,
    )

    // Check if BoardContainer is rendered
    expect(screen.getByTestId('board-container')).toBeInTheDocument()
  })
})
