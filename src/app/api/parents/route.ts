import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause based on user role
    const whereClause: any = {}
    
    if (session.user.role !== 'SUPER_ADMIN') {
      whereClause.schoolId = session.user.schoolId
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get parents with student count
    const parents = await prisma.parent.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.parent.count({
      where: whereClause
    })

    return NextResponse.json({
      parents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching parents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow ADMIN and SUPER_ADMIN to create parents
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      occupation,
      relationship,
      studentIds = []
    } = body

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    if (email) {
      const existingParent = await prisma.parent.findFirst({
        where: {
          email,
          schoolId: session.user.role === 'SUPER_ADMIN' ? undefined : session.user.schoolId
        }
      })

      if (existingParent) {
        return NextResponse.json(
          { error: 'A parent with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Create parent
    const parent = await prisma.parent.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        occupation,
        relationship,
        schoolId: session.user.schoolId,
        students: studentIds.length > 0 ? {
          connect: studentIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    return NextResponse.json(parent, { status: 201 })

  } catch (error) {
    console.error('Error creating parent:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A parent with this information already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}