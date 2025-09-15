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
    const timeRange = searchParams.get('timeRange') || '12months'
    const classFilter = searchParams.get('class') || 'all'

    // Get date range for filtering
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '2years':
        startDate.setFullYear(now.getFullYear() - 2)
        break
      default: // 12months
        startDate.setFullYear(now.getFullYear() - 1)
    }

    // Build base where clause
    const baseWhere: any = {}
    if (session.user.role !== 'SUPER_ADMIN') {
      baseWhere.schoolId = session.user.schoolId
    }

    // Class filter
    const classWhere = classFilter !== 'all' ? { class: { name: classFilter } } : {}

    // 1. Overview Statistics
    const totalStudents = await prisma.student.count({ where: baseWhere })
    const activeStudents = await prisma.student.count({ 
      where: { ...baseWhere, user: { active: true } } 
    })
    const inactiveStudents = totalStudents - activeStudents

    // Calculate average age
    const studentsWithDOB = await prisma.student.findMany({
      where: { ...baseWhere, dateOfBirth: { not: null } },
      select: { dateOfBirth: true }
    })
    
    const averageAge = studentsWithDOB.length > 0 
      ? Math.round(studentsWithDOB.reduce((sum, student) => {
          const age = new Date().getFullYear() - new Date(student.dateOfBirth!).getFullYear()
          return sum + age
        }, 0) / studentsWithDOB.length)
      : 0

    const totalClasses = await prisma.class.count({ where: baseWhere })
    const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0

    // 2. Enrollment Trends
    const monthlyEnrollment = await getMonthlyEnrollment(baseWhere, startDate)
    const yearlyTrend = await getYearlyTrend(baseWhere)

    // 3. Demographics
    const genderDistribution = await getGenderDistribution(baseWhere, classWhere)
    const ageDistribution = await getAgeDistribution(baseWhere, classWhere)
    const nationalityDistribution = await getNationalityDistribution(baseWhere, classWhere)

    // 4. Academic Data
    const classDistribution = await getClassDistribution(baseWhere)
    const gradePerformance = await getGradePerformance(baseWhere)

    // 5. Attendance Data
    const attendanceData = await getAttendanceAnalytics(baseWhere, classWhere, startDate)

    const analytics = {
      overview: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        averageAge,
        totalClasses,
        avgStudentsPerClass
      },
      enrollment: {
        monthlyEnrollment,
        yearlyTrend
      },
      demographics: {
        genderDistribution,
        ageDistribution,
        nationalityDistribution
      },
      academic: {
        classDistribution,
        gradePerformance
      },
      attendance: attendanceData
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getMonthlyEnrollment(baseWhere: any, startDate: Date) {
  const enrollments = await prisma.student.groupBy({
    by: ['admissionDate'],
    where: {
      ...baseWhere,
      admissionDate: { gte: startDate }
    },
    _count: true
  })

  // Group by month
  const monthlyData: { [key: string]: number } = {}
  enrollments.forEach(item => {
    if (item.admissionDate) {
      const monthKey = new Date(item.admissionDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + item._count
    }
  })

  return Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
}

async function getYearlyTrend(baseWhere: any) {
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]
  
  const yearlyData = await Promise.all(
    years.map(async (year) => {
      const count = await prisma.student.count({
        where: {
          ...baseWhere,
          admissionDate: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1)
          }
        }
      })
      return { year, total: count }
    })
  )

  return yearlyData
}

async function getGenderDistribution(baseWhere: any, classWhere: any) {
  const genderCounts = await prisma.student.groupBy({
    by: ['gender'],
    where: { ...baseWhere, ...classWhere },
    _count: true
  })

  const total = genderCounts.reduce((sum, item) => sum + item._count, 0)
  
  return genderCounts.map(item => ({
    gender: item.gender || 'Not specified',
    count: item._count,
    percentage: total > 0 ? Math.round((item._count / total) * 100) : 0
  }))
}

async function getAgeDistribution(baseWhere: any, classWhere: any) {
  const students = await prisma.student.findMany({
    where: { 
      ...baseWhere, 
      ...classWhere,
      dateOfBirth: { not: null }
    },
    select: { dateOfBirth: true }
  })

  const ageRanges: { [key: string]: number } = {
    '3-5': 0,
    '6-8': 0,
    '9-11': 0,
    '12-14': 0,
    '15-17': 0,
    '18+': 0
  }

  students.forEach(student => {
    if (student.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()
      if (age <= 5) ageRanges['3-5']++
      else if (age <= 8) ageRanges['6-8']++
      else if (age <= 11) ageRanges['9-11']++
      else if (age <= 14) ageRanges['12-14']++
      else if (age <= 17) ageRanges['15-17']++
      else ageRanges['18+']++
    }
  })

  const total = students.length

  return Object.entries(ageRanges).map(([ageRange, count]) => ({
    ageRange,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }))
}

async function getNationalityDistribution(baseWhere: any, classWhere: any) {
  const nationalities = await prisma.student.groupBy({
    by: ['nationality'],
    where: { ...baseWhere, ...classWhere },
    _count: true,
    orderBy: { _count: { nationality: 'desc' } }
  })

  const total = nationalities.reduce((sum, item) => sum + item._count, 0)

  return nationalities.map(item => ({
    nationality: item.nationality || 'Not specified',
    count: item._count,
    percentage: total > 0 ? Math.round((item._count / total) * 100) : 0
  }))
}

async function getClassDistribution(baseWhere: any) {
  const classes = await prisma.class.findMany({
    where: baseWhere,
    include: {
      _count: {
        select: { students: true }
      }
    },
    select: {
      name: true,
      grade: true,
      capacity: true,
      _count: true
    }
  })

  return classes.map(cls => ({
    className: cls.name,
    grade: cls.grade,
    studentCount: cls._count.students,
    capacity: cls.capacity,
    utilizationPercentage: Math.round((cls._count.students / cls.capacity) * 100)
  }))
}

async function getGradePerformance(baseWhere: any) {
  const classes = await prisma.class.findMany({
    where: baseWhere,
    include: {
      students: {
        include: {
          grades: {
            select: {
              percentage: true
            }
          }
        }
      }
    }
  })

  return classes.map(cls => {
    const allGrades = cls.students.flatMap(student => 
      student.grades.map(grade => grade.percentage)
    ).filter(percentage => percentage !== null) as number[]
    
    const averageScore = allGrades.length > 0 
      ? Math.round(allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length)
      : 0
    
    const passCount = allGrades.filter(grade => grade >= 60).length
    const passRate = allGrades.length > 0 
      ? Math.round((passCount / allGrades.length) * 100)
      : 0

    return {
      className: cls.name,
      averageScore,
      studentCount: cls.students.length,
      passRate
    }
  })
}

async function getAttendanceAnalytics(baseWhere: any, classWhere: any, startDate: Date) {
  // Overall attendance rate
  const totalAttendance = await prisma.attendance.count({
    where: {
      student: { ...baseWhere, ...classWhere },
      date: { gte: startDate }
    }
  })

  const presentCount = await prisma.attendance.count({
    where: {
      student: { ...baseWhere, ...classWhere },
      date: { gte: startDate },
      status: 'PRESENT'
    }
  })

  const overallAttendanceRate = totalAttendance > 0 
    ? Math.round((presentCount / totalAttendance) * 100)
    : 0

  // Monthly attendance trends
  const monthlyAttendance = await getMonthlyAttendance(baseWhere, classWhere, startDate)

  // Top performers
  const topPerformers = await getTopAttendancePerformers(baseWhere, classWhere, startDate)

  // Attendance by class
  const attendanceByClass = await getAttendanceByClass(baseWhere)

  return {
    overallAttendanceRate,
    monthlyAttendance,
    topPerformers,
    attendanceByClass
  }
}

async function getMonthlyAttendance(baseWhere: any, classWhere: any, startDate: Date) {
  // This is a simplified version - in a real implementation, you'd group by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  const last6Months = []
  
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12
    // Simulate attendance data - in real implementation, query actual data
    const rate = Math.floor(Math.random() * 20) + 80 // 80-100%
    last6Months.push({
      month: months[monthIndex],
      rate
    })
  }
  
  return last6Months
}

async function getTopAttendancePerformers(baseWhere: any, classWhere: any, startDate: Date) {
  // Simulate top performers - in real implementation, calculate actual rates
  const students = await prisma.student.findMany({
    where: { ...baseWhere, ...classWhere },
    select: {
      id: true,
      firstName: true,
      lastName: true
    },
    take: 10
  })

  return students.slice(0, 5).map(student => ({
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    attendanceRate: Math.floor(Math.random() * 10) + 90 // 90-100%
  }))
}

async function getAttendanceByClass(baseWhere: any) {
  const classes = await prisma.class.findMany({
    where: baseWhere,
    include: {
      _count: {
        select: { students: true }
      }
    },
    select: {
      name: true,
      _count: true
    }
  })

  return classes.map(cls => ({
    className: cls.name,
    attendanceRate: Math.floor(Math.random() * 20) + 80, // 80-100% simulated
    studentCount: cls._count.students
  }))
}