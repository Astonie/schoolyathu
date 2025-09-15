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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
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
        active: true
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
        admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        nationality,
        bloodGroup,
        medicalConditions,
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
          prisma.parentStudent.create({
            data: {
              parentId,
              studentId: student.id,
              relationship: index === 0 ? 'father' : 'mother' // Default relationships
            }
          })
        )
      )
    }

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}