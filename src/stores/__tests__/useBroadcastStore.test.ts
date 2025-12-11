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
        { id: '1', title: 'Welcome', status: 'sent' },
        { id: '2', title: 'Important', status: 'scheduled' },
      ]
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        data: mockMessages,
        total: 2,
        page: 1,
        pageSize: 10,
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
        recipientType: 'all-residents' as const,
        priority: 'high' as const,
      }
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...newMessage,
        status: 'sent',
      })

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        await result.current.sendMessage(newMessage)
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/broadcast/send',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })

  describe('deleteMessageApi', () => {
    it('should delete a message', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        await result.current.deleteMessageApi('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/broadcast/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('resendMessage', () => {
    it('should resend a message', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValueOnce({
        id: '1',
        status: 'sent',
        sentAt: new Date().toISOString(),
      })

      const { result } = renderHook(() => useBroadcastStore())

      await act(async () => {
        await result.current.resendMessage('1')
      })

      expect(apiFetch).toHaveBeenCalledWith(
        '/broadcast/1/resend',
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
