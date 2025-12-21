import { renderHook, act } from '@testing-library/react'
import { useBroadcastStore } from '@/stores/useBroadcastStore'

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  APIException: class APIException extends Error {
    constructor(message: string, public status: number, public details: Record<string, unknown> | undefined) {
      super(message)
    }
  },
}))

import { apiFetch } from '@/lib/api'

describe('useBroadcastStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBroadcastStore())

    expect(result.current.messages).toEqual([])
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(10)
    expect(result.current.totalMessages).toBe(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  describe('fetchMessages', () => {
    it('should fetch messages with pagination', async () => {
      const mockMessages = [
        { id: '1', title: 'Welcome', status: 'sent', recipientType: 'all-members', recipientCount: 10, priority: 'high', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', title: 'Important', status: 'scheduled', recipientType: 'all-members', recipientCount: 10, priority: 'high', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockMessages,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      })

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        await result.current.fetchMessages(1, 10)
      })

      expect(result.current.messages).toEqual(mockMessages)
      expect(result.current.totalMessages).toBe(2)
    })

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch messages')
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        try {
          await result.current.fetchMessages(1, 10)
        } catch {
          // Expected
        }
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('sendMessage', () => {
    it('should send a new message', async () => {
      const newMessage = {
        title: 'Test Message',
        content: 'Test content',
        recipientType: 'all-members' as const,
        priority: 'high' as const,
        scheduledFor: '',
      }
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          ...newMessage,
          status: 'sent',
          recipientCount: 10,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        message: 'Broadcast sent successfully',
      }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        await result.current.sendMessage(newMessage)
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/broadcasts',
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(result.current.messages).toContainEqual(mockResponse.data)
    })
  })

  describe('deleteMessageApi', () => {
    it('should delete a message', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Message deleted successfully',
      })

      const { result } = renderHook(() => useBroadcastStore())

      // Set up initial state with a message
      act(() => {
        result.current.addMessage({
          id: '1',
          title: 'Test',
          content: 'Content',
          recipientType: 'all-members',
          recipientCount: 10,
          priority: 'high',
          status: 'sent',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        })
      })

      await act(async () => {
        await result.current.deleteMessageApi('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/broadcasts/1',
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(result.current.messages).not.toContainEqual(
        expect.objectContaining({ id: '1' })
      )
      expect(result.current.success).toBe('Message deleted successfully')
    })
  })

  describe('resendMessage', () => {
    it('should resend a message', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          title: 'Test',
          content: 'Content',
          recipientType: 'all-members',
          recipientCount: 10,
          priority: 'high',
          status: 'sent',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          sentAt: new Date().toISOString(),
        },
      }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        await result.current.resendMessage('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/broadcasts/1/resend',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('clearError', () => {
    it('should clear error message', async () => {
      const error = new Error('Test error')
      ;(apiFetch as jest.Mock).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        try {
          await result.current.fetchMessages(1, 10)
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

  describe('clearSuccess', () => {
    it('should clear success message', () => {
      const { result } = renderHook(() => useBroadcastStore())

      act(() => {
        result.current.setSuccess('Message sent!')
        expect(result.current.success).toBe('Message sent!')
      })

      act(() => {
        result.current.clearSuccess()
      })

      expect(result.current.success).toBeNull()
    })
  })
})
