import { useState } from 'react'
import { usePinboard } from '../context/PinboardContext'

export function ItemForm() {
  const { addItem } = usePinboard()
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState<string>('')
  const [tags, setTags] = useState<string>('')

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

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 flex items-center">
            <label
              htmlFor="deadline-input"
              className="font-medium text-gray-700 text-xs"
            >
              期限（任意）
            </label>
          </div>
          <input
            id="deadline-input"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center">
            <label
              htmlFor="tags-input"
              className="font-medium text-gray-700 text-xs"
            >
              タグ（カンマ区切り）
            </label>
          </div>
          <input
            id="tags-input"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="仕事, 個人, 重要"
            className="w-full rounded-md border border-gray-300 p-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
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
