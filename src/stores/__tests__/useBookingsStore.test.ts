import { renderHook, act } from '@testing-library/react'
import { useBookingsStore } from '@/stores/useBookingsStore'
import type { StudentBooking } from '@/types/booking'

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  APIException: class APIException extends Error {
    constructor(message: string, public status: number, public details?: Record<string, unknown>) {
      super(message)
    }
  },
}))

import { apiFetch } from '@/lib/api'

describe('useBookingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBookingsStore())

    expect(result.current.bookings).toEqual([])
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(10)
    expect(result.current.totalBookings).toBe(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  describe('fetchBookings', () => {
    it('should fetch bookings with pagination', async () => {
      const mockBookings = [
        { id: '1', studentName: 'John', status: 'pending' },
        { id: '2', studentName: 'Jane', status: 'approved' },
      ]
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        data: mockBookings,
        total: 2,
        page: 1,
        pageSize: 10,
      })

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        await result.current.fetchBookings(1, 10)
      })

      expect(result.current.bookings).toEqual(mockBookings)
      expect(result.current.totalBookings).toBe(2)
      expect(result.current.currentPage).toBe(1)
    })

    it('should set loading state during fetch', async () => {
      ;(apiFetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: [], total: 0 }), 100))
      )

      const { result } = renderHook(() => useBookingsStore())

      act(() => {
        result.current.fetchBookings(1, 10)
      })

      // Loading should be true initially (before the promise resolves)
      expect(result.current.loading).toBe(true)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
      })

      expect(result.current.loading).toBe(false)
    })

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch')
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        try {
          await result.current.fetchBookings(1, 10)
        } catch {
          // Expected
        }
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should build query string with filters', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({ data: [], total: 0 })

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        result.current.setFilters({ search: 'John', status: 'pending' })
        await result.current.fetchBookings(1, 10)
      })

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=John'),
        expect.any(Object)
      )
    })
  })

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const newBooking: Partial<StudentBooking> = {
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        status: 'pending payment',
      }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        id: '3',
        ...newBooking,
      })

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        await result.current.createBooking(newBooking)
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/bookings',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newBooking),
        })
      )
    })
  })

  describe('approvePayment', () => {
    it('should approve payment for a booking', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        id: '1',
        status: 'approved',
      })

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        await result.current.approvePayment('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/bookings/1/approve-payment',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('assignRoom', () => {
    it('should assign room to a booking', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        id: '1',
        roomNumber: 101,
      })

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        await result.current.assignRoom('1', 101)
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/bookings/1/assign-room',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ roomNumber: 101 }),
        })
      )
    })
  })

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        await result.current.deleteBooking('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/bookings/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('setFilters', () => {
    it('should update filters and reset page', () => {
      const { result } = renderHook(() => useBookingsStore())

      act(() => {
        result.current.setCurrentPage(5)
        result.current.setFilters({ search: 'John', status: 'pending' })
      })

      expect(result.current.filters).toEqual({
        search: 'John',
        status: 'pending',
        gender: undefined,
        roomType: undefined,
      })
      expect(result.current.currentPage).toBe(1)
    })
  })
})
