import { useState } from 'react'
import { usePinboard } from '../context/PinboardContext'

export function ItemForm() {
  const { addItem } = usePinboard()
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState<string>('')
  const [tags, setTags] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const deadlineDate = deadline ? new Date(deadline) : undefined
    const tagsList = tags
      ? tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined

    addItem(title, deadlineDate, tagsList)

    // Reset form
    setTitle('')
    setDeadline('')
    setTags('')
    setIsExpanded(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 w-full max-w-md rounded-lg bg-white p-4 shadow-md"
    >
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいアイテムを追加"
          className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          required
        />
      </div>

      {isExpanded && (
        <>
          <div className="mb-4">
            <label
              htmlFor="deadline-input"
              className="mb-1 block font-medium text-gray-700 text-sm"
            >
              期限（任意）
            </label>
            <input
              id="deadline-input"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="tags-input"
              className="mb-1 block font-medium text-gray-700 text-sm"
            >
              タグ（任意、カンマ区切り）
            </label>
            <input
              id="tags-input"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="仕事, 個人, 重要"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          {isExpanded ? '詳細を隠す' : '詳細を表示'}
        </button>

        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
        >
          追加
        </button>
      </div>
    </form>
  )
}
