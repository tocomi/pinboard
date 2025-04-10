import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CelebrationEffect } from './components/CelebrationEffect'
import { CompletedItems } from './components/CompletedItems'
import { FloatingButton } from './components/FloatingButton'
import { ItemForm } from './components/ItemForm'
import { ItemList } from './components/ItemList'
import { ToggleCompletedButton } from './components/ToggleCompletedButton'
import { PinboardProvider, usePinboard } from './context/PinboardContext'
import { cn } from './lib/utils'

function AppContent() {
  const { celebratingItemId, setCelebratingItemId } = usePinboard()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const openForm = () => setIsFormOpen(true)
  const closeForm = () => setIsFormOpen(false)

  return (
    <>
      <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
        <header>
          <h1 className="mb-6 text-center font-bold text-4xl">Pinboard</h1>
        </header>
        <main className="flex w-full flex-col items-center">
          <ItemList />
          <ToggleCompletedButton />
          <CompletedItems />
        </main>
      </div>

      {/* フローティングボタン */}
      <FloatingButton
        onClick={openForm}
        isHidden={isFormOpen}
        label="アイテムを追加"
      >
        <Plus size={24} aria-hidden="true" />
      </FloatingButton>

      {/* フォームコンテナ */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-20 flex w-full justify-center p-4 transition-all duration-300 ease-in-out',
          isFormOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0',
        )}
      >
        <div className="w-full max-w-md">
          <ItemForm onClose={closeForm} />
        </div>
      </div>

      {celebratingItemId && (
        <CelebrationEffect onComplete={() => setCelebratingItemId(null)} />
      )}
    </>
  )
}

export function App() {
  return (
    <PinboardProvider>
      <AppContent />
    </PinboardProvider>
  )
}
