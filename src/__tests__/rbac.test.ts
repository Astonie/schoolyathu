import {
  getCurrentUser,
  requireAuth,
  requireRole,
  requireSchoolAccess,
  getSchoolFilter,
  canAccessSchool,
  hasPermission,
  UserRole,
  PERMISSIONS
} from '@/lib/auth-utils'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('next-auth')
jest.mock('next/navigation')

const mockGetServerSession = jest.mocked(getServerSession)
const mockRedirect = jest.mocked(redirect)

describe('Role-Based Access Control (RBAC)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return user from session', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        schoolId: 'school-1'
      }

      mockGetServerSession.mockResolvedValue({ user: mockUser, expires: '2024-12-31' })

      const result = await getCurrentUser()
      expect(result).toEqual(mockUser)
    })

    it('should return undefined when no session', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const result = await getCurrentUser()
      expect(result).toBeUndefined()
    })
  })

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.TEACHER,
        schoolId: 'school-1'
      }

      mockGetServerSession.mockResolvedValue({ user: mockUser, expires: '2024-12-31' })

      const result = await requireAuth()
      expect(result).toEqual(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect to signin when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      await requireAuth()

      expect(mockRedirect).toHaveBeenCalledWith('/auth/signin')
    })
  })

  describe('requireRole', () => {
    it('should return user when role is allowed', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.TEACHER,
        schoolId: 'school-1'
      }

      mockGetServerSession.mockResolvedValue({ user: mockUser, expires: '2024-12-31' })

      const result = await requireRole([UserRole.TEACHER, UserRole.SCHOOL_ADMIN])
      expect(result).toEqual(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect to error when role is not allowed', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        schoolId: 'school-1'
      }

      mockGetServerSession.mockResolvedValue({ user: mockUser, expires: '2024-12-31' })

      await requireRole([UserRole.TEACHER, UserRole.SCHOOL_ADMIN])

      expect(mockRedirect).toHaveBeenCalledWith('/auth/error?error=Unauthorized')
    })

    it('should redirect to signin when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      await requireRole([UserRole.TEACHER])

      expect(mockRedirect).toHaveBeenCalledWith('/auth/signin')
    })
  })

  describe('requireSchoolAccess', () => {
    it('should return user when user has school access', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.TEACHER,
        schoolId: 'school-1'
      }

      mockGetServerSession.mockResolvedValue({ user: mockUser, expires: '2024-12-31' })

      const result = await requireSchoolAccess()
      expect(result).toEqual(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should return super admin without school access', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'admin@example.com',
        role: UserRole.SUPER_ADMIN,
        schoolId: null
      }

      mockGetServerSession.mockResolvedValue({ user: mockUser, expires: '2024-12-31' })

      const result = await requireSchoolAccess()
      expect(result).toEqual(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect to error when user has no school access', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.TEACHER,
        schoolId: null
      }

      mockGetServerSession.mockResolvedValue({ user: mockUser, expires: '2024-12-31' })

      await requireSchoolAccess()

      expect(mockRedirect).toHaveBeenCalledWith('/auth/error?error=NoSchoolAccess')
    })
  })

  describe('getSchoolFilter', () => {
    it('should return empty filter for super admin', () => {
      const user = { role: UserRole.SUPER_ADMIN, schoolId: null }
      const result = getSchoolFilter(user)
      expect(result).toEqual({})
    })

    it('should return schoolId filter for school users', () => {
      const user = { role: UserRole.TEACHER, schoolId: 'school-1' }
      const result = getSchoolFilter(user)
      expect(result).toEqual({ schoolId: 'school-1' })
    })

    it('should throw error when user has no school', () => {
      const user = { role: UserRole.TEACHER, schoolId: null }
      expect(() => getSchoolFilter(user)).toThrow('User does not belong to any school')
    })
  })

  describe('canAccessSchool', () => {
    it('should allow super admin to access any school', () => {
      const user = { role: UserRole.SUPER_ADMIN, schoolId: null }
      const result = canAccessSchool(user, 'any-school-id')
      expect(result).toBe(true)
    })

    it('should allow user to access their own school', () => {
      const user = { role: UserRole.TEACHER, schoolId: 'school-1' }
      const result = canAccessSchool(user, 'school-1')
      expect(result).toBe(true)
    })

    it('should deny user access to different school', () => {
      const user = { role: UserRole.TEACHER, schoolId: 'school-1' }
      const result = canAccessSchool(user, 'school-2')
      expect(result).toBe(false)
    })
  })

  describe('PERMISSIONS object', () => {
    it('should have permissions for all user roles', () => {
      expect(PERMISSIONS[UserRole.SUPER_ADMIN]).toBeDefined()
      expect(PERMISSIONS[UserRole.SCHOOL_ADMIN]).toBeDefined()
      expect(PERMISSIONS[UserRole.TEACHER]).toBeDefined()
      expect(PERMISSIONS[UserRole.PARENT]).toBeDefined()
      expect(PERMISSIONS[UserRole.STUDENT]).toBeDefined()
    })

    it('should have correct super admin permissions', () => {
      const permissions = PERMISSIONS[UserRole.SUPER_ADMIN]
      expect(permissions.canManageAllSchools).toBe(true)
      expect(permissions.canCreateSchools).toBe(true)
      expect(permissions.canDeleteSchools).toBe(true)
      expect(permissions.canViewAllUsers).toBe(true)
    })

    it('should have correct school admin permissions', () => {
      const permissions = PERMISSIONS[UserRole.SCHOOL_ADMIN]
      expect(permissions.canManageSchool).toBe(true)
      expect(permissions.canManageUsers).toBe(true)
      expect(permissions.canManageStudents).toBe(true)
      expect(permissions.canManageTeachers).toBe(true)
      expect(permissions.canManageParents).toBe(true)
      expect(permissions.canManageClasses).toBe(true)
      expect(permissions.canManageSubjects).toBe(true)
      expect(permissions.canViewReports).toBe(true)
      expect(permissions.canManageInvoices).toBe(true)
    })

    it('should have correct teacher permissions', () => {
      const permissions = PERMISSIONS[UserRole.TEACHER]
      expect(permissions.canManageOwnClasses).toBe(true)
      expect(permissions.canTakeAttendance).toBe(true)
      expect(permissions.canGradeStudents).toBe(true)
      expect(permissions.canViewOwnStudents).toBe(true)
      expect(permissions.canCreateAssignments).toBe(true)
    })

    it('should have correct parent permissions', () => {
      const permissions = PERMISSIONS[UserRole.PARENT]
      expect(permissions.canViewOwnChildren).toBe(true)
      expect(permissions.canViewGrades).toBe(true)
      expect(permissions.canViewAttendance).toBe(true)
      expect(permissions.canPayInvoices).toBe(true)
    })

    it('should have correct student permissions', () => {
      const permissions = PERMISSIONS[UserRole.STUDENT]
      expect(permissions.canViewOwnProfile).toBe(true)
      expect(permissions.canViewGrades).toBe(true)
      expect(permissions.canViewAttendance).toBe(true)
      expect(permissions.canViewAssignments).toBe(true)
    })
  })

  describe('hasPermission', () => {
    it('should return true for valid role permissions', () => {
      expect(hasPermission(UserRole.SUPER_ADMIN, 'canManageAllSchools')).toBe(true)
      expect(hasPermission(UserRole.SCHOOL_ADMIN, 'canManageSchool')).toBe(true)
      expect(hasPermission(UserRole.TEACHER, 'canTakeAttendance')).toBe(true)
      expect(hasPermission(UserRole.PARENT, 'canViewOwnChildren')).toBe(true)
      expect(hasPermission(UserRole.STUDENT, 'canViewOwnProfile')).toBe(true)
    })

    it('should return false for invalid role permissions', () => {
      expect(hasPermission(UserRole.STUDENT, 'canManageAllSchools')).toBe(false)
      expect(hasPermission(UserRole.PARENT, 'canTakeAttendance')).toBe(false)
      expect(hasPermission(UserRole.TEACHER, 'canDeleteSchools')).toBe(false)
    })

    it('should return false for non-existent permissions', () => {
      expect(hasPermission(UserRole.SUPER_ADMIN, 'nonExistentPermission')).toBe(false)
    })

    it('should return false for invalid roles', () => {
      expect(hasPermission('INVALID_ROLE', 'canManageAllSchools')).toBe(false)
    })
  })

  describe('Role hierarchies and access control', () => {
    it('should respect role hierarchies in permissions', () => {
      // Super admin should have the most permissions
      const superAdminPerms = Object.keys(PERMISSIONS[UserRole.SUPER_ADMIN])
      const schoolAdminPerms = Object.keys(PERMISSIONS[UserRole.SCHOOL_ADMIN])
      const teacherPerms = Object.keys(PERMISSIONS[UserRole.TEACHER])
      const parentPerms = Object.keys(PERMISSIONS[UserRole.PARENT])
      const studentPerms = Object.keys(PERMISSIONS[UserRole.STUDENT])

      expect(superAdminPerms.length).toBeGreaterThan(0)
      expect(schoolAdminPerms.length).toBeGreaterThan(teacherPerms.length)
      expect(teacherPerms.length).toBeGreaterThan(0)
      expect(parentPerms.length).toBeGreaterThan(0)
      expect(studentPerms.length).toBeGreaterThan(0)
    })

    it('should prevent privilege escalation', () => {
      // Students cannot manage anything
      expect(hasPermission(UserRole.STUDENT, 'canManageSchool')).toBe(false)
      expect(hasPermission(UserRole.STUDENT, 'canManageUsers')).toBe(false)
      expect(hasPermission(UserRole.STUDENT, 'canTakeAttendance')).toBe(false)

      // Parents cannot manage school resources
      expect(hasPermission(UserRole.PARENT, 'canManageSchool')).toBe(false)
      expect(hasPermission(UserRole.PARENT, 'canManageUsers')).toBe(false)
      expect(hasPermission(UserRole.PARENT, 'canTakeAttendance')).toBe(false)

      // Teachers cannot manage users or schools
      expect(hasPermission(UserRole.TEACHER, 'canManageSchool')).toBe(false)
      expect(hasPermission(UserRole.TEACHER, 'canManageUsers')).toBe(false)
      expect(hasPermission(UserRole.TEACHER, 'canDeleteSchools')).toBe(false)
    })

    it('should allow appropriate cross-role access', () => {
      // Teachers should be able to view students in their context
      expect(hasPermission(UserRole.TEACHER, 'canViewOwnStudents')).toBe(true)
      
      // School admins should be able to manage most school resources
      expect(hasPermission(UserRole.SCHOOL_ADMIN, 'canManageStudents')).toBe(true)
      expect(hasPermission(UserRole.SCHOOL_ADMIN, 'canManageTeachers')).toBe(true)
      expect(hasPermission(UserRole.SCHOOL_ADMIN, 'canManageParents')).toBe(true)
    })
  })
})