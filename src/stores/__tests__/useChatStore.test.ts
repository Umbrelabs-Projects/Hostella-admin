import { renderHook, act } from '@testing-library/react'
import { useChatStore } from '@/stores/useChatStore'
import * as chatSocket from '@/lib/chatSocket'

// Mock the chat socket
jest.mock('@/lib/chatSocket', () => ({
  sendChatSocket: jest.fn(),
}))

describe('useChatStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useChatStore())

    expect(result.current.currentChatId).toBeNull()
    expect(result.current.chatsInfo).toBeDefined()
    expect(Object.keys(result.current.chatsInfo).length).toBeGreaterThan(0)
    expect(result.current.messages).toBeDefined()
    expect(result.current.replying).toBeNull()
    expect(result.current.contextMenu).toBeNull()
    expect(result.current.isRecording).toBe(false)
    expect(result.current.showAttachmentMenu).toBe(false)
    expect(result.current.playingVoiceId).toBeNull()
  })

  describe('setCurrentChat', () => {
    it('should set current chat id', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setCurrentChat('1')
      })

      expect(result.current.currentChatId).toBe('1')
    })

    it('should clear current chat id when set to null', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setCurrentChat('1')
      })

      expect(result.current.currentChatId).toBe('1')

      act(() => {
        result.current.setCurrentChat(null)
      })

      expect(result.current.currentChatId).toBeNull()
    })
  })

  describe('setMessages', () => {
    it('should add messages to a chat', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const initialMessageCount = result.current.messages[chatId]?.length || 0

      const newMessage = {
        id: 'test-1',
        sender: 'admin' as const,
        text: 'Test message',
        timestamp: '10:00 AM',
        type: 'text' as const,
      }

      act(() => {
        result.current.setMessages(chatId, newMessage)
      })

      expect(result.current.messages[chatId].length).toBe(initialMessageCount + 1)
      expect(result.current.messages[chatId]).toContainEqual(newMessage)
    })

    it('should add multiple messages at once', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const initialMessageCount = result.current.messages[chatId]?.length || 0

      const messages = [
        { id: 'test-1', sender: 'admin' as const, text: 'Message 1', timestamp: '10:00 AM', type: 'text' as const },
        { id: 'test-2', sender: 'student' as const, text: 'Message 2', timestamp: '10:01 AM', type: 'text' as const },
      ]

      act(() => {
        result.current.setMessages(chatId, ...messages)
      })

      expect(result.current.messages[chatId].length).toBe(initialMessageCount + 2)
    })
  })

  describe('sendMessage', () => {
    it('should send a text message', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const initialMessageCount = result.current.messages[chatId]?.length || 0

      act(() => {
        result.current.sendMessage(chatId, 'Hello, this is a test message')
      })

      expect(result.current.messages[chatId].length).toBe(initialMessageCount + 1)
      const lastMessage = result.current.messages[chatId][result.current.messages[chatId].length - 1]
      expect(lastMessage.text).toBe('Hello, this is a test message')
      expect(lastMessage.sender).toBe('admin')
      expect(lastMessage.type).toBe('text')
      expect(chatSocket.sendChatSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Hello, this is a test message',
          sender: 'admin',
          type: 'text',
          chatId,
        })
      )
    })

    it('should send a message with reply', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const replyToMessage = {
        id: '1',
        sender: 'student' as const,
        text: 'Original message',
        timestamp: '9:00 AM',
        type: 'text' as const,
      }

      act(() => {
        result.current.sendMessage(chatId, 'Reply message', replyToMessage)
      })

      const lastMessage = result.current.messages[chatId][result.current.messages[chatId].length - 1]
      expect(lastMessage.replyTo).toBeDefined()
      expect(lastMessage.replyTo?.id).toBe('1')
      expect(lastMessage.replyTo?.text).toBe('Original message')
    })

    it('should clear replying state after sending', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const replyToMessage = {
        id: '1',
        sender: 'student' as const,
        text: 'Original message',
        timestamp: '9:00 AM',
        type: 'text' as const,
      }

      act(() => {
        result.current.setReplying(replyToMessage)
      })

      expect(result.current.replying).toEqual(replyToMessage)

      act(() => {
        result.current.sendMessage(chatId, 'Reply message', replyToMessage)
      })

      expect(result.current.replying).toBeNull()
    })
  })

  describe('sendVoice', () => {
    it('should send a voice message', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const duration = 15
      const initialMessageCount = result.current.messages[chatId]?.length || 0

      act(() => {
        result.current.sendVoice(chatId, duration, null)
      })

      expect(result.current.messages[chatId].length).toBe(initialMessageCount + 1)
      const lastMessage = result.current.messages[chatId][result.current.messages[chatId].length - 1]
      expect(lastMessage.type).toBe('voice')
      expect(lastMessage.voiceDuration).toBe(duration)
      expect(lastMessage.sender).toBe('admin')
      expect(chatSocket.sendChatSocket).toHaveBeenCalled()
    })

    it('should clear recording state after sending voice', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'

      act(() => {
        result.current.setRecording(true)
      })

      expect(result.current.isRecording).toBe(true)

      act(() => {
        result.current.sendVoice(chatId, 10, null)
      })

      expect(result.current.isRecording).toBe(false)
    })
  })

  describe('sendFile', () => {
    it('should send a file message', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const fileData = {
        fileName: 'document.pdf',
        fileSize: '2.5 MB',
        fileType: 'application/pdf',
        fileBlob: null,
      }
      const initialMessageCount = result.current.messages[chatId]?.length || 0

      act(() => {
        result.current.sendFile(chatId, 'document', fileData, 'Check this document')
      })

      expect(result.current.messages[chatId].length).toBe(initialMessageCount + 1)
      const lastMessage = result.current.messages[chatId][result.current.messages[chatId].length - 1]
      expect(lastMessage.type).toBe('document')
      expect(lastMessage.text).toBe('Check this document')
      expect(lastMessage.fileData).toEqual(fileData)
      expect(chatSocket.sendChatSocket).toHaveBeenCalled()
    })

    it('should send file with default text as filename', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const fileData = {
        fileName: 'image.jpg',
        fileSize: '1 MB',
        fileType: 'image/jpeg',
        fileBlob: null,
      }

      act(() => {
        result.current.sendFile(chatId, 'photo', fileData)
      })

      const lastMessage = result.current.messages[chatId][result.current.messages[chatId].length - 1]
      expect(lastMessage.text).toBe('image.jpg')
    })
  })

  describe('deleteMessage', () => {
    it('should delete a message from chat', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId = '1'
      const initialMessages = result.current.messages[chatId]
      const messageToDelete = initialMessages[0]

      act(() => {
        result.current.deleteMessage(chatId, messageToDelete.id)
      })

      expect(result.current.messages[chatId]).not.toContainEqual(messageToDelete)
      expect(result.current.messages[chatId].length).toBe(initialMessages.length - 1)
    })

    it('should not affect other chats when deleting a message', () => {
      const { result } = renderHook(() => useChatStore())
      const chatId1 = '1'
      const chatId2 = '2'
      const chat2Messages = result.current.messages[chatId2]

      act(() => {
        result.current.deleteMessage(chatId1, '1')
      })

      expect(result.current.messages[chatId2]).toEqual(chat2Messages)
    })
  })

  describe('UI state management', () => {
    it('should set and clear replying message', () => {
      const { result } = renderHook(() => useChatStore())
      const message = {
        id: '1',
        sender: 'student' as const,
        text: 'Test message',
        timestamp: '10:00 AM',
        type: 'text' as const,
      }

      act(() => {
        result.current.setReplying(message)
      })

      expect(result.current.replying).toEqual(message)

      act(() => {
        result.current.setReplying(null)
      })

      expect(result.current.replying).toBeNull()
    })

    it('should set and clear context menu', () => {
      const { result } = renderHook(() => useChatStore())
      const contextMenu = { x: 100, y: 200, messageId: '1' }

      act(() => {
        result.current.setContextMenu(contextMenu)
      })

      expect(result.current.contextMenu).toEqual(contextMenu)

      act(() => {
        result.current.setContextMenu(null)
      })

      expect(result.current.contextMenu).toBeNull()
    })

    it('should toggle recording state', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setRecording(true)
      })

      expect(result.current.isRecording).toBe(true)

      act(() => {
        result.current.setRecording(false)
      })

      expect(result.current.isRecording).toBe(false)
    })

    it('should toggle attachment menu', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setShowAttachmentMenu(true)
      })

      expect(result.current.showAttachmentMenu).toBe(true)

      act(() => {
        result.current.setShowAttachmentMenu(false)
      })

      expect(result.current.showAttachmentMenu).toBe(false)
    })

    it('should set and clear playing voice id', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setPlayingVoiceId('voice-123')
      })

      expect(result.current.playingVoiceId).toBe('voice-123')

      act(() => {
        result.current.setPlayingVoiceId(null)
      })

      expect(result.current.playingVoiceId).toBeNull()
    })
  })
})
