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
    const timeRange = searchParams.get('timeRange') || '12months'
    const classFilter = searchParams.get('class') || 'all'

    // Build base where clause
    const baseWhere: any = {}
    if (session.user.role !== 'SUPER_ADMIN') {
      baseWhere.schoolId = session.user.schoolId
    }

    // Get comprehensive student data for export
    const students = await prisma.student.findMany({
      where: {
        ...baseWhere,
        ...(classFilter !== 'all' ? { class: { name: classFilter } } : {})
      },
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
            }
          }
        },
        attendance: {
          select: {
            status: true,
            date: true
          }
        }
      }
    })

    if (format === 'csv') {
      const csvData = generateCSVData(students)
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="student-analytics-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default to JSON export
    return NextResponse.json(students)

  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSVData(students: any[]) {
  const headers = [
    'Student ID',
    'First Name',
    'Last Name',
    'Email',
    'Gender',
    'Date of Birth',
    'Age',
    'Class',
    'Grade',
    'Section',
    'Active',
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
    'Total Grades',
    'Attendance Rate',
    'Total Attendance Days',
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
      `${p.parent.firstName} ${p.parent.lastName} (${p.relationship})`
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
      student.gender || '',
      student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
      age,
      student.class?.name || '',
      student.class?.grade || '',
      student.class?.section || '',
      student.user.active ? 'Yes' : 'No',
      student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '',
      `"${(student.address || '').replace(/"/g, '""')}"`, // Escape quotes in address
      student.phone || '',
      student.emergencyContact || '',
      student.nationality || '',
      student.bloodGroup || '',
      `"${(student.medicalConditions || '').replace(/"/g, '""')}"`, // Escape quotes
      `"${parentNames.replace(/"/g, '""')}"`,
      `"${parentContacts.replace(/"/g, '""')}"`,
      averageGrade,
      gradePercentages.length,
      attendanceRate,
      totalAttendance,
      presentDays,
      absentDays,
      lateDays,
      student.user.createdAt ? new Date(student.user.createdAt).toLocaleDateString() : ''
    ]

    csvRows.push(row.join(','))
  })

  return csvRows.join('\n')
}