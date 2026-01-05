// Mock must be at the very top before any imports
jest.mock('@/lib/api')

import { renderHook, RenderHookResult } from '@testing-library/react'
import { act } from 'react'
import { useAuthStore, type AuthState } from '@/stores/useAuthStore'
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
      initializing: true,
      error: null,
    });
    // Default mock for signIn
    (apiFetch as jest.Mock).mockResolvedValue({
      user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
      token: 'test-token',
    })
  })

  it('should initialize with default state', () => {
    const hook: RenderHookResult<AuthState, any> = renderHook(() => useAuthStore()) as any

    expect(hook.result.current.user).toBeNull()
    expect(hook.result.current.isAuthenticated).toBe(false)
    expect(hook.result.current.loading).toBe(false)
    expect(hook.result.current.error).toBeNull()
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' }
      const mockToken = 'test-token'
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        token: mockToken,
        user: mockUser,
      })

      const hook: RenderHookResult<AuthState, any> = renderHook(() => useAuthStore()) as any

      await act(async () => {
        await hook.result.current.signIn({ email: 'test@example.com', password: 'password123' })
      })

      expect(hook.result.current.user).toEqual(mockUser)
      expect(hook.result.current.isAuthenticated).toBe(true)
      expect(hook.result.current.error).toBeNull()
      expect(apiFetch).toHaveBeenCalledWith('/auth/login', expect.any(Object))
    })

    it('should handle sign in error', async () => {
      const error = new Error('Invalid credentials')
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(error)

      const hook: RenderHookResult<AuthState, any> = renderHook(() => useAuthStore()) as any

      await act(async () => {
        try {
          await hook.result.current.signIn({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // Expected error
        }
      })

      expect(hook.result.current.isAuthenticated).toBe(false)
      expect(hook.result.current.error).toBeTruthy()
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

      const hook: RenderHookResult<AuthState, any> = renderHook(() => useAuthStore()) as any

      await act(async () => {
        await hook.result.current.restoreSession()
      })

      expect(hook.result.current.isAuthenticated).toBe(true)
      expect(hook.result.current.user).toEqual(mockUser)
    })

    it('should handle restore session failure', async () => {
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Not authenticated'))

      const hook: RenderHookResult<AuthState, any> = renderHook(() => useAuthStore()) as any

      await act(async () => {
        await hook.result.current.restoreSession()
      })

      expect(hook.result.current.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and token on logout', async () => {
      const hook: RenderHookResult<AuthState, any> = renderHook(() => useAuthStore()) as any

      // Set the mock for apiFetch right before signIn
      (apiFetch as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        token: 'test-token',
      })

      // First sign in
      await act(async () => {
        await hook.result.current.signIn({ email: 'test@example.com', password: 'password' })
      })

      expect(hook.result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        hook.result.current.signOut()
      })

      expect(hook.result.current.user).toBeNull()
      expect(hook.result.current.isAuthenticated).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error message', async () => {
      const hook: RenderHookResult<AuthState, any> = renderHook(() => useAuthStore()) as any

      // Set error by failed sign in
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'))

      await act(async () => {
        try {
          await hook.result.current.signIn({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // Expected
        }
      })

      expect(hook.result.current.error).toBeTruthy()

      act(() => {
        hook.result.current.clearError()
      })

      expect(hook.result.current.error).toBeNull()
    })
  })
})
