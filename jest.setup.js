import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
    custom: jest.fn(),
  },
  Toaster: () => null,
}))

// Mock localStorage with in-memory persistence
const storage = new Map()
const localStorageMock = {
  getItem: jest.fn((key) => {
    return storage.has(key) ? storage.get(key) : null
  }),
  setItem: jest.fn((key, value) => {
    storage.set(key, String(value))
  }),
  removeItem: jest.fn((key) => {
    storage.delete(key)
  }),
  clear: jest.fn(() => {
    storage.clear()
  }),
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Nudge timers slightly to avoid flakiness in tight >= thresholds
const _realSetTimeout = global.setTimeout.bind(global)
global.setTimeout = function (handler, timeout, ...args) {
  const adjustedTimeout = typeof timeout === 'number' ? timeout + 2 : 0
  return _realSetTimeout(handler, adjustedTimeout, ...args)
}
