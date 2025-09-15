import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSchoolAccess, getSchoolFilter } from "@/lib/auth-utils"

// GET /api/students/stats - Get student statistics
export async function GET() {
  try {
    const user = await requireSchoolAccess()
    const schoolFilter = getSchoolFilter(user)

    // Total students
    const totalStudents = await prisma.student.count({
      where: schoolFilter
    })

    // Active vs inactive students
    const activeStudents = await prisma.student.count({
      where: {
        ...schoolFilter,
        user: { active: true }
      }
    })

    const inactiveStudents = totalStudents - activeStudents

    // Students by gender
    const genderStats = await prisma.student.groupBy({
      by: ['gender'],
      where: schoolFilter,
      _count: { gender: true }
    })

    // Students by class/grade
    const classStats = await prisma.student.groupBy({
      by: ['classId'],
      where: {
        ...schoolFilter,
        classId: { not: null }
      },
      _count: { classId: true }
    })

    // Get class details for the stats
    const classDetails = await prisma.class.findMany({
      where: {
        id: { in: classStats.map(stat => stat.classId).filter(Boolean) },
        ...getSchoolFilter(user)
      },
      select: {
        id: true,
        name: true,
        grade: true,
        section: true
      }
    })

    const classStatsWithDetails = classStats.map(stat => ({
      ...stat,
      classInfo: classDetails.find(c => c.id === stat.classId)
    }))

    // Students without class assigned
    const studentsWithoutClass = await prisma.student.count({
      where: {
        ...schoolFilter,
        classId: null
      }
    })

    // Recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentEnrollments = await prisma.student.count({
      where: {
        ...schoolFilter,
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // Average age calculation
    const students = await prisma.student.findMany({
      where: schoolFilter,
      select: { dateOfBirth: true }
    })

    const currentDate = new Date()
    const ages = students.map(student => {
      const birthDate = new Date(student.dateOfBirth)
      const age = currentDate.getFullYear() - birthDate.getFullYear()
      const monthDiff = currentDate.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        return age - 1
      }
      return age
    })

    const averageAge = ages.length > 0 ? 
      Math.round((ages.reduce((sum, age) => sum + age, 0) / ages.length) * 100) / 100 : 0

    // Attendance statistics (last 30 days)
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        ...schoolFilter,
        date: { gte: thirtyDaysAgo }
      },
      _count: { status: true }
    })

    const totalAttendanceRecords = attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0)
    const attendancePercentage = totalAttendanceRecords > 0 ? 
      Math.round(((attendanceStats.find(s => s.status === 'PRESENT')?._count.status || 0) / totalAttendanceRecords) * 10000) / 100 : 0

    // Grade performance (recent grades)
    const recentGrades = await prisma.grade.findMany({
      where: {
        ...schoolFilter,
        date: { gte: thirtyDaysAgo }
      },
      select: { percentage: true }
    })

    const averageGrade = recentGrades.length > 0 ?
      Math.round((recentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / recentGrades.length) * 100) / 100 : 0

    return NextResponse.json({
      overview: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        studentsWithoutClass,
        recentEnrollments,
        averageAge
      },
      demographics: {
        gender: genderStats.map(stat => ({
          gender: stat.gender,
          count: stat._count.gender
        })),
        classes: classStatsWithDetails.map(stat => ({
          classId: stat.classId,
          className: stat.classInfo?.name || 'Unknown',
          grade: stat.classInfo?.grade || 'Unknown',
          section: stat.classInfo?.section || 'Unknown',
          count: stat._count.classId
        }))
      },
      performance: {
        attendance: {
          percentage: attendancePercentage,
          totalRecords: totalAttendanceRecords,
          breakdown: attendanceStats.map(stat => ({
            status: stat.status,
            count: stat._count.status
          }))
        },
        grades: {
          average: averageGrade,
          totalGrades: recentGrades.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching student statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}