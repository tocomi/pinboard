import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PinboardItem } from '../../types'
import { type PinboardContextType, usePinboardState } from '../usePinboardState'

function HookTester({
  storage,
  onReady,
}: {
  storage: chrome.storage.StorageArea
  onReady: (state: PinboardContextType) => void
}) {
  const state = usePinboardState({ storage })
  onReady(state)
  return null
}

describe('usePinboardState', () => {
  it('loads items from storage on mount', async () => {
    const mockItems: PinboardItem[] = [
      {
        id: '1',
        title: 'test',
        completed: false,
        order: 0,
        tags: ['ToDo'],
      },
    ]

    const mockStorage = {
      get: vi.fn().mockResolvedValue({ items: mockItems, completedItems: [] }),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn(),
      clear: vi.fn(),
    } as unknown as chrome.storage.StorageArea

    let result: PinboardContextType | undefined
    await act(async () => {
      render(
        <HookTester
          storage={mockStorage}
          onReady={(s) => {
            result = s
          }}
        />,
      )
    })

    await waitFor(() => {
      expect(mockStorage.get).toHaveBeenCalled()
    })

    expect(result?.items).toHaveLength(1)
    expect(result?.items[0].title).toBe('test')
  })

  it('adds new item', () => {
    const mockStorage = {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn(),
      clear: vi.fn(),
    } as unknown as chrome.storage.StorageArea

    let state: PinboardContextType | undefined
    render(
      <HookTester
        storage={mockStorage}
        onReady={(s) => {
          state = s
        }}
      />,
    )

    act(() => {
      state?.addItem({ title: 'new', tags: ['ToDo'] })
    })

    expect(state?.items).toHaveLength(1)
    expect(state?.items[0].title).toBe('new')
  })
})
