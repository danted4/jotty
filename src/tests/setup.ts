import '@testing-library/jest-dom'

// Mock localStorage with actual storage behavior
const store: Record<string, string> = {}

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach(key => delete store[key])
  }),
}

global.localStorage = localStorageMock as any

// Mock navigator clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

// Mock window.addEventListener for storage events
window.addEventListener = vi.fn()
window.removeEventListener = vi.fn()