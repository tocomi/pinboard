import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LongPressButton } from '../LongPressButton'

describe('LongPressButton', () => {
  // Setup and teardown for timer mocks
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with the correct color and icon', () => {
    const onLongPressComplete = vi.fn()
    render(
      <LongPressButton
        color="green"
        icon="✓"
        label="完了"
        onLongPressComplete={onLongPressComplete}
      />,
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-green-100')
    expect(button).toHaveClass('text-green-600')
    expect(button.textContent).toContain('✓')
  })

  it('shows progress indicator when long press starts', () => {
    const onLongPressComplete = vi.fn()
    render(
      <LongPressButton
        color="red"
        icon="×"
        label="削除"
        onLongPressComplete={onLongPressComplete}
      />,
    )

    const button = screen.getByRole('button')

    // Start long press
    fireEvent.mouseDown(button)

    // Check if progress indicator is shown
    const progressIndicator = screen.getByLabelText('削除進行状況')
    expect(progressIndicator).toBeInTheDocument()
  })

  it('calls onLongPressComplete after 1 second of pressing', () => {
    const onLongPressComplete = vi.fn()
    render(
      <LongPressButton
        color="green"
        icon="✓"
        label="完了"
        onLongPressComplete={onLongPressComplete}
      />,
    )

    const button = screen.getByRole('button')

    // Start long press
    fireEvent.mouseDown(button)

    // Fast-forward time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Check if callback was called
    expect(onLongPressComplete).toHaveBeenCalledTimes(1)
  })

  it('does not call onLongPressComplete if press is released before 1 second', () => {
    const onLongPressComplete = vi.fn()
    render(
      <LongPressButton
        color="green"
        icon="✓"
        label="完了"
        onLongPressComplete={onLongPressComplete}
      />,
    )

    const button = screen.getByRole('button')

    // Start long press
    fireEvent.mouseDown(button)

    // Fast-forward time by 500ms (half the required time)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Release the button
    fireEvent.mouseUp(button)

    // Fast-forward time to ensure no delayed calls
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Check that callback was not called
    expect(onLongPressComplete).not.toHaveBeenCalled()
  })

  it('updates progress indicator during long press', () => {
    const onLongPressComplete = vi.fn()
    render(
      <LongPressButton
        color="green"
        icon="✓"
        label="完了"
        onLongPressComplete={onLongPressComplete}
      />,
    )

    const button = screen.getByRole('button')

    // Start long press
    fireEvent.mouseDown(button)

    // Fast-forward time by 500ms (50% progress)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Check progress indicator (should be around 50%)
    const progressIndicator = screen.getByLabelText('完了進行状況')
    const circle = progressIndicator.querySelector('circle')

    // The strokeDasharray should be approximately 50% of 100.53
    // We're checking if it's between 45 and 55 to allow for small variations
    const dashArray = circle?.getAttribute('stroke-dasharray')
    const progressValue = dashArray
      ? Number.parseFloat(dashArray.split(' ')[0])
      : 0

    expect(progressValue).toBeGreaterThanOrEqual(45)
    expect(progressValue).toBeLessThanOrEqual(55)
  })

  it('cancels long press when mouse leaves the button', () => {
    const onLongPressComplete = vi.fn()
    render(
      <LongPressButton
        color="green"
        icon="✓"
        label="完了"
        onLongPressComplete={onLongPressComplete}
      />,
    )

    const button = screen.getByRole('button')

    // Start long press
    fireEvent.mouseDown(button)

    // Move mouse out of the button
    fireEvent.mouseLeave(button)

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Check that callback was not called
    expect(onLongPressComplete).not.toHaveBeenCalled()
  })

  it('supports touch events for mobile devices', () => {
    const onLongPressComplete = vi.fn()
    render(
      <LongPressButton
        color="green"
        icon="✓"
        label="完了"
        onLongPressComplete={onLongPressComplete}
      />,
    )

    const button = screen.getByRole('button')

    // Start touch
    fireEvent.touchStart(button)

    // Fast-forward time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Check if callback was called
    expect(onLongPressComplete).toHaveBeenCalledTimes(1)

    // Reset mock
    onLongPressComplete.mockReset()

    // Test touch end before completion
    fireEvent.touchStart(button)

    // End touch before completion
    fireEvent.touchEnd(button)

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Check that callback was not called
    expect(onLongPressComplete).not.toHaveBeenCalled()
  })
})
