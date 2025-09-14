import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/lib/auth-utils'
import type { CredentialsConfig } from 'next-auth/providers/credentials'

// Mock dependencies
jest.mock('@/lib/prisma')
jest.mock('bcryptjs')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = jest.mocked(bcrypt)

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('authOptions', () => {
    it('should have correct configuration', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
      expect(authOptions.pages?.signIn).toBe('/auth/signin')
      expect(authOptions.pages?.error).toBe('/auth/error')
      expect(authOptions.providers).toHaveLength(1)
    })

    describe('credentials provider', () => {
      const credentialsProvider = authOptions.providers[0] as CredentialsConfig

      describe('authorize function', () => {
        beforeEach(() => {
          // Setup default mocks
          mockPrisma.user.findUnique.mockReset()
          mockBcrypt.compare.mockReset()
        })

        it('should return null when credentials are missing', async () => {
          const result = await credentialsProvider.authorize?.(undefined, {} as any)
          expect(result).toBeNull()
        })

        it('should return null when email is missing', async () => {
          const credentials = { password: 'password123' }
          const result = await credentialsProvider.authorize?.(credentials, {} as any)
          expect(result).toBeNull()
        })

        it('should return null when password is missing', async () => {
          const credentials = { email: 'test@example.com' }
          const result = await credentialsProvider.authorize?.(credentials, {} as any)
          expect(result).toBeNull()
        })

        it('should return null when user is not found', async () => {
          const credentials = { 
            email: 'test@example.com', 
            password: 'password123' 
          }
          
          mockPrisma.user.findUnique.mockResolvedValue(null)
          
          const result = await credentialsProvider.authorize?.(credentials, {} as any)
          
          expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
            include: {
              school: true,
              student: true,
              teacher: true,
              parent: true
            }
          })
          expect(result).toBeNull()
        })

        it('should return null when password is invalid', async () => {
          const credentials = { 
            email: 'test@example.com', 
            password: 'wrongpassword' 
          }
          
          const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.STUDENT,
            schoolId: 'school-1',
            image: null
          } as any
          
          mockPrisma.user.findUnique.mockResolvedValue(mockUser)
          mockBcrypt.compare.mockResolvedValue(false)
          
          const result = await credentialsProvider.authorize?.(credentials, {} as any)
          
          expect(result).toBeNull()
        })

        it('should return user when password is valid (development password)', async () => {
          const credentials = { 
            email: 'test@example.com', 
            password: 'password123' 
          }
          
          const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.STUDENT,
            schoolId: 'school-1',
            image: null
          } as any
          
          mockPrisma.user.findUnique.mockResolvedValue(mockUser)
          
          const result = await credentialsProvider.authorize?.(credentials, {} as any)
          
          expect(result).toEqual({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.STUDENT,
            schoolId: 'school-1',
            image: null
          })
        })

        it('should return user when bcrypt password is valid', async () => {
          const credentials = { 
            email: 'test@example.com', 
            password: 'hashedpassword' 
          }
          
          const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.TEACHER,
            schoolId: 'school-1',
            image: null
          } as any
          
          mockPrisma.user.findUnique.mockResolvedValue(mockUser)
          mockBcrypt.compare.mockResolvedValue(true)
          
          const result = await credentialsProvider.authorize?.(credentials, {} as any)
          
          expect(mockBcrypt.compare).toHaveBeenCalledWith('hashedpassword', 'Test User')
          expect(result).toEqual({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.TEACHER,
            schoolId: 'school-1',
            image: null
          })
        })

        it('should handle user with different roles', async () => {
          const testCases = [
            UserRole.SUPER_ADMIN,
            UserRole.SCHOOL_ADMIN,
            UserRole.TEACHER,
            UserRole.PARENT,
            UserRole.STUDENT
          ]

          for (const role of testCases) {
            const credentials = { 
              email: `${role.toLowerCase()}@example.com`, 
              password: 'password123' 
            }
            
            const mockUser = {
              id: `user-${role}`,
              email: credentials.email,
              name: `${role} User`,
              role,
              schoolId: role === UserRole.SUPER_ADMIN ? null : 'school-1',
              image: null
            } as any
            
            mockPrisma.user.findUnique.mockResolvedValue(mockUser)
            
            const result = await credentialsProvider.authorize?.(credentials, {} as any)
            
            expect(result).toEqual({
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
              schoolId: mockUser.schoolId,
              image: mockUser.image
            })
          }
        })
      })
    })

    describe('JWT callback', () => {
      it('should add role and schoolId to token when user is provided', async () => {
        const token = { sub: 'user-1', role: UserRole.STUDENT, schoolId: null }
        const user = {
          id: 'user-1',
          role: UserRole.TEACHER,
          schoolId: 'school-1'
        } as any

        const result = await authOptions.callbacks?.jwt?.({ 
          token, 
          user,
          account: null,
          profile: undefined,
          trigger: 'signIn'
        })

        expect(result).toEqual({
          sub: 'user-1',
          role: UserRole.TEACHER,
          schoolId: 'school-1'
        })
      })

      it('should return token unchanged when user is not provided', async () => {
        const token = { 
          sub: 'user-1', 
          role: UserRole.STUDENT, 
          schoolId: 'school-1' 
        }

        const result = await authOptions.callbacks?.jwt?.({ 
          token,
          user: {} as any,
          account: null,
          profile: undefined
        })

        expect(result).toEqual(token)
      })
    })

    describe('Session callback', () => {
      it('should add user info to session from token', async () => {
        const session = {
          user: {
            id: '',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.STUDENT,
            schoolId: null
          },
          expires: '2024-12-31'
        } as any

        const token = {
          sub: 'user-1',
          role: UserRole.TEACHER,
          schoolId: 'school-1'
        } as any

        const result = await authOptions.callbacks?.session?.({ 
          session, 
          token,
          user: {} as any
        })

        expect(result?.user).toEqual({
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.TEACHER,
          schoolId: 'school-1'
        })
      })
    })
  })
})