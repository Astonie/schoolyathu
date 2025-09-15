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

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const classId = searchParams.get('classId') || ''
    const grade = searchParams.get('grade') || ''
    const dateRange = searchParams.get('dateRange') || 'all'

    // Build where clause
    const whereClause: any = {}
    if (session.user.role !== 'SUPER_ADMIN') {
      whereClause.schoolId = session.user.schoolId
    }

    if (!includeInactive) {
      whereClause.user = { active: true }
    }

    if (classId) {
      whereClause.class = { id: classId }
    }

    if (grade) {
      whereClause.class = { ...whereClause.class, grade }
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (dateRange) {
        case '1month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case '3months':
          startDate.setMonth(now.getMonth() - 3)
          break
        case '6months':
          startDate.setMonth(now.getMonth() - 6)
          break
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      whereClause.admissionDate = { gte: startDate }
    }

    // Fetch students with comprehensive data
    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            active: true,
            createdAt: true
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
                phone: true,
                email: true,
                relationship: true
              }
            }
          }
        },
        grades: {
          select: {
            percentage: true,
            grade: true,
            subject: {
              select: {
                name: true
              }
            },
            date: true
          },
          orderBy: { date: 'desc' }
        },
        attendance: {
          select: {
            status: true,
            date: true
          },
          orderBy: { date: 'desc' }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    if (format === 'json') {
      return NextResponse.json(students)
    }

    if (format === 'csv') {
      const csvData = generateCSV(students)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="students-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'xlsx') {
      // For now, return CSV for Excel - in a real app you'd use a library like xlsx
      const csvData = generateCSV(students)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="students-export-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })

  } catch (error) {
    console.error('Error exporting students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSV(students: any[]) {
  const headers = [
    'Student ID',
    'First Name',
    'Last Name',
    'Email',
    'Active',
    'Gender',
    'Date of Birth',
    'Age',
    'Class',
    'Grade',
    'Section',
    'Admission Date',
    'Address',
    'Phone',
    'Emergency Contact',
    'Nationality',
    'Blood Group',
    'Medical Conditions',
    'Parent Names',
    'Parent Contacts',
    'Average Grade',
    'Latest Grades',
    'Attendance Rate',
    'Present Days',
    'Absent Days',
    'Late Days',
    'Account Created'
  ]

  const csvRows = [headers.join(',')]

  students.forEach(student => {
    // Calculate age
    const age = student.dateOfBirth 
      ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()
      : ''

    // Parent information
    const parentNames = student.parents.map((p: any) => 
      `${p.parent.firstName} ${p.parent.lastName} (${p.relationship || 'Guardian'})`
    ).join('; ')
    
    const parentContacts = student.parents.map((p: any) => 
      `${p.parent.phone || ''} ${p.parent.email || ''}`.trim()
    ).join('; ')

    // Grade calculations
    const gradePercentages = student.grades
      .map((g: any) => g.percentage)
      .filter((p: any) => p !== null)
    
    const averageGrade = gradePercentages.length > 0
      ? Math.round(gradePercentages.reduce((sum: number, grade: number) => sum + grade, 0) / gradePercentages.length)
      : ''

    const latestGrades = student.grades
      .slice(0, 3)
      .map((g: any) => `${g.subject.name}: ${g.percentage}%`)
      .join('; ')

    // Attendance calculations
    const totalAttendance = student.attendance.length
    const presentDays = student.attendance.filter((a: any) => a.status === 'PRESENT').length
    const absentDays = student.attendance.filter((a: any) => a.status === 'ABSENT').length
    const lateDays = student.attendance.filter((a: any) => a.status === 'LATE').length
    const attendanceRate = totalAttendance > 0 
      ? Math.round((presentDays / totalAttendance) * 100)
      : ''

    const row = [
      student.studentId,
      student.firstName,
      student.lastName,
      student.user.email,
      student.user.active ? 'Yes' : 'No',
      student.gender || '',
      student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
      age,
      student.class?.name || '',
      student.class?.grade || '',
      student.class?.section || '',
      student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '',
      `"${(student.address || '').replace(/"/g, '""')}"`, // Escape quotes
      student.phone || '',
      student.emergencyContact || '',
      student.nationality || '',
      student.bloodGroup || '',
      `"${(student.medicalConditions || '').replace(/"/g, '""')}"`,
      `"${parentNames.replace(/"/g, '""')}"`,
      `"${parentContacts.replace(/"/g, '""')}"`,
      averageGrade,
      `"${latestGrades.replace(/"/g, '""')}"`,
      attendanceRate,
      presentDays,
      absentDays,
      lateDays,
      student.user.createdAt ? new Date(student.user.createdAt).toLocaleDateString() : ''
    ]

    csvRows.push(row.join(','))
  })

  return csvRows.join('\n')
}