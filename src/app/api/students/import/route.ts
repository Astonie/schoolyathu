import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ImportError {
  row: number
  field: string
  message: string
  data: any
}

interface ImportResult {
  success: boolean
  message: string
  imported: number
  errors: ImportError[]
  duplicates: Array<{
    row: number
    email: string
    existingId: string
  }>
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

    // Only allow ADMIN and SUPER_ADMIN to import students
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const validate = formData.get('validate') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      )
    }

    // Parse CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'File must contain at least headers and one data row' },
        { status: 400 }
      )
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const dataRows = lines.slice(1)

    // Validate required headers
    const requiredHeaders = ['firstName', 'lastName', 'email', 'gender', 'dateOfBirth']
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      )
    }

    // Process each row
    const result: ImportResult = {
      success: true,
      message: '',
      imported: 0,
      errors: [],
      duplicates: []
    }

    // Get existing emails to check for duplicates
    const existingUsers = await prisma.user.findMany({
      where: {
        schoolId: session.user.schoolId
      },
      select: {
        email: true,
        student: {
          select: {
            id: true
          }
        }
      }
    })
    const existingEmails = new Map(
      existingUsers.map(user => [user.email.toLowerCase(), user.student?.id])
    )

    // Get existing classes for validation
    const classes = await prisma.class.findMany({
      where: {
        schoolId: session.user.schoolId
      },
      select: {
        name: true,
        id: true
      }
    })
    const classMap = new Map(classes.map(c => [c.name.toLowerCase(), c.id]))

    for (let i = 0; i < dataRows.length; i++) {
      const rowNumber = i + 2 // Account for header row
      const cells = dataRows[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
      
      try {
        // Map cells to data object
        const rowData: any = {}
        headers.forEach((header, index) => {
          rowData[header] = cells[index] || ''
        })

        // Validate required fields
        const errors = validateStudentData(rowData, rowNumber)
        if (errors.length > 0) {
          result.errors.push(...errors)
          continue
        }

        // Check for duplicate email
        if (existingEmails.has(rowData.email.toLowerCase())) {
          result.duplicates.push({
            row: rowNumber,
            email: rowData.email,
            existingId: existingEmails.get(rowData.email.toLowerCase()) || ''
          })
          continue
        }

        // Validate class if provided
        let classId = null
        if (rowData.className) {
          classId = classMap.get(rowData.className.toLowerCase())
          if (!classId) {
            result.errors.push({
              row: rowNumber,
              field: 'className',
              message: `Class "${rowData.className}" not found`,
              data: rowData
            })
            continue
          }
        }

        // If validation only, skip actual import
        if (!validate) {
          // Create user account
          const user = await prisma.user.create({
            data: {
              email: rowData.email,
              name: `${rowData.firstName} ${rowData.lastName}`,
              role: 'STUDENT',
              schoolId: session.user.schoolId!,
              active: true
            }
          })

          // Generate student ID
          const studentCount = await prisma.student.count({
            where: { schoolId: session.user.schoolId }
          })
          const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`

          // Create student profile
          await prisma.student.create({
            data: {
              userId: user.id,
              schoolId: session.user.schoolId!,
              studentId,
              firstName: rowData.firstName,
              lastName: rowData.lastName,
              dateOfBirth: new Date(rowData.dateOfBirth),
              gender: rowData.gender,
              address: rowData.address || null,
              phone: rowData.phone || null,
              emergencyContact: rowData.emergencyContact || null,
              classId,
              nationality: rowData.nationality || null,
              bloodGroup: rowData.bloodGroup || null,
              medicalConditions: rowData.medicalConditions || null,
              admissionDate: new Date()
            }
          })

          result.imported++
        }

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error)
        result.errors.push({
          row: rowNumber,
          field: 'general',
          message: 'Failed to process row data',
          data: cells
        })
      }
    }

    // Set final result message
    if (result.errors.length > 0 || result.duplicates.length > 0) {
      result.success = false
      result.message = `Import completed with ${result.errors.length} errors and ${result.duplicates.length} duplicates`
    } else {
      result.message = validate 
        ? 'Validation completed successfully. Ready to import.'
        : `Successfully imported ${result.imported} students`
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error importing students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function validateStudentData(data: any, rowNumber: number): ImportError[] {
  const errors: ImportError[] = []

  // Required field validation
  if (!data.firstName?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'firstName',
      message: 'First name is required',
      data
    })
  }

  if (!data.lastName?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'lastName',
      message: 'Last name is required',
      data
    })
  }

  if (!data.email?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'email',
      message: 'Email is required',
      data
    })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({
      row: rowNumber,
      field: 'email',
      message: 'Invalid email format',
      data
    })
  }

  if (!data.gender?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'gender',
      message: 'Gender is required',
      data
    })
  } else if (!['MALE', 'FEMALE'].includes(data.gender.toUpperCase())) {
    errors.push({
      row: rowNumber,
      field: 'gender',
      message: 'Gender must be MALE or FEMALE',
      data
    })
  }

  if (!data.dateOfBirth?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'dateOfBirth',
      message: 'Date of birth is required',
      data
    })
  } else {
    const date = new Date(data.dateOfBirth)
    if (isNaN(date.getTime())) {
      errors.push({
        row: rowNumber,
        field: 'dateOfBirth',
        message: 'Invalid date format. Use YYYY-MM-DD',
        data
      })
    } else if (date > new Date()) {
      errors.push({
        row: rowNumber,
        field: 'dateOfBirth',
        message: 'Date of birth cannot be in the future',
        data
      })
    }
  }

  // Optional field validation
  if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push({
      row: rowNumber,
      field: 'phone',
      message: 'Invalid phone number format',
      data
    })
  }

  if (data.emergencyContact && !/^[\+]?[1-9][\d]{0,15}$/.test(data.emergencyContact.replace(/[\s\-\(\)]/g, ''))) {
    errors.push({
      row: rowNumber,
      field: 'emergencyContact',
      message: 'Invalid emergency contact format',
      data
    })
  }

  if (data.bloodGroup && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(data.bloodGroup)) {
    errors.push({
      row: rowNumber,
      field: 'bloodGroup',
      message: 'Invalid blood group. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
      data
    })
  }

  return errors
}