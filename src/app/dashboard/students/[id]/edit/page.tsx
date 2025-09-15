"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react'

interface Class {
  id: string
  name: string
  grade: string
  section: string
  capacity: number
  _count: {
    students: number
  }
}

interface Parent {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

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
  user: {
    email: string
    name: string
    active: boolean
  }
  class?: {
    id: string
    name: string
    grade: string
    section: string
  }
  parents: Array<{
    parent: {
      id: string
      firstName: string
      lastName: string
      phone: string
      email: string
    }
  }>
}

interface FormData {
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  address: string
  phone: string
  emergencyContact: string
  classId: string
  parentIds: string[]
  admissionDate: string
  nationality: string
  bloodGroup: string
  medicalConditions: string
  active: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function EditStudentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    emergencyContact: '',
    classId: '',
    parentIds: [],
    admissionDate: '',
    nationality: '',
    bloodGroup: '',
    medicalConditions: '',
    active: true
  })

  useEffect(() => {
    if (session && studentId) {
      fetchStudent()
      fetchClasses()
      fetchParents()
    }
  }, [session, studentId])

  const fetchStudent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const studentData = await response.json()
        setStudent(studentData)
        
        // Populate form with existing data
        setFormData({
          email: studentData.user.email,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dateOfBirth: studentData.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : '',
          gender: studentData.gender || '',
          address: studentData.address || '',
          phone: studentData.phone || '',
          emergencyContact: studentData.emergencyContact || '',
          classId: studentData.class?.id || '',
          parentIds: studentData.parents.map((p: any) => p.parent.id),
          admissionDate: studentData.admissionDate ? studentData.admissionDate.split('T')[0] : '',
          nationality: studentData.nationality || '',
          bloodGroup: studentData.bloodGroup || '',
          medicalConditions: studentData.medicalConditions || '',
          active: studentData.user.active
        })
      } else {
        setErrors({ fetch: 'Failed to load student data' })
      }
    } catch (error) {
      console.error('Error fetching student:', error)
      setErrors({ fetch: 'An error occurred while loading student data' })
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchParents = async () => {
    try {
      const response = await fetch('/api/parents')
      if (response.ok) {
        const data = await response.json()
        setParents(data.parents || data)
      }
    } catch (error) {
      console.error('Error fetching parents:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Date validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      } else if (age > 25) {
        newErrors.dateOfBirth = 'Student age seems too high. Please verify the date'
      } else if (age < 3) {
        newErrors.dateOfBirth = 'Student age seems too low. Please verify the date'
      }
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Emergency contact validation
    if (formData.emergencyContact && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.emergencyContact.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.emergencyContact = 'Please enter a valid emergency contact number'
    }

    // Class capacity validation (only if changing class)
    if (formData.classId && formData.classId !== student?.class?.id) {
      const selectedClass = classes.find(c => c.id === formData.classId)
      if (selectedClass && selectedClass._count.students >= selectedClass.capacity) {
        newErrors.classId = 'Selected class is at full capacity'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setSuccessMessage('')
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedStudent = await response.json()
        setSuccessMessage('Student information updated successfully!')
        
        // Refresh student data
        await fetchStudent()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Failed to update student' })
      }
    } catch (error) {
      console.error('Error updating student:', error)
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleParentSelection = (parentId: string) => {
    const isSelected = formData.parentIds.includes(parentId)
    const newParentIds = isSelected
      ? formData.parentIds.filter(id => id !== parentId)
      : [...formData.parentIds, parentId]
    
    handleInputChange('parentIds', newParentIds)
  }

  if (!session) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading student data...</span>
        </div>
      </div>
    )
  }

  if (errors.fetch) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{errors.fetch}</span>
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/students/${studentId}`}>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-gray-600">Update {student.firstName} {student.lastName}'s information</p>
        </div>
        <div className="text-sm text-gray-500">
          Student ID: {student.studentId}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Banner */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Account Active</span>
            </label>
            <div className={`px-2 py-1 rounded-full text-xs ${formData.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {formData.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="student.email@school.edu"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.gender ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter nationality"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter full address"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Conditions
            </label>
            <textarea
              value={formData.medicalConditions}
              onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter any medical conditions or allergies"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1-555-0123"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.emergencyContact ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1-555-0123"
              />
              {errors.emergencyContact && <p className="text-red-600 text-sm mt-1">{errors.emergencyContact}</p>}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Class
            </label>
            <select
              value={formData.classId}
              onChange={(e) => handleInputChange('classId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.classId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">No class assigned</option>
              {classes.map(cls => (
                <option 
                  key={cls.id} 
                  value={cls.id}
                  disabled={cls._count.students >= cls.capacity && cls.id !== student.class?.id}
                >
                  {cls.name} ({cls._count.students}/{cls.capacity} students)
                  {cls._count.students >= cls.capacity && cls.id !== student.class?.id && ' - FULL'}
                </option>
              ))}
            </select>
            {errors.classId && <p className="text-red-600 text-sm mt-1">{errors.classId}</p>}
            {student.class && (
              <p className="text-sm text-gray-500 mt-1">
                Currently in: {student.class.name}
              </p>
            )}
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Parent/Guardian Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Linked Parents
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {parents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No parents found.
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {parents.map(parent => (
                    <label key={parent.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.parentIds.includes(parent.id)}
                        onChange={() => handleParentSelection(parent.id)}
                        className="rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {parent.firstName} {parent.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {parent.phone} • {parent.email}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Currently linked to {formData.parentIds.length} parent(s)
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
          <Link href={`/dashboard/students/${studentId}`}>
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard/students">
              <button
                type="button"
                className="px-6 py-2 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Students
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}