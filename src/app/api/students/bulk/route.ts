import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSchoolAccess, getSchoolFilter } from "@/lib/auth-utils"

// POST /api/students/bulk - Bulk operations for students
export async function POST(request: NextRequest) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    const body = await request.json()
    
    const { action, studentIds, data } = body
    
    if (!action || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: 'Action and studentIds array are required' },
        { status: 400 }
      )
    }

    // Verify all students belong to the school
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        ...schoolFilter
      },
      include: { user: true }
    })

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students not found or access denied' },
        { status: 404 }
      )
    }

    let result: { message: string; data?: unknown } = { message: '' }

    switch (action) {
      case 'activate':
        await prisma.user.updateMany({
          where: {
            id: { in: students.map((s: { userId: string }) => s.userId) }
          },
          data: { active: true }
        })
        result = { message: `${studentIds.length} students activated successfully` }
        break

      case 'deactivate':
        await prisma.user.updateMany({
          where: {
            id: { in: students.map((s: { userId: string }) => s.userId) }
          },
          data: { active: false }
        })
        result = { message: `${studentIds.length} students deactivated successfully` }
        break

      case 'updateClass':
        if (!data?.classId) {
          return NextResponse.json(
            { error: 'Class ID is required for class update' },
            { status: 400 }
          )
        }

        // Verify class exists and belongs to school
        const classExists = await prisma.class.findFirst({
          where: {
            id: data.classId,
            ...getSchoolFilter(user)
          }
        })

        if (!classExists) {
          return NextResponse.json(
            { error: 'Invalid class selected' },
            { status: 400 }
          )
        }

        await prisma.student.updateMany({
          where: {
            id: { in: studentIds }
          },
          data: { classId: data.classId }
        })
        result = { message: `${studentIds.length} students moved to ${classExists.name} successfully` }
        break

      case 'export':
        // Return student data for export
        const exportData = await prisma.student.findMany({
          where: {
            id: { in: studentIds },
            ...schoolFilter
          },
          include: {
            user: {
              select: {
                email: true,
                active: true
              }
            },
            class: {
              select: {
                name: true,
                grade: true,
                section: true
              }
            },
            parents: {
              include: {
                parent: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true
                  }
                }
              }
            }
          }
        })
        
        result = { 
          message: 'Export data prepared',
          data: exportData.map((student: any) => ({
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.user.email,
            gender: student.gender,
            dateOfBirth: student.dateOfBirth,
            class: student.class?.name || 'Not assigned',
            grade: student.class?.grade || 'Not assigned',
            phone: student.phone,
            address: student.address,
            emergencyContact: student.emergencyContact,
            active: student.user.active,
            parents: student.parents.map((p: any) => ({
              name: `${p.parent.firstName} ${p.parent.lastName}`,
              phone: p.parent.phone,
              relationship: p.relationship
            }))
          }))
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}