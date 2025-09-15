import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSchoolAccess, getSchoolFilter } from "@/lib/auth-utils"
import { z } from "zod"

const updateClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  grade: z.string().min(1, "Grade is required"),
  section: z.string().min(1, "Section is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  teacherId: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/classes/[id] - Get specific class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)

    const classItem = await prisma.class.findFirst({
      where: {
        id: params.id,
        ...schoolFilter,
      },
      include: {
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
        students: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
                active: true,
              },
            },
          },
          orderBy: {
            lastName: "asc",
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    if (!classItem) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(classItem)
  } catch (error) {
    console.error("Error fetching class:", error)
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    )
  }
}

// PUT /api/classes/[id] - Update class
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    
    const body = await request.json()
    const validatedData = updateClassSchema.parse(body)

    // Check if class exists and belongs to school
    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.id,
        ...schoolFilter,
      },
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // Check if another class with same grade and section exists
    const duplicateClass = await prisma.class.findFirst({
      where: {
        id: { not: params.id },
        grade: validatedData.grade,
        section: validatedData.section,
        ...schoolFilter,
      },
    })

    if (duplicateClass) {
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

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        grade: validatedData.grade,
        section: validatedData.section,
        capacity: validatedData.capacity,
        teacherId: validatedData.teacherId || null,
        description: validatedData.description,
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

    return NextResponse.json(updatedClass)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating class:", error)
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    )
  }
}

// DELETE /api/classes/[id] - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)

    // Check if class exists and belongs to school
    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.id,
        ...schoolFilter,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // Check if class has students
    if (existingClass._count.students > 0) {
      return NextResponse.json(
        { error: "Cannot delete class with enrolled students" },
        { status: 400 }
      )
    }

    await prisma.class.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Class deleted successfully" })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    )
  }
}