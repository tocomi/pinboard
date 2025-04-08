import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CelebrationEffect } from './components/CelebrationEffect'
import { CompletedItems } from './components/CompletedItems'
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
        <main className="flex w-full max-w-md flex-col items-center">
          <ItemList />
          <ToggleCompletedButton />
          <CompletedItems />
        </main>
      </div>

      {/* フローティングボタン */}
      <button
        type="button"
        onClick={openForm}
        className={cn(
          '-translate-x-1/2 fixed bottom-6 left-1/2 z-10 flex h-14 w-14 items-center justify-center',
          'rounded-full bg-blue-500 text-white shadow-lg transition-all hover:bg-blue-600',
          'focus:outline-none',
          isFormOpen ? 'scale-0' : 'scale-100',
        )}
        aria-label="アイテムを追加"
      >
        <Plus size={24} aria-hidden="true" />
      </button>

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
