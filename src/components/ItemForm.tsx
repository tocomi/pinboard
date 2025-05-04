import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { usePinboard } from '../context/PinboardContext'
import type { PinboardItem } from '../types'

// タグのプリセット
const TAG_PRESETS = ['ToDo', 'やりたい', '目標']

interface ItemFormProps {
  onClose?: () => void
  item?: PinboardItem // 編集対象（新規時はundefined）
  isEdit?: boolean // 編集モードかどうか
  onSave?: (item: PinboardItem) => void // 編集保存時のコールバック
}

export function ItemForm({
  onClose,
  item,
  isEdit = false,
  onSave,
}: ItemFormProps) {
  const { addItem, updateItem } = usePinboard()
  const [title, setTitle] = useState(item?.title ?? '')
  const [deadline, setDeadline] = useState<string>(
    item?.deadline ? new Date(item.deadline).toISOString().slice(0, 10) : '',
  )
  const [selectedTag, setSelectedTag] = useState<string>(
    item?.tags?.[0] ?? TAG_PRESETS[0],
  )

  // 編集時は初期値を再セット
  useEffect(() => {
    if (isEdit && item) {
      setTitle(item.title)
      setDeadline(
        item.deadline ? new Date(item.deadline).toISOString().slice(0, 10) : '',
      )
      setSelectedTag(item.tags?.[0] ?? TAG_PRESETS[0])
    }
  }, [isEdit, item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const deadlineTimestamp = deadline
      ? new Date(deadline).getTime()
      : undefined

    if (isEdit && item) {
      const updated: PinboardItem = {
        ...item,
        title,
        deadline: deadlineTimestamp,
        tags: [selectedTag],
      }
      if (onSave) {
        onSave(updated)
      } else {
        updateItem(updated)
      }
      if (onClose) onClose()
      return
    }

    addItem({
      title,
      tags: [selectedTag],
      deadline: deadlineTimestamp,
    })
    setTitle('')
    setDeadline('')
    setSelectedTag(TAG_PRESETS[0])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mb-6 w-full max-w-md rounded-lg bg-white p-4 pt-10 shadow-md"
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
          {isEdit ? '保存' : '追加'}
        </button>
      </div>
    </form>
  )
}
