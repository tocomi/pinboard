import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import '@testing-library/jest-dom'

// Extend Vitest's expect with Jest DOM matchers
expect.extend({
  // This is just a placeholder to make the linter happy
  // The actual matchers are imported from '@testing-library/jest-dom'
})

// Automatically cleanup after each test
afterEach(() => {
  cleanup()
})
