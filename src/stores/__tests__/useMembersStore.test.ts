import { renderHook, act } from '@testing-library/react'
import { useMembersStore } from '@/stores/useMembersStore'
import { StudentBooking } from '@/types/booking'

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  APIException: class APIException extends Error {
    constructor(message: string, public status: number, public details?: Record<string, unknown>) {
      super(message)
    }
  },
}))

// Note: transformBooking will be called by useMembersStore
// The test data will be transformed to StudentBooking structure

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
      // Mock data that will be transformed by transformBooking
      // transformBooking expects either nested structure or flat StudentBooking
      const mockMembers = [
        {
          id: '1',
          bookingId: 'BK-001',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          level: '100',
          school: 'Test School',
          studentId: '12345',
          phone: '0241234567',
          hostelName: 'Test Hostel',
          roomTitle: 'One-in-one',
          price: '100',
          emergencyContactName: 'Contact',
          emergencyContactNumber: '0241234567',
          relation: 'Parent',
          hasMedicalCondition: false,
          status: 'approved',
          allocatedRoomNumber: null,
          floorNumber: null,
        },
        {
          id: '2',
          bookingId: 'BK-002',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'female',
          level: '200',
          school: 'Test School',
          studentId: '67890',
          phone: '0241234568',
          hostelName: 'Test Hostel',
          roomTitle: 'Two-in-one',
          price: '200',
          emergencyContactName: 'Contact',
          emergencyContactNumber: '0241234568',
          relation: 'Parent',
          hasMedicalCondition: false,
          status: 'approved',
          allocatedRoomNumber: null,
          floorNumber: null,
        },
      ] as StudentBooking[]
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockMembers,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      })

      const { result } = renderHook(() => useMembersStore())

      await act(async () => {
        await result.current.fetchMembers(1, 10)
      })

      // After transformation, members will have full StudentBooking structure
      // transformBooking will create a StudentBooking from the mock data
      expect(result.current.members).toHaveLength(2)
      expect(result.current.members[0].id).toBe('1')
      expect(result.current.members[0].email).toBe('john@example.com')
      // transformBooking will set defaults for missing fields
      expect(result.current.members[0]).toHaveProperty('firstName')
      expect(result.current.members[0]).toHaveProperty('lastName')
      expect(result.current.members[0]).toHaveProperty('status')
      expect(result.current.members[1].id).toBe('2')
      expect(result.current.members[1].email).toBe('jane@example.com')
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
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: updatedMember,
      })

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
