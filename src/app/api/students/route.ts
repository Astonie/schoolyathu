import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSchoolAccess, getSchoolFilter } from "@/lib/auth-utils"

// GET /api/students - List students with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Search parameters
    const search = searchParams.get('search') || ''
    const classId = searchParams.get('classId')
    const grade = searchParams.get('grade')
    const gender = searchParams.get('gender')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause
    const whereClause: any = {
      ...schoolFilter,
    }
    
    // Add search functionality
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Add filters
    if (classId) whereClause.classId = classId
    if (grade) whereClause.class = { grade }
    if (gender) whereClause.gender = gender
    if (status) whereClause.user = { active: status === 'active' }
    
    // Build order by clause
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.firstName = sortOrder
    } else if (sortBy === 'class') {
      orderBy.class = { name: sortOrder }
    } else if (sortBy === 'studentId') {
      orderBy.studentId = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }
    
    // Get total count for pagination
    const totalCount = await prisma.student.count({ where: whereClause })
    
    // Fetch students with pagination
    const students = await prisma.student.findMany({
      where: whereClause,
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
            id: true,
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
                phone: true,
                relationship: true
              }
            }
          }
        },
        grades: {
          take: 3,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            subject: { select: { name: true } },
            type: true,
            score: true,
            maxScore: true,
            percentage: true,
            grade: true,
            date: true
          }
        },
        attendance: {
          take: 5,
          orderBy: { date: 'desc' },
          select: {
            date: true,
            status: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student with comprehensive validation
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
      classId,
      parentIds = [],
      admissionDate,
      nationality,
      bloodGroup,
      medicalConditions
    } = body

    // Validation
    if (!email || !firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'Email, first name, last name, date of birth, and gender are required' },
        { status: 400 }
      )
    }

    // Normalize email for consistent checking
    const normalizedEmail = email.trim().toLowerCase()

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        role: true,
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Email already exists',
          details: `The email ${normalizedEmail} is already registered${existingUser.student ? ` for student ${existingUser.student.firstName} ${existingUser.student.lastName}` : ''}` 
        },
        { status: 400 }
      )
    }

    // Validate class exists and belongs to school
    if (classId) {
      const classExists = await prisma.class.findFirst({
        where: {
          id: classId,
          ...getSchoolFilter(user)
        }
      })
      
      if (!classExists) {
        return NextResponse.json(
          { error: 'Invalid class selected' },
          { status: 400 }
        )
      }
    }

    // Validate parent IDs if provided
    if (parentIds.length > 0) {
      const existingParents = await prisma.parent.findMany({
        where: {
          id: { in: parentIds },
          ...getSchoolFilter(user)
        }
      })
      
      if (existingParents.length !== parentIds.length) {
        return NextResponse.json(
          { error: 'One or more selected parents not found or access denied' },
          { status: 400 }
        )
      }
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Generate student ID
      const studentCount = await tx.student.count({
        where: getSchoolFilter(user)
      })
      const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`

      // Create user account first
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: `${firstName} ${lastName}`,
          role: 'STUDENT',
          schoolId: user.schoolId!,
          active: true
        }
      })

      // Create student profile
      const student = await tx.student.create({
        data: {
          userId: newUser.id,
          schoolId: user.schoolId!,
          studentId,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          address: address || null,
          phone: phone || null,
          emergencyContact: emergencyContact || null,
          classId: classId || null,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          nationality: nationality || null,
          bloodGroup: bloodGroup || null,
          medicalConditions: medicalConditions || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              active: true
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true
            }
          },
          school: {
            select: {
              name: true
            }
          }
        }
      })

      // Link to parents if provided
      if (parentIds.length > 0) {
        await Promise.all(
          parentIds.map((parentId: string, index: number) =>
            tx.parentStudent.create({
              data: {
                parentId,
                studentId: student.id,
                relationship: index === 0 ? 'father' : 'mother' // Default relationships
              }
            })
          )
        )
      }

      return student
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    
    // Handle specific database errors
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string }
      
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already exists', details: 'This email address is already registered in the system' },
          { status: 400 }
        )
      }
      
      if (dbError.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid reference', details: 'One or more referenced records (class, parent) do not exist' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create student', details: 'An unexpected error occurred while creating the student record' },
      { status: 500 }
    )
  }
}