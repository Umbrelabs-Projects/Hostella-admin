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
        { id: '1', studentName: 'John', status: 'pending payment', firstName: 'John', lastName: 'Doe', email: 'john@example.com', studentId: '123', phone: '1234567890', gender: 'male', level: '100', school: 'Test', hostelName: 'Test', roomTitle: 'One-in-one', price: '100', emergencyContactName: 'Contact', emergencyContactNumber: '123', relation: 'Parent', hasMedicalCondition: false },
        { id: '2', studentName: 'Jane', status: 'approved', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', studentId: '456', phone: '1234567890', gender: 'female', level: '200', school: 'Test', hostelName: 'Test', roomTitle: 'Two-in-one', price: '200', emergencyContactName: 'Contact', emergencyContactNumber: '123', relation: 'Parent', hasMedicalCondition: false },
      ]
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { bookings: mockBookings, total: 2, page: 1, pageSize: 10 },
      })

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        await result.current.fetchBookings(1, 10)
      })

      // Status values are normalized, so "pending payment" becomes "PENDING_PAYMENT" and "approved" becomes "APPROVED"
      expect(result.current.bookings).toHaveLength(2)
      expect(result.current.bookings[0].id).toBe('1')
      expect(result.current.bookings[0].status).toBe('PENDING_PAYMENT')
      expect(result.current.bookings[1].id).toBe('2')
      expect(result.current.bookings[1].status).toBe('APPROVED')
      expect(result.current.totalBookings).toBe(2)
      expect(result.current.currentPage).toBe(1)
    })

    it('should set loading state during fetch', async () => {
      ;(apiFetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }), 100))
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
      const mockResponse = { 
        success: true,
        data: { bookings: [], total: 0, page: 1, pageSize: 10 }
      }
      ;(apiFetch as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useBookingsStore())

      await act(async () => {
        result.current.setFilters({ search: 'John', status: 'PENDING_PAYMENT' })
        await result.current.fetchBookings(1, 10)
      })

      // Verify fetchBookings was called
      expect(apiFetch).toHaveBeenCalled()
      const callArgs = (apiFetch as jest.Mock).mock.calls
      expect(callArgs.length).toBeGreaterThan(0)
      const url = callArgs[callArgs.length - 1][0] as string
      expect(url).toContain('search=John')
      // API converts internal status format (PENDING_PAYMENT) to API format (pending payment)
      // URL encoding converts spaces to +, so we check for either format
      expect(url).toMatch(/status=(pending\+payment|pending%20payment)/)
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
      const createdBooking = {
        id: '3',
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        status: 'pending payment', // API returns lowercase with spaces
        studentId: '123',
        phone: '1234567890',
        gender: 'male' as const,
        level: '100' as const,
        school: 'Test School',
        hostelName: 'Test Hostel',
        roomTitle: 'One-in-one' as const,
        price: '100',
        emergencyContactName: 'Contact',
        emergencyContactNumber: '1234567890',
        relation: 'Parent',
        hasMedicalCondition: false,
      }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: createdBooking,
        message: 'Booking created successfully',
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
      // Status is normalized to PENDING_PAYMENT
      expect(result.current.bookings[0].status).toBe('PENDING_PAYMENT')
      expect(result.current.bookings[0].id).toBe('3')
    })
  })

  describe('approvePayment', () => {
    it('should approve payment for a booking', async () => {
      const approvedBooking = {
        id: '1',
        status: 'approved',
      }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: approvedBooking,
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
      const updatedBooking = {
        id: '1',
        allocatedRoomNumber: 101,
      }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: updatedBooking,
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
      // First, add a booking with PENDING_PAYMENT status to the store
      const mockBooking = {
        id: '1',
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        status: 'PENDING_PAYMENT' as const,
        studentId: '123',
        phone: '1234567890',
        gender: 'male' as const,
        level: '100' as const,
        school: 'Test School',
        hostelName: 'Test Hostel',
        roomTitle: 'One-in-one' as const,
        price: '100',
        emergencyContactName: 'Contact',
        emergencyContactNumber: '1234567890',
        relation: 'Parent',
        hasMedicalCondition: false,
      }

      ;(apiFetch as jest.Mock).mockResolvedValueOnce({ 
        success: true,
        data: { success: true, message: 'Booking deleted successfully' }
      })

      const { result } = renderHook(() => useBookingsStore())

      // Set up the booking in the store first
      act(() => {
        result.current.setBookings([mockBooking])
      })

      await act(async () => {
        await result.current.deleteBooking('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/bookings/1',
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(result.current.bookings).not.toContainEqual(mockBooking)
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
        gender: 'all',
        roomType: 'all',
      })
      expect(result.current.currentPage).toBe(1)
    })
  })
})
