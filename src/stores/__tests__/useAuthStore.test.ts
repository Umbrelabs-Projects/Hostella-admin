import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/stores/useAuthStore'

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  APIException: class APIException extends Error {
    constructor(message: string, public status: number, public details?: Record<string, unknown>) {
      super(message)
    }
  },
  getAuthToken: jest.fn(),
}))

import { apiFetch } from '@/lib/api'

describe('useAuthStore', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    // Reset Zustand store state between tests
    act(() => {
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        initializing: true,
        error: null,
      })
    })
    // Default mock for signIn
    (apiFetch as jest.Mock).mockResolvedValue({
      user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
      token: 'test-token',
    })
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' }
      const mockToken = 'test-token'
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        token: mockToken,
        user: mockUser,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signIn({ email: 'test@example.com', password: 'password123' })
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
      expect(apiFetch).toHaveBeenCalledWith('/auth/login', expect.any(Object))
    })

    it('should handle sign in error', async () => {
      const error = new Error('Invalid credentials')
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.signIn({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // Expected error
        }
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('restoreSession', () => {
    it('should restore session from localStorage', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      const mockToken = 'test-token'

      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ token: mockToken, user: mockUser })
      )

      ;(apiFetch as jest.Mock).mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.restoreSession()
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    it('should handle restore session failure', async () => {
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Not authenticated'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.restoreSession()
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and token on logout', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Set the mock for apiFetch right before signIn
      (apiFetch as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        token: 'test-token',
      })

      // First sign in
      await act(async () => {
        await result.current.signIn({ email: 'test@example.com', password: 'password' })
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error message', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Set error by failed sign in
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'))

      await act(async () => {
        try {
          await result.current.signIn({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // Expected
        }
      })

      expect(result.current.error).toBeTruthy()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
