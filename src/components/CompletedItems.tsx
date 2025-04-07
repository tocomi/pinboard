import { usePinboard } from '../context/PinboardContext'

export function CompletedItems() {
  const { completedItems, deleteItem, showCompleted } = usePinboard()

  if (!showCompleted || completedItems.length === 0) {
    return null
  }

  return (
    <div className="mt-6 w-full max-w-md">
      <h2 className="mb-3 font-medium text-gray-700 text-lg">
        完了したアイテム
      </h2>

      <div className="space-y-2">
        {completedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-gray-100 p-3"
          >
            <div className="flex-1">
              <p className="text-gray-500 line-through">{item.title}</p>

              {item.tags && item.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-600 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => deleteItem(item.id)}
              className="ml-2 h-6 w-6 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
