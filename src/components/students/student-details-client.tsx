"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  GraduationCap,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  address: string
  phone: string
  emergencyContact: string
  nationality: string
  bloodGroup: string
  medicalConditions: string
  admissionDate: string
  active: boolean
  class?: {
    id: string
    name: string
    grade: string
    section: string
  }
  parents: {
    parent: {
      id: string
      firstName: string
      lastName: string
      phone: string
      email: string
    }
  }[]
  user: {
    email: string
    active: boolean
  }
}

export default function StudentDetailsClient() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session && studentId) {
      fetchStudent()
    }
  }, [session, studentId])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
      } else {
        setError('Failed to load student data')
      }
    } catch (error) {
      console.error('Error fetching student:', error)
      setError('An error occurred while loading student data')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading student details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Student not found</p>
        </div>
      </div>
    )
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/students">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-600">Student Details</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs ${
            student.user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {student.user.active ? 'Active' : 'Inactive'}
          </div>
          <Link href={`/dashboard/students/${studentId}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <p className="text-gray-900">{student.studentId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{student.user.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <p className="text-gray-900">{student.gender || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not specified'}
                    {student.dateOfBirth && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Age: {calculateAge(student.dateOfBirth)})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <p className="text-gray-900">{student.nationality || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <p className="text-gray-900">{student.bloodGroup || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Date
                </label>
                <p className="text-gray-900">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>

            {student.address && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <p className="text-gray-900">{student.address}</p>
                </div>
              </div>
            )}

            {student.medicalConditions && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Conditions
                </label>
                <p className="text-gray-900">{student.medicalConditions}</p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{student.phone}</p>
                  </div>
                </div>
              )}

              {student.emergencyContact && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{student.emergencyContact}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Parent/Guardian Information */}
          {student.parents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Parent/Guardian Information
              </h3>
              
              <div className="space-y-4">
                {student.parents.map((parentRelation, index) => (
                  <div key={parentRelation.parent.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {parentRelation.parent.firstName} {parentRelation.parent.lastName}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{parentRelation.parent.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{parentRelation.parent.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Class
                </label>
                {student.class ? (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="font-medium text-indigo-900">{student.class.name}</p>
                    <p className="text-sm text-indigo-700">
                      Grade {student.class.grade} - Section {student.class.section}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No class assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link href={`/dashboard/students/${studentId}/edit`}>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Edit className="h-4 w-4" />
                  Edit Student
                </button>
              </Link>
              
              <Link href="/dashboard/students">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Students
                </button>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Account Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  student.user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {student.user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admission Date</span>
                <span className="text-sm text-gray-900">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Parents Linked</span>
                <span className="text-sm text-gray-900">{student.parents.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}