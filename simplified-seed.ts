import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simplified seed process...')

  try {
    // Generate unique IDs
    const generateId = () => `id_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`

    // Hash password once
    const hashedPassword = await bcrypt.hash('admin123', 10)

    console.log('🏫 Creating schools...')
    
    // Create first school
    const school1 = await prisma.school.create({
      data: {
        id: generateId(),
        name: 'Greenwood Elementary School',
        address: '123 Education Street, Learning City, LC 12345',
        phone: '+1-555-0101',
        email: 'admin@greenwood.edu'
      }
    })

    // Create second school
    const school2 = await prisma.school.create({
      data: {
        id: generateId(),
        name: 'Riverside High School',
        address: '456 Knowledge Avenue, Study Town, ST 67890',
        phone: '+1-555-0102',
        email: 'admin@riverside.edu'
      }
    })

    console.log('✅ Schools created successfully!')

    console.log('👑 Creating super admin...')
    
    const superAdmin = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'admin@schoolyathu.com',
        name: 'System Administrator',
        role: 'SUPER_ADMIN',
        active: true
      }
    })

    console.log('🎓 Creating school admins...')
    
    const schoolAdmin1 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'admin1@schoolyathu.com',
        name: 'School Admin 1',
        role: 'SCHOOL_ADMIN',
        schoolId: school1.id,
        active: true
      }
    })

    const schoolAdmin2 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'admin2@schoolyathu.com',
        name: 'School Admin 2',
        role: 'SCHOOL_ADMIN',
        schoolId: school2.id,
        active: true
      }
    })

    console.log('👨‍🏫 Creating teachers...')
    
    const teacher1 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'teacher1@schoolyathu.com',
        name: 'John Smith',
        role: 'TEACHER',
        schoolId: school1.id,
        active: true
      }
    })

    const teacherProfile1 = await prisma.teacher.create({
      data: {
        id: generateId(),
        userId: teacher1.id,
        employeeNumber: 'T0001',
        department: 'Mathematics',
        hireDate: new Date('2020-01-01'),
        schoolId: school1.id
      }
    })

    const teacher2 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'teacher2@schoolyathu.com',
        name: 'Emily Johnson',
        role: 'TEACHER',
        schoolId: school2.id,
        active: true
      }
    })

    const teacherProfile2 = await prisma.teacher.create({
      data: {
        id: generateId(),
        userId: teacher2.id,
        employeeNumber: 'T0002',
        department: 'English',
        hireDate: new Date('2021-01-01'),
        schoolId: school2.id
      }
    })

    console.log('👨‍👩‍👧‍👦 Creating parents...')
    
    const parent1 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'parent1@schoolyathu.com',
        name: 'William Johnson',
        role: 'PARENT',
        schoolId: school1.id,
        active: true
      }
    })

    const parentProfile1 = await prisma.parent.create({
      data: {
        id: generateId(),
        userId: parent1.id,
        occupation: 'Engineer',
        phoneNumber: '+1-555-0201',
        schoolId: school1.id
      }
    })

    const parent2 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'parent2@schoolyathu.com',
        name: 'Mary Wilson',
        role: 'PARENT',
        schoolId: school2.id,
        active: true
      }
    })

    const parentProfile2 = await prisma.parent.create({
      data: {
        id: generateId(),
        userId: parent2.id,
        occupation: 'Doctor',
        phoneNumber: '+1-555-0202',
        schoolId: school2.id
      }
    })

    console.log('🎒 Creating students...')
    
    const student1 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'student1@schoolyathu.com',
        name: 'Alex Johnson',
        role: 'STUDENT',
        schoolId: school1.id,
        active: true
      }
    })

    const studentProfile1 = await prisma.student.create({
      data: {
        id: generateId(),
        userId: student1.id,
        studentNumber: 'S000001',
        grade: 5,
        dateOfBirth: new Date('2015-05-15'),
        address: '101 Student Street, Learning City, LC 12341',
        emergencyContact: '+1-555-0301',
        schoolId: school1.id
      }
    })

    const student2 = await prisma.user.create({
      data: {
        id: generateId(),
        email: 'student2@schoolyathu.com',
        name: 'Emma Wilson',
        role: 'STUDENT',
        schoolId: school2.id,
        active: true
      }
    })

    const studentProfile2 = await prisma.student.create({
      data: {
        id: generateId(),
        userId: student2.id,
        studentNumber: 'S000002',
        grade: 8,
        dateOfBirth: new Date('2012-08-20'),
        address: '102 Student Street, Study Town, ST 67891',
        emergencyContact: '+1-555-0302',
        schoolId: school2.id
      }
    })

    console.log('📚 Creating subjects...')
    
    const subject1 = await prisma.subject.create({
      data: {
        id: generateId(),
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Basic Mathematics for Grade 5',
        grade: 5,
        schoolId: school1.id
      }
    })

    const subject2 = await prisma.subject.create({
      data: {
        id: generateId(),
        name: 'English Literature',
        code: 'ENG101',
        description: 'English Literature for Grade 8',
        grade: 8,
        schoolId: school2.id
      }
    })

    console.log('🏛️ Creating classes...')
    
    const class1 = await prisma.class.create({
      data: {
        id: generateId(),
        name: 'Grade 5 - Section A',
        grade: 5,
        section: 'A',
        teacherId: teacherProfile1.id,
        maxStudents: 30,
        schoolId: school1.id
      }
    })

    const class2 = await prisma.class.create({
      data: {
        id: generateId(),
        name: 'Grade 8 - Section A',
        grade: 8,
        section: 'A',
        teacherId: teacherProfile2.id,
        maxStudents: 30,
        schoolId: school2.id
      }
    })

    console.log('📊 Creating sample grades...')
    
    const grade1 = await prisma.grade.create({
      data: {
        id: generateId(),
        studentId: studentProfile1.id,
        subjectId: subject1.id,
        classId: class1.id,
        teacherId: teacherProfile1.id,
        score: 85,
        maxScore: 100,
        gradingPeriod: 'Q1',
        examType: 'MIDTERM',
        examDate: new Date('2024-03-15'),
        schoolId: school1.id
      }
    })

    const grade2 = await prisma.grade.create({
      data: {
        id: generateId(),
        studentId: studentProfile2.id,
        subjectId: subject2.id,
        classId: class2.id,
        teacherId: teacherProfile2.id,
        score: 92,
        maxScore: 100,
        gradingPeriod: 'Q1',
        examType: 'MIDTERM',
        examDate: new Date('2024-03-15'),
        schoolId: school2.id
      }
    })

    console.log('📅 Creating attendance records...')
    
    const attendance1 = await prisma.attendance.create({
      data: {
        id: generateId(),
        studentId: studentProfile1.id,
        classId: class1.id,
        teacherId: teacherProfile1.id,
        date: new Date('2024-03-01'),
        status: 'PRESENT',
        notes: 'Good participation',
        schoolId: school1.id
      }
    })

    const attendance2 = await prisma.attendance.create({
      data: {
        id: generateId(),
        studentId: studentProfile2.id,
        classId: class2.id,
        teacherId: teacherProfile2.id,
        date: new Date('2024-03-01'),
        status: 'PRESENT',
        schoolId: school2.id
      }
    })

    console.log('💰 Creating invoices...')
    
    const invoice1 = await prisma.invoice.create({
      data: {
        id: generateId(),
        studentId: studentProfile1.id,
        amount: 250.00,
        description: 'Monthly tuition fee',
        dueDate: new Date('2024-04-30'),
        status: 'PENDING',
        schoolId: school1.id
      }
    })

    const invoice2 = await prisma.invoice.create({
      data: {
        id: generateId(),
        studentId: studentProfile2.id,
        amount: 300.00,
        description: 'Monthly tuition fee',
        dueDate: new Date('2024-04-30'),
        status: 'PAID',
        paidAt: new Date('2024-04-15'),
        schoolId: school2.id
      }
    })

    console.log('✅ Seed data created successfully!')

    // Print summary
    const counts = {
      schools: await prisma.school.count(),
      users: await prisma.user.count(),
      students: await prisma.student.count(),
      teachers: await prisma.teacher.count(),
      parents: await prisma.parent.count(),
      classes: await prisma.class.count(),
      subjects: await prisma.subject.count(),
      grades: await prisma.grade.count(),
      attendance: await prisma.attendance.count(),
      invoices: await prisma.invoice.count()
    }

    console.log('\n📊 Database Summary:')
    console.log('==================')
    Object.entries(counts).forEach(([key, value]) => {
      console.log(`${key.padEnd(12)}: ${value}`)
    })

    console.log('\n🔑 Test Accounts:')
    console.log('================')
    console.log('🔐 Password for all accounts: admin123')
    console.log('')
    console.log('👑 Super Admin: admin@schoolyathu.com')
    console.log('🎓 School Admin 1: admin1@schoolyathu.com (Greenwood Elementary)')
    console.log('🎓 School Admin 2: admin2@schoolyathu.com (Riverside High)')
    console.log('👨‍🏫 Teacher 1: teacher1@schoolyathu.com (Math, Greenwood)')
    console.log('👨‍🏫 Teacher 2: teacher2@schoolyathu.com (English, Riverside)')
    console.log('👨‍👩‍👧‍👦 Parent 1: parent1@schoolyathu.com (Alex Johnson\'s parent)')
    console.log('👨‍👩‍👧‍👦 Parent 2: parent2@schoolyathu.com (Emma Wilson\'s parent)')
    console.log('🎒 Student 1: student1@schoolyathu.com (Alex Johnson, Grade 5)')
    console.log('🎒 Student 2: student2@schoolyathu.com (Emma Wilson, Grade 8)')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })