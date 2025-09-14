import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

// Define UserRole enum since Prisma client isn't generated yet
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT'
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect('/auth/error?error=Unauthorized')
  }
  return user
}

export async function requireSchoolAccess() {
  const user = await requireAuth()
  if (!user.schoolId && user.role !== 'SUPER_ADMIN') {
    redirect('/auth/error?error=NoSchoolAccess')
  }
  return user
}

export function getSchoolFilter(user: { role: string; schoolId: string | null }) {
  if (user.role === 'SUPER_ADMIN') {
    return {} // Super admin can see all schools
  }
  
  if (!user.schoolId) {
    throw new Error('User does not belong to any school')
  }
  
  return { schoolId: user.schoolId }
}

export function canAccessSchool(user: { role: string; schoolId: string | null }, targetSchoolId: string) {
  if (user.role === 'SUPER_ADMIN') return true
  return user.schoolId === targetSchoolId
}

// Role-based permissions
export const PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: {
    canManageAllSchools: true,
    canCreateSchools: true,
    canDeleteSchools: true,
    canViewAllUsers: true,
  },
  [UserRole.SCHOOL_ADMIN]: {
    canManageSchool: true,
    canManageUsers: true,
    canManageStudents: true,
    canManageTeachers: true,
    canManageParents: true,
    canManageClasses: true,
    canManageSubjects: true,
    canViewReports: true,
    canManageInvoices: true,
  },
  [UserRole.TEACHER]: {
    canManageOwnClasses: true,
    canTakeAttendance: true,
    canGradeStudents: true,
    canViewOwnStudents: true,
    canCreateAssignments: true,
  },
  [UserRole.PARENT]: {
    canViewOwnChildren: true,
    canViewGrades: true,
    canViewAttendance: true,
    canPayInvoices: true,
  },
  [UserRole.STUDENT]: {
    canViewOwnProfile: true,
    canViewGrades: true,
    canViewAttendance: true,
    canViewAssignments: true,
  }
} as const

export function hasPermission(
  userRole: string, 
  permission: string
): boolean {
  const rolePermissions = PERMISSIONS[userRole as UserRole]
  return rolePermissions?.[permission as keyof typeof rolePermissions] || false
}