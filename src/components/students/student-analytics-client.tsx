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
      firstName: string
      lastName: string
      attendanceRate: number
    }>
  }
  enrollment: {
    monthlyEnrollment: Array<{
      month: string
      count: number
    }>
    admissionsTrend: Array<{
      period: string
      admissions: number
      dropouts: number
      netGrowth: number
    }>
  }
}

export default function StudentAnalyticsClient() {
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

  const handleRefresh = () => {
    fetchAnalytics()
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        class: selectedClass
      })
      
      const response = await fetch(`/api/students/analytics/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `student-analytics-${timeRange}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/students">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and statistics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Classes</option>
              {analytics?.academic.classDistribution.map(cls => (
                <option key={cls.className} value={cls.className}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalStudents}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.overview.activeStudents}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Age</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageAge}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalClasses}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gender Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Gender Distribution
              </h3>
              <div className="space-y-3">
                {analytics.demographics.genderDistribution.map(item => (
                  <div key={item.gender} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${
                        item.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{item.gender}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
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
                {analytics.demographics.ageDistribution.map(item => (
                  <div key={item.ageRange} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.ageRange}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Utilization */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Class Utilization
              </h3>
              <div className="space-y-3">
                {analytics.academic.classDistribution.map(cls => (
                  <div key={cls.className} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{cls.className}</span>
                      <span className="text-sm text-gray-500">
                        {cls.studentCount}/{cls.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cls.utilizationPercentage > 90 ? 'bg-red-500' :
                          cls.utilizationPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${cls.utilizationPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nationality Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Nationality Distribution
              </h3>
              <div className="space-y-3">
                {analytics.demographics.nationalityDistribution.slice(0, 5).map(item => (
                  <div key={item.nationality} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.nationality || 'Not specified'}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Students/Class</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.overview.avgStudentsPerClass}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round((analytics.overview.activeStudents / analytics.overview.totalStudents) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inactive Students</span>
                  <span className="text-sm font-medium text-red-600">
                    {analytics.overview.inactiveStudents}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Enrollment Trend</h3>
              <div className="space-y-3">
                {analytics.enrollment.monthlyEnrollment.slice(-6).map(item => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${(item.count / Math.max(...analytics.enrollment.monthlyEnrollment.map(m => m.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}