import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSchoolAccess, getSchoolFilter } from "@/lib/auth-utils"

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/students/[id] - Get individual student details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    const { id } = params

    const student = await prisma.student.findFirst({
      where: {
        id,
        ...schoolFilter
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
            createdAt: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            capacity: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        school: {
          select: {
            name: true,
            address: true,
            phone: true
          }
        },
        parents: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                address: true,
                occupation: true
              }
            }
          }
        },
        grades: {
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            },
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { date: 'desc' }
        },
        attendance: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 30 // Last 30 attendance records
        },
        invoices: {
          include: {
            parent: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Calculate attendance statistics
    const totalAttendance = student.attendance.length
    const presentCount = student.attendance.filter(a => a.status === 'PRESENT').length
    const absentCount = student.attendance.filter(a => a.status === 'ABSENT').length
    const lateCount = student.attendance.filter(a => a.status === 'LATE').length
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0

    // Calculate grade statistics
    const recentGrades = student.grades.slice(0, 10)
    const averageGrade = recentGrades.length > 0 
      ? recentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / recentGrades.length 
      : 0

    // Outstanding invoices
    const outstandingInvoices = student.invoices.filter(invoice => 
      invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
    )

    const studentData = {
      ...student,
      statistics: {
        attendance: {
          total: totalAttendance,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          percentage: Math.round(attendancePercentage * 100) / 100
        },
        grades: {
          average: Math.round(averageGrade * 100) / 100,
          total: student.grades.length,
          recent: recentGrades.length
        },
        financial: {
          outstandingInvoices: outstandingInvoices.length,
          outstandingAmount: outstandingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
        }
      }
    }

    return NextResponse.json(studentData)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update student information
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    const { id } = params
    const body = await request.json()

    // Check if student exists and belongs to school
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        ...schoolFilter
      },
      include: {
        user: true
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

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
      active,
      nationality,
      bloodGroup,
      medicalConditions,
      parentIds = [],
      admissionDate
    } = body

    // Update user account if email or name changed
    if (email && email !== existingStudent.user.email) {
      // Check if new email already exists
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: existingStudent.userId }
        }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Validate class if provided
    if (classId && classId !== existingStudent.classId) {
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

    // Update user account
    await prisma.user.update({
      where: { id: existingStudent.userId },
      data: {
        email: email || existingStudent.user.email,
        name: `${firstName || existingStudent.firstName} ${lastName || existingStudent.lastName}`,
        active: active !== undefined ? active : existingStudent.user.active
      }
    })

    // Update student profile
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        firstName: firstName || existingStudent.firstName,
        lastName: lastName || existingStudent.lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingStudent.dateOfBirth,
        gender: gender || existingStudent.gender,
        address: address || existingStudent.address,
        phone: phone || existingStudent.phone,
        emergencyContact: emergencyContact || existingStudent.emergencyContact,
        classId: classId || existingStudent.classId,
        nationality: nationality || existingStudent.nationality,
        bloodGroup: bloodGroup || existingStudent.bloodGroup,
        medicalConditions: medicalConditions || existingStudent.medicalConditions,
        admissionDate: admissionDate ? new Date(admissionDate) : existingStudent.admissionDate,
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
            id: true,
            name: true,
            grade: true,
            section: true
          }
        }
      }
    })

    // Update parent relationships if parentIds provided
    if (parentIds.length >= 0) {
      // Remove existing parent relationships
      await prisma.parentStudent.deleteMany({
        where: { studentId: id }
      })

      // Add new parent relationships
      if (parentIds.length > 0) {
        await Promise.all(
          parentIds.map((parentId: string, index: number) =>
            prisma.parentStudent.create({
              data: {
                parentId,
                studentId: id,
                relationship: index === 0 ? 'father' : index === 1 ? 'mother' : 'guardian'
              }
            })
          )
        )
      }
    }

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Delete student (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)
    const { id } = params

    // Check if student exists and belongs to school
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        ...schoolFilter
      },
      include: {
        user: true
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Soft delete by deactivating the user account
    await prisma.user.update({
      where: { id: existingStudent.userId },
      data: { active: false }
    })

    return NextResponse.json({ 
      message: 'Student deactivated successfully' 
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}