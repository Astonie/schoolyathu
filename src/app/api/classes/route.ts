import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSchoolAccess, getSchoolFilter } from "@/lib/auth-utils"
import { z } from "zod"

const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  grade: z.string().min(1, "Grade is required"),
  section: z.string().min(1, "Section is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  teacherId: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/classes - List classes for current school
export async function GET(request: NextRequest) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const grade = url.searchParams.get('grade') || ''
    const teacherId = url.searchParams.get('teacherId') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    
    const where = {
      ...schoolFilter,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { grade: { contains: search, mode: 'insensitive' as const } },
          { section: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(grade && { grade }),
      ...(teacherId && { teacherId }),
    }
    
    const [classes, totalCount] = await Promise.all([
      prisma.class.findMany({
        where,
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          capacity: true,
          description: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: [
          { grade: 'asc' },
          { section: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.class.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      classes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

// POST /api/classes - Create new class
export async function POST(request: NextRequest) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    
    const body = await request.json()
    const validatedData = createClassSchema.parse(body)

    // Check if class with same grade and section already exists
    const existingClass = await prisma.class.findFirst({
      where: {
        grade: validatedData.grade,
        section: validatedData.section,
        ...schoolFilter,
      },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: "A class with this grade and section already exists" },
        { status: 400 }
      )
    }

    // Validate teacher if provided
    if (validatedData.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          id: validatedData.teacherId,
          ...schoolFilter,
        },
      })

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 400 }
        )
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name: validatedData.name,
        grade: validatedData.grade,
        section: validatedData.section,
        capacity: validatedData.capacity,
        teacherId: validatedData.teacherId || null,
        description: validatedData.description,
        schoolId: user.schoolId!,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating class:", error)
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}