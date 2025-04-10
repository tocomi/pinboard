import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PinboardProvider } from '../../context/PinboardContext'
import type { PinboardItem } from '../../types'
import { BoardContainer } from '../BoardContainer'

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

// Mock items with different tags
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
  {
    id: '4',
    title: 'Item 4',
    completed: false,
    order: 3,
    tags: ['ToDo'],
  },
]

// Create a mock for usePinboard
const mockUsePinboard = vi.fn(() => ({
  items: mockItems,
  completedItems: [],
  addItem: vi.fn(),
  updateItem: vi.fn(),
  completeItem: vi.fn(),
  deleteItem: vi.fn(),
  reorderItems: vi.fn(),
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

describe('BoardContainer', () => {
  it('renders TagBoard for each unique tag', () => {
    render(
      <PinboardProvider>
        <BoardContainer />
      </PinboardProvider>,
    )

    // Check if TagBoard is rendered for each unique tag
    expect(screen.getByTestId('tag-board-ToDo')).toBeInTheDocument()
    expect(screen.getByTestId('tag-board-やりたい')).toBeInTheDocument()
    expect(screen.getByTestId('tag-board-目標')).toBeInTheDocument()

    // Check if items are correctly grouped by tag
    expect(screen.getByTestId('tag-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('tag-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('tag-item-3')).toBeInTheDocument()
    expect(screen.getByTestId('tag-item-4')).toBeInTheDocument()
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
      reorderItems: vi.fn(),
      showCompleted: false,
      toggleShowCompleted: vi.fn(),
      newItemIds: new Set<string>(),
      removingItemIds: new Set<string>(),
      celebratingItemId: null,
      setCelebratingItemId: vi.fn(),
    })

    render(
      <PinboardProvider>
        <BoardContainer />
      </PinboardProvider>,
    )

    // Check if empty state message is rendered
    expect(screen.getByText('アイテムがありません')).toBeInTheDocument()
  })
})
