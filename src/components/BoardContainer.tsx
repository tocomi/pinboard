import { useMemo } from 'react'
import { usePinboard } from '../context/PinboardContext'
import { TagBoard } from './TagBoard'

export function BoardContainer() {
  const { items } = usePinboard()

  // タグごとにアイテムをグループ化
  const itemsByTag = useMemo(() => {
    const groupedItems: Record<string, typeof items> = {}

    for (const item of items) {
      if (item.tags && item.tags.length > 0) {
        const tag = item.tags[0] // 最初のタグを使用
        if (!groupedItems[tag]) {
          groupedItems[tag] = []
        }
        groupedItems[tag].push(item)
      }
    }

    return groupedItems
  }, [items])

  // 利用可能なすべてのタグを取得
  const allTags = useMemo(() => {
    return Object.keys(itemsByTag)
  }, [itemsByTag])

  if (allTags.length === 0) {
    return (
      <p className="mt-4 text-center text-gray-500 text-lg">
        アイテムがありません
      </p>
    )
  }

  return (
    <div className="flex w-full max-w-full snap-x justify-center gap-4 overflow-x-auto pb-4">
      {allTags.map((tag) => (
        <div key={tag} className="flex-shrink-0 snap-center">
          <TagBoard tag={tag} items={itemsByTag[tag]} />
        </div>
      ))}
    </div>
  )
}
