import '@testing-library/jest-dom'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: 'credentials',
    name: 'credentials',
    type: 'credentials',
  })),
}))

jest.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(),
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Global test utilities
global.mockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'STUDENT',
  schoolId: 'test-school-id',
  image: null,
  ...overrides,
})

global.mockSession = (userOverrides = {}) => ({
  user: global.mockUser(userOverrides),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
})

global.mockToken = (overrides = {}) => ({
  sub: 'test-user-id',
  role: 'STUDENT',
  schoolId: 'test-school-id',
  ...overrides,
})