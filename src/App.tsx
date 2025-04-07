import { CompletedItems } from './components/CompletedItems'
import { ItemForm } from './components/ItemForm'
import { ItemList } from './components/ItemList'
import { ToggleCompletedButton } from './components/ToggleCompletedButton'
import { PinboardProvider } from './context/PinboardContext'

export function App() {
  return (
    <PinboardProvider>
      <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 pb-32">
        <header>
          <h1 className="mb-6 text-center font-bold text-4xl">Pinboard</h1>
        </header>
        <main className="flex w-full max-w-md flex-col items-center">
          <ItemList />
          <ToggleCompletedButton />
          <CompletedItems />
        </main>
        <div className="fixed right-0 bottom-0 left-0 flex w-full justify-center bg-gray-100 p-4">
          <div className="w-full max-w-md">
            <ItemForm />
          </div>
        </div>
      </div>
    </PinboardProvider>
  )
}
