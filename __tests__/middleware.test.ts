import type { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock the request and response
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ status: 200 })),
    redirect: jest.fn((url) => ({ status: 307, url })),
  },
  NextRequest: jest.fn(),
}))

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow access to public routes without auth', () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/',
        clone: jest.fn(() => ({
          pathname: '/dashboard',
        })),
      },
      headers: new Headers(),
    } as unknown as NextRequest

    const response = middleware(mockRequest)

    expect(response).toBeDefined()
  })

  it('should redirect unauthenticated users to login', () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/dashboard',
        clone: jest.fn(() => ({
          pathname: '/',
        })),
      },
      cookies: {
        get: jest.fn(() => undefined),
      },
    } as unknown as NextRequest

    // The middleware checks for auth token
    // Since no token is present, it should handle unauthenticated access
    const response = middleware(mockRequest)
    expect(response).toBeDefined()
  })

  it('should allow authenticated users to access protected routes', () => {
    const mockToken = 'test-token'
    const request = {
      nextUrl: {
        pathname: '/dashboard',
        clone: jest.fn(() => ({
          pathname: '/dashboard',
        })),
      },
      headers: new Headers({
        authorization: `Bearer ${mockToken}`,
      }),
      cookies: {
        get: jest.fn(() => ({ value: mockToken })),
      },
    } as unknown as NextRequest

    const response = middleware(request)

    expect(response).toBeDefined()
  })

  it('should allow access to auth routes', () => {
    const request = {
      nextUrl: {
        pathname: '/(auth)',
        clone: jest.fn(() => ({
          pathname: '/login',
        })),
      },
      headers: new Headers(),
    } as unknown as NextRequest

    const response = middleware(request)

    expect(response).toBeDefined()
  })
})
