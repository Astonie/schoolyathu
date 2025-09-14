import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@/lib/auth-utils"

// GET /api/schools - List schools (Super Admin only)
export async function GET() {
  try {
    await requireRole([UserRole.SUPER_ADMIN])
    
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(schools)
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}

// POST /api/schools - Create new school (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    await requireRole([UserRole.SUPER_ADMIN])
    const body = await request.json()

    const { name, address, phone, email, website } = body

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      )
    }

    const school = await prisma.school.create({
      data: {
        name,
        address,
        phone,
        email,
        website,
      }
    })

    return NextResponse.json(school, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    )
  }
}