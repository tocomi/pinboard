import { createContext, useContext } from 'react'
import type { PinboardContextType } from './usePinboardState'
import { usePinboardState } from './usePinboardState'

const PinboardContext = createContext<PinboardContextType | undefined>(
  undefined,
)

export function usePinboard() {
  const context = useContext(PinboardContext)
  if (context === undefined) {
    throw new Error('usePinboard must be used within a PinboardProvider')
  }
  return context
}

export function PinboardProvider({ children }: { children: React.ReactNode }) {
  const value = usePinboardState()
  return (
    <PinboardContext.Provider value={value}>
      {children}
    </PinboardContext.Provider>
  )
}
