// Runs before every test file (see "test.setupFiles" in vite.config.js).
import '@testing-library/jest-dom/vitest' // adds matchers like toBeInTheDocument()
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup() // unmount anything a test rendered
  localStorage.clear()
  sessionStorage.clear()
})
