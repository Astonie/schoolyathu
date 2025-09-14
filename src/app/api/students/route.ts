import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSchoolAccess, getSchoolFilter } from "@/lib/auth-utils"

// GET /api/students - List students for current school
export async function GET() {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    
    const students = await prisma.student.findMany({
      where: schoolFilter,
      include: {
        user: {
          select: {
            email: true,
            name: true,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student
export async function POST(request: NextRequest) {
  try {
    const user = await requireSchoolAccess()
    const body = await request.json()

    const { 
      email, 
      firstName, 
      lastName, 
      dateOfBirth, 
      gender, 
      address, 
      phone, 
      emergencyContact,
      classId 
    } = body

    if (!email || !firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'Email, first name, last name, date of birth, and gender are required' },
        { status: 400 }
      )
    }

    // Generate student ID
    const studentCount = await prisma.student.count({
      where: getSchoolFilter(user)
    })
    const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`

    // Create user account first
    const newUser = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        role: 'STUDENT',
        schoolId: user.schoolId!,
      }
    })

    // Create student profile
    const student = await prisma.student.create({
      data: {
        userId: newUser.id,
        schoolId: user.schoolId!,
        studentId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address,
        phone,
        emergencyContact,
        classId,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            active: true
          }
        },
        class: {
          select: {
            name: true,
            grade: true,
            section: true
          }
        }
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}