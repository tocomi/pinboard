import { usePinboard } from '../context/PinboardContext'

export function ToggleCompletedButton() {
  const { completedItems, showCompleted, toggleShowCompleted } = usePinboard()

  if (completedItems.length === 0) {
    return null
  }

  return (
    <button
      type="button"
      onClick={toggleShowCompleted}
      className="mt-4 flex items-center text-blue-600 text-sm hover:text-blue-800"
    >
      {showCompleted ? '完了したアイテムを隠す' : '完了したアイテムを表示'}
      <svg
        className="ml-1 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={showCompleted ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
        />
      </svg>
    </button>
  )
}
