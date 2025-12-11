import { apiFetch, APIException, getAuthToken } from '@/lib/api'

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    global.fetch = jest.fn()
  })

  describe('getAuthToken', () => {
    it('should return token from localStorage', () => {
      const mockToken = 'test-jwt-token'
      localStorage.getItem = jest.fn(() => `{"token":"${mockToken}"}`)

      const token = getAuthToken()

      expect(token).toBe(mockToken)
      expect(localStorage.getItem).toHaveBeenCalledWith('auth-storage')
    })

    it('should return null if no token exists', () => {
      localStorage.getItem = jest.fn(() => null)

      const token = getAuthToken()

      expect(token).toBeNull()
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.getItem = jest.fn(() => 'invalid-json')

      const token = getAuthToken()

      expect(token).toBeNull()
    })
  })

  describe('APIException', () => {
    it('should create exception with status and details', () => {
      const details = { field: 'email', message: 'Invalid email' }
      const exception = new APIException('Validation failed', 400, details)

      expect(exception.message).toBe('Validation failed')
      expect(exception.status).toBe(400)
      expect(exception.details).toEqual(details)
      expect(exception instanceof Error).toBe(true)
    })
  })

  describe('apiFetch', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { id: 1, name: 'Test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      const result = await apiFetch('/api/test', {
        method: 'GET',
      })

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.any(Object)
      )
    })

    it('should include auth token in headers', async () => {
      const mockToken = 'test-token'
      localStorage.getItem = jest.fn(() => `{"token":"${mockToken}"}`)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      await apiFetch('/api/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
    })

    it('should throw APIException on error response', async () => {
      const errorResponse = { message: 'Unauthorized' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      await expect(apiFetch('/api/test')).rejects.toThrow(APIException)
      await expect(apiFetch('/api/test')).rejects.toThrow(
        expect.objectContaining({ status: 401 })
      )
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      )

      await expect(apiFetch('/api/test')).rejects.toThrow()
    })

    it('should handle POST requests with body', async () => {
      const requestBody = { name: 'Test' }
      const mockResponse = { id: 1, ...requestBody }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      const result = await apiFetch('/api/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      )
    })

    it('should handle PATCH requests', async () => {
      const updates = { status: 'approved' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...updates }),
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      await apiFetch('/api/booking/1', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('should handle DELETE requests', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      await apiFetch('/api/booking/1', { method: 'DELETE' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })
})
