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
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      initializing: false,
      error: null,
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
    it('should sign in user successfully with ADMIN role', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'ADMIN' as const }
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

    it('should reject sign in for STUDENT role', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'STUDENT' as const }
      const mockToken = 'test-token'
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        token: mockToken,
        user: mockUser,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.signIn({ email: 'test@example.com', password: 'password123' })
        } catch {
          // Expected error
        }
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.error).toContain('Access denied')
    })

    it('should reject sign in for user without role', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' }
      const mockToken = 'test-token'
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        token: mockToken,
        user: mockUser,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.signIn({ email: 'test@example.com', password: 'password123' })
        } catch {
          // Expected error
        }
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.error).toContain('Access denied')
    })

    it('should allow sign in for SUPER_ADMIN role', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'SUPER_ADMIN' as const }
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
    it('should restore session from localStorage for ADMIN user', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'ADMIN' as const }
      const mockToken = 'test-token'

      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token: mockToken, user: mockUser } })
      )

      // When user is cached, apiFetch should not be called
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.restoreSession()
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      // apiFetch should not be called when user is cached
      expect(apiFetch).not.toHaveBeenCalled()
    })

    it('should reject session restore for STUDENT user', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'STUDENT' as const }
      const mockToken = 'test-token'

      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token: mockToken, user: mockUser } })
      )

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.restoreSession()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('should fetch user profile when token exists but user is not cached', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'ADMIN' as const }
      const mockToken = 'test-token'

      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token: mockToken } })
      )

      ;(apiFetch as jest.Mock).mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.restoreSession()
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(apiFetch).toHaveBeenCalledWith('/user/profile')
    })

    it('should handle restore session failure', async () => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token: 'invalid-token' } })
      )
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
      // Mock apiFetch for signIn only
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'ADMIN' as const }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        token: 'test-token',
        user: mockUser,
      })

      const { result } = renderHook(() => useAuthStore())

      // First sign in
      await act(async () => {
        await result.current.signIn({ email: 'test@example.com', password: 'password' })
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe('test-token')

      // Then logout
      act(() => {
        result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBeNull()
    })
  })

  describe('clearError', () => {
    it('should clear error message', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Set error by failed sign in
      const error = new Error('Test error')
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(error)

      await act(async () => {
        try {
          await result.current.signIn({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // Expected - signIn throws the error
        }
      })

      // Error should be set in the store (signIn sets error before throwing)
      // Wait a bit for state to update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
