import { renderHook, act } from '@testing-library/react'
import { useNotificationsStore } from '@/stores/useNotificationsStore'
import type { Notification } from '@/types/notifications'

describe('useNotificationsStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useNotificationsStore())
    act(() => {
      result.current.deleteAll()
    })
  })

  it('should initialize with notifications', () => {
    const { result } = renderHook(() => useNotificationsStore())

    expect(result.current.notifications).toBeDefined()
    expect(Array.isArray(result.current.notifications)).toBe(true)
  })

  describe('addNotification', () => {
    it('should add a new notification', () => {
      const { result } = renderHook(() => useNotificationsStore())
      const initialCount = result.current.notifications.length

      const newNotification: Notification = {
        id: 999,
        type: 'new_booking',
        title: 'Test Notification',
        description: 'This is a test notification',
        time: 'Just now',
        read: false,
      }

      act(() => {
        result.current.addNotification(newNotification)
      })

      expect(result.current.notifications.length).toBe(initialCount + 1)
      expect(result.current.notifications[0]).toEqual(newNotification)
    })

    it('should add notification at the beginning of the list', () => {
      const { result } = renderHook(() => useNotificationsStore())

      const notification1: Notification = {
        id: 1001,
        type: 'payment_made',
        title: 'First Notification',
        description: 'First',
        time: '1 min ago',
        read: false,
      }

      const notification2: Notification = {
        id: 1002,
        type: 'new_user',
        title: 'Second Notification',
        description: 'Second',
        time: 'Just now',
        read: false,
      }

      act(() => {
        result.current.addNotification(notification1)
      })

      act(() => {
        result.current.addNotification(notification2)
      })

      expect(result.current.notifications[0]).toEqual(notification2)
      expect(result.current.notifications[1]).toEqual(notification1)
    })

    it('should add notifications of different types', () => {
      const { result } = renderHook(() => useNotificationsStore())

      const types: Notification['type'][] = [
        'new_booking',
        'payment_made',
        'maintenance_request',
        'new_user',
        'system_alert',
      ]

      types.forEach((type, index) => {
        const notification: Notification = {
          id: 2000 + index,
          type,
          title: `${type} notification`,
          description: `Test ${type}`,
          time: 'Now',
          read: false,
        }

        act(() => {
          result.current.addNotification(notification)
        })
      })

      expect(result.current.notifications.length).toBeGreaterThanOrEqual(types.length)
    })
  })

  describe('markAsRead', () => {
    it('should mark a notification as read', () => {
      const { result } = renderHook(() => useNotificationsStore())

      const notification: Notification = {
        id: 3001,
        type: 'new_booking',
        title: 'Unread Notification',
        description: 'Should be marked as read',
        time: 'Now',
        read: false,
      }

      act(() => {
        result.current.addNotification(notification)
      })

      const unreadNotification = result.current.notifications.find((n) => n.id === 3001)
      expect(unreadNotification?.read).toBe(false)

      act(() => {
        result.current.markAsRead(3001)
      })

      const readNotification = result.current.notifications.find((n) => n.id === 3001)
      expect(readNotification?.read).toBe(true)
    })

    it('should not affect other notifications when marking one as read', () => {
      const { result } = renderHook(() => useNotificationsStore())

      const notification1: Notification = {
        id: 4001,
        type: 'payment_made',
        title: 'Notification 1',
        description: 'First notification',
        time: 'Now',
        read: false,
      }

      const notification2: Notification = {
        id: 4002,
        type: 'new_user',
        title: 'Notification 2',
        description: 'Second notification',
        time: 'Now',
        read: false,
      }

      act(() => {
        result.current.addNotification(notification1)
        result.current.addNotification(notification2)
      })

      act(() => {
        result.current.markAsRead(4001)
      })

      const notif1 = result.current.notifications.find((n) => n.id === 4001)
      const notif2 = result.current.notifications.find((n) => n.id === 4002)

      expect(notif1?.read).toBe(true)
      expect(notif2?.read).toBe(false)
    })

    it('should do nothing if notification id does not exist', () => {
      const { result } = renderHook(() => useNotificationsStore())
      const initialNotifications = result.current.notifications

      act(() => {
        result.current.markAsRead(99999)
      })

      expect(result.current.notifications).toEqual(initialNotifications)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotificationsStore())

      const notifications: Notification[] = [
        { id: 5001, type: 'new_booking', title: 'N1', description: 'D1', time: 'Now', read: false },
        { id: 5002, type: 'payment_made', title: 'N2', description: 'D2', time: 'Now', read: false },
        { id: 5003, type: 'new_user', title: 'N3', description: 'D3', time: 'Now', read: false },
      ]

      notifications.forEach((notification) => {
        act(() => {
          result.current.addNotification(notification)
        })
      })

      const unreadCount = result.current.notifications.filter((n) => !n.read).length
      expect(unreadCount).toBeGreaterThan(0)

      act(() => {
        result.current.markAllAsRead()
      })

      const allRead = result.current.notifications.every((n) => n.read === true)
      expect(allRead).toBe(true)
    })

    it('should work even if some notifications are already read', () => {
      const { result } = renderHook(() => useNotificationsStore())

      act(() => {
        result.current.addNotification({
          id: 6001,
          type: 'new_booking',
          title: 'Read',
          description: 'Already read',
          time: 'Now',
          read: true,
        })
        result.current.addNotification({
          id: 6002,
          type: 'payment_made',
          title: 'Unread',
          description: 'Not read yet',
          time: 'Now',
          read: false,
        })
      })

      act(() => {
        result.current.markAllAsRead()
      })

      expect(result.current.notifications.every((n) => n.read)).toBe(true)
    })
  })

  describe('deleteNotification', () => {
    it('should delete a notification by id', () => {
      const { result } = renderHook(() => useNotificationsStore())

      const notification: Notification = {
        id: 7001,
        type: 'maintenance_request',
        title: 'To be deleted',
        description: 'This will be deleted',
        time: 'Now',
        read: false,
      }

      act(() => {
        result.current.addNotification(notification)
      })

      const exists = result.current.notifications.some((n) => n.id === 7001)
      expect(exists).toBe(true)

      act(() => {
        result.current.deleteNotification(7001)
      })

      const stillExists = result.current.notifications.some((n) => n.id === 7001)
      expect(stillExists).toBe(false)
    })

    it('should not affect other notifications when deleting one', () => {
      const { result } = renderHook(() => useNotificationsStore())

      act(() => {
        result.current.addNotification({
          id: 8001,
          type: 'new_booking',
          title: 'Keep this',
          description: 'Should remain',
          time: 'Now',
          read: false,
        })
        result.current.addNotification({
          id: 8002,
          type: 'payment_made',
          title: 'Delete this',
          description: 'Should be removed',
          time: 'Now',
          read: false,
        })
      })

      const initialCount = result.current.notifications.length

      act(() => {
        result.current.deleteNotification(8002)
      })

      expect(result.current.notifications.length).toBe(initialCount - 1)
      expect(result.current.notifications.some((n) => n.id === 8001)).toBe(true)
      expect(result.current.notifications.some((n) => n.id === 8002)).toBe(false)
    })

    it('should do nothing if notification id does not exist', () => {
      const { result } = renderHook(() => useNotificationsStore())
      const initialCount = result.current.notifications.length

      act(() => {
        result.current.deleteNotification(99999)
      })

      expect(result.current.notifications.length).toBe(initialCount)
    })
  })

  describe('deleteAll', () => {
    it('should delete all notifications', () => {
      const { result } = renderHook(() => useNotificationsStore())

      act(() => {
        result.current.addNotification({
          id: 9001,
          type: 'new_booking',
          title: 'N1',
          description: 'D1',
          time: 'Now',
          read: false,
        })
        result.current.addNotification({
          id: 9002,
          type: 'payment_made',
          title: 'N2',
          description: 'D2',
          time: 'Now',
          read: false,
        })
      })

      expect(result.current.notifications.length).toBeGreaterThan(0)

      act(() => {
        result.current.deleteAll()
      })

      expect(result.current.notifications.length).toBe(0)
      expect(result.current.notifications).toEqual([])
    })

    it('should work even if notifications array is already empty', () => {
      const { result } = renderHook(() => useNotificationsStore())

      act(() => {
        result.current.deleteAll()
      })

      expect(result.current.notifications.length).toBe(0)

      act(() => {
        result.current.deleteAll()
      })

      expect(result.current.notifications.length).toBe(0)
    })
  })

  describe('notification types', () => {
    it('should handle all notification types correctly', () => {
      const { result } = renderHook(() => useNotificationsStore())

      const types: Array<Notification['type']> = [
        'new_booking',
        'payment_made',
        'maintenance_request',
        'new_user',
        'system_alert',
      ]

      types.forEach((type, index) => {
        act(() => {
          result.current.addNotification({
            id: 10000 + index,
            type,
            title: `${type} notification`,
            description: `Test ${type}`,
            time: 'Now',
            read: false,
          })
        })
      })

      types.forEach((type) => {
        const hasType = result.current.notifications.some((n) => n.type === type)
        expect(hasType).toBe(true)
      })
    })
  })
})
