"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  Calendar,
  Clock,
  Award,
  MapPin,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalStudents: number
    activeStudents: number
    inactiveStudents: number
    averageAge: number
    totalClasses: number
    avgStudentsPerClass: number
  }
  enrollment: {
    monthlyEnrollment: Array<{
      month: string
      count: number
    }>
    yearlyTrend: Array<{
      year: number
      total: number
    }>
  }
  demographics: {
    genderDistribution: Array<{
      gender: string
      count: number
      percentage: number
    }>
    ageDistribution: Array<{
      ageRange: string
      count: number
      percentage: number
    }>
    nationalityDistribution: Array<{
      nationality: string
      count: number
      percentage: number
    }>
  }
  academic: {
    classDistribution: Array<{
      className: string
      grade: string
      studentCount: number
      capacity: number
      utilizationPercentage: number
    }>
    gradePerformance: Array<{
      className: string
      averageScore: number
      studentCount: number
      passRate: number
    }>
  }
  attendance: {
    overallAttendanceRate: number
    monthlyAttendance: Array<{
      month: string
      rate: number
    }>
    topPerformers: Array<{
      studentId: string
      studentName: string
      attendanceRate: number
    }>
    attendanceByClass: Array<{
      className: string
      attendanceRate: number
      studentCount: number
    }>
  }
}

export default function StudentAnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('12months')
  const [selectedClass, setSelectedClass] = useState('all')

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session, timeRange, selectedClass])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams({
        timeRange,
        class: selectedClass
      })
      
      const response = await fetch(`/api/students/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const exportAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        class: selectedClass,
        format: 'csv'
      })
      
      const response = await fetch(`/api/students/analytics/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `student-analytics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting analytics:', error)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Not Available</h1>
        <p className="text-gray-600 mt-2">Unable to load analytics data.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/students">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into student data and performance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="2years">Last 2 Years</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Classes</option>
            {analytics.academic.classDistribution.map(cls => (
              <option key={cls.className} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalStudents}</p>
              <p className="text-xs text-gray-500">{analytics.overview.activeStudents} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalClasses}</p>
              <p className="text-xs text-gray-500">Avg {analytics.overview.avgStudentsPerClass} students/class</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.attendance.overallAttendanceRate}%</p>
              <p className="text-xs text-gray-500">Overall average</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Age</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageAge}</p>
              <p className="text-xs text-gray-500">years old</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Enrollment Trends
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Enrollment</h4>
            <div className="space-y-2">
              {analytics.enrollment.monthlyEnrollment.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...analytics.enrollment.monthlyEnrollment.map(m => m.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Yearly Growth</h4>
            <div className="space-y-2">
              {analytics.enrollment.yearlyTrend.map((item, index) => {
                const previousYear = analytics.enrollment.yearlyTrend[index - 1]
                const growth = previousYear ? ((item.total - previousYear.total) / previousYear.total * 100) : 0
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.year}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{item.total}</span>
                      {index > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${growth > 0 ? 'bg-green-100 text-green-800' : growth < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Gender Distribution
          </h3>
          <div className="space-y-3">
            {analytics.demographics.genderDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.gender.toLowerCase()}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-pink-600'}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{item.count}</span>
                  <span className="text-xs text-gray-500 w-10">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Age Distribution
          </h3>
          <div className="space-y-3">
            {analytics.demographics.ageDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.ageRange}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{item.count}</span>
                  <span className="text-xs text-gray-500 w-10">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nationality Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Nationalities
          </h3>
          <div className="space-y-3">
            {analytics.demographics.nationalityDistribution.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.nationality || 'Not specified'}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{item.count}</span>
                  <span className="text-xs text-gray-500 w-10">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Class Utilization
          </h3>
          <div className="space-y-3">
            {analytics.academic.classDistribution.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.className}</span>
                  <span className="text-sm text-gray-500">{item.studentCount}/{item.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.utilizationPercentage > 90 ? 'bg-red-600' : item.utilizationPercentage > 75 ? 'bg-yellow-600' : 'bg-green-600'}`}
                    style={{ width: `${item.utilizationPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.utilizationPercentage}% utilization</span>
                  <span>Grade {item.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Academic Performance
          </h3>
          <div className="space-y-3">
            {analytics.academic.gradePerformance.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.className}</span>
                  <span className="text-sm text-gray-500">{item.studentCount} students</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Avg Score:</span>
                    <span className="text-sm font-medium text-gray-900">{item.averageScore}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Pass Rate:</span>
                    <span className={`text-sm font-medium ${item.passRate >= 80 ? 'text-green-600' : item.passRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {item.passRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance Analytics
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Attendance Trends</h4>
            <div className="space-y-2">
              {analytics.attendance.monthlyAttendance.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.rate >= 90 ? 'bg-green-600' : item.rate >= 80 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${item.rate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">{item.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Top Performers (Attendance)</h4>
            <div className="space-y-2">
              {analytics.attendance.topPerformers.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.studentName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600">{item.attendanceRate}%</span>
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Attendance by Class</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.attendance.attendanceByClass.map((item, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.className}</span>
                  <span className="text-xs text-gray-500">{item.studentCount} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.attendanceRate >= 90 ? 'bg-green-600' : item.attendanceRate >= 80 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${item.attendanceRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.attendanceRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}