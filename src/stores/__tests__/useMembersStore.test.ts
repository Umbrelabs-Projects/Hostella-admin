import { renderHook, act } from '@testing-library/react'
import { useMembersStore } from '@/stores/useMembersStore'

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  APIException: class APIException extends Error {
    constructor(message: string, public status: number, public details?: Record<string, unknown>) {
      super(message)
    }
  },
}))

import { apiFetch } from '@/lib/api'

describe('useMembersStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMembersStore())

    expect(result.current.members).toEqual([])
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(10)
    expect(result.current.totalMembers).toBe(0)
    expect(result.current.loading).toBe(false)
  })

  describe('fetchMembers', () => {
    it('should fetch members with pagination', async () => {
      const mockMembers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ]
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        data: mockMembers,
        total: 2,
        page: 1,
        pageSize: 10,
      })

      const { result } = renderHook(() => useMembersStore())

      await act(async () => {
        await result.current.fetchMembers(1, 10)
      })

      expect(result.current.members).toEqual(mockMembers)
      expect(result.current.totalMembers).toBe(2)
    })

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch members')
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useMembersStore())

      await act(async () => {
        try {
          await result.current.fetchMembers(1, 10)
        } catch {
          // Expected
        }
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('updateMemberApi', () => {
    it('should update member information', async () => {
      const updatedMember = { id: '1', firstName: 'John', lastName: 'Updated' }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce(updatedMember)

      const { result } = renderHook(() => useMembersStore())

      await act(async () => {
        await result.current.updateMemberApi('1', { firstName: 'John', lastName: 'Updated' })
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/members/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ firstName: 'John', lastName: 'Updated' }),
        })
      )
    })
  })

  describe('deleteMember', () => {
    it('should delete a member', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useMembersStore())

      await act(async () => {
        await result.current.deleteMember('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/members/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('setCurrentPage', () => {
    it('should update current page', () => {
      const { result } = renderHook(() => useMembersStore())

      act(() => {
        result.current.setCurrentPage(2)
      })

      expect(result.current.currentPage).toBe(2)
    })
  })

  describe('setFilters', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useMembersStore())

      act(() => {
        result.current.setFilters({ search: 'John' })
      })

      expect(result.current.filters.search).toBe('John')
      expect(result.current.currentPage).toBe(1)
    })
  })
})
