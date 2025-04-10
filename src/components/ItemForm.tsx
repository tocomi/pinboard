import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { useState } from 'react'
import { usePinboard } from '../context/PinboardContext'
import { cn } from '../lib/utils'

// タグのプリセット
const TAG_PRESETS = ['ToDo', 'やりたい', '目標']

interface ItemFormProps {
  onClose?: () => void
}

export function ItemForm({ onClose }: ItemFormProps) {
  const { addItem } = usePinboard()
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>(TAG_PRESETS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    // Convert date string to Unix timestamp (milliseconds since epoch)
    const deadlineTimestamp = deadline
      ? new Date(deadline).getTime()
      : undefined

    addItem({
      title,
      tags: [selectedTag],
      deadline: deadlineTimestamp,
    })

    // Reset form
    setTitle('')
    setDeadline('')
    setSelectedTag(TAG_PRESETS[0])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mb-6 w-full max-w-md rounded-lg bg-white p-4 pt-10 shadow-md"
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-1 right-3 flex h-8 w-8 items-center justify-center',
            'rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700',
            'cursor-pointer focus:outline-none',
          )}
          aria-label="フォームを閉じる"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
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
          <div>
            <div className="mb-1 flex items-center">
              <label
                htmlFor="tag-select"
                className="font-medium text-gray-700 text-xs"
              >
                タグ（必須）
              </label>
            </div>
            <Select value={selectedTag} onValueChange={setSelectedTag} required>
              <SelectTrigger id="tag-select" className="w-full">
                <SelectValue placeholder="タグを選択" />
              </SelectTrigger>
              <SelectContent>
                {TAG_PRESETS.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
        >
          追加
        </button>
      </div>
    </form>
  )
}
