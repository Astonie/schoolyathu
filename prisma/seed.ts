import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')

  // Try to clear existing data - if it fails, continue anyway
  console.log('🧹 Attempting to clean existing data...')
  try {
    await prisma.grade.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.parentStudent.deleteMany()
    await prisma.classSubject.deleteMany()
    await prisma.teacherSubject.deleteMany()
    await prisma.student.deleteMany()
    await prisma.teacher.deleteMany()
    await prisma.parent.deleteMany()
    await prisma.class.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.academicYear.deleteMany()
    await prisma.user.deleteMany()
    await prisma.school.deleteMany()
    console.log('✅ Existing data cleaned')
  } catch {
    console.log('⚠️ Could not clean existing data (database may be empty or schema not deployed), continuing with seed...')
  }

  // Create Super Admin
  console.log('👤 Creating Super Admin...')
  await prisma.user.create({
    data: {
      email: 'superadmin@schoolyathu.com',
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      active: true,
    }
  })

  // Create Schools
  console.log('🏫 Creating schools...')
  const school1 = await prisma.school.create({
    data: {
      name: 'Bright Future Academy',
      address: '123 Education Street, Learning City, LC 12345',
      phone: '+1-555-0101',
      email: 'info@brightfuture.edu',
      website: 'https://brightfuture.edu',
      established: new Date('2010-01-15'),
    }
  })

  const school2 = await prisma.school.create({
    data: {
      name: 'Excellence High School',
      address: '456 Scholar Avenue, Knowledge Town, KT 67890',
      phone: '+1-555-0202',
      email: 'contact@excellencehigh.edu',
      website: 'https://excellencehigh.edu',
      established: new Date('2005-08-20'),
    }
  })

  // Create Academic Years
  console.log('📅 Creating academic years...')
  const academicYear1 = await prisma.academicYear.create({
    data: {
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      current: true,
      schoolId: school1.id,
    }
  })

  await prisma.academicYear.create({
    data: {
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      current: true,
      schoolId: school2.id,
    }
  })

  // Create School Admins
  console.log('👨‍💼 Creating school administrators...')
  await prisma.user.create({
    data: {
      email: 'admin@brightfuture.edu',
      name: 'Dr. Sarah Johnson',
      role: 'SCHOOL_ADMIN',
      schoolId: school1.id,
      active: true,
    }
  })

  await prisma.user.create({
    data: {
      email: 'admin@excellencehigh.edu',
      name: 'Mr. Michael Chen',
      role: 'SCHOOL_ADMIN',
      schoolId: school2.id,
      active: true,
    }
  })

  // Create Subjects for School 1
  console.log('📚 Creating subjects...')
  const subjects1 = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Fundamental mathematics concepts',
        schoolId: school1.id,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'English Language Arts',
        code: 'ELA101',
        description: 'Reading, writing, and literature',
        schoolId: school1.id,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Science',
        code: 'SCI101',
        description: 'General science and scientific method',
        schoolId: school1.id,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Social Studies',
        code: 'SS101',
        description: 'History, geography, and social concepts',
        schoolId: school1.id,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Physical Education',
        code: 'PE101',
        description: 'Physical fitness and sports',
        schoolId: school1.id,
      }
    })
  ])

  // Create Teachers for School 1
  console.log('👨‍🏫 Creating teachers...')
  const teacher1User = await prisma.user.create({
    data: {
      email: 'john.smith@brightfuture.edu',
      name: 'Mr. John Smith',
      role: 'TEACHER',
      schoolId: school1.id,
      active: true,
    }
  })

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacher1User.id,
      schoolId: school1.id,
      teacherId: 'TCH001',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'MALE',
      address: '789 Teacher Lane, Education City',
      phone: '+1-555-1001',
      qualification: 'M.Ed in Mathematics',
      hireDate: new Date('2020-08-01'),
      salary: 55000,
    }
  })

  const teacher2User = await prisma.user.create({
    data: {
      email: 'emma.davis@brightfuture.edu',
      name: 'Ms. Emma Davis',
      role: 'TEACHER',
      schoolId: school1.id,
      active: true,
    }
  })

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacher2User.id,
      schoolId: school1.id,
      teacherId: 'TCH002',
      firstName: 'Emma',
      lastName: 'Davis',
      dateOfBirth: new Date('1988-07-22'),
      gender: 'FEMALE',
      address: '456 Scholar Street, Learning District',
      phone: '+1-555-1002',
      qualification: 'B.A. in English Literature',
      hireDate: new Date('2019-01-15'),
      salary: 52000,
    }
  })

  const teacher3User = await prisma.user.create({
    data: {
      email: 'robert.wilson@brightfuture.edu',
      name: 'Dr. Robert Wilson',
      role: 'TEACHER',
      schoolId: school1.id,
      active: true,
    }
  })

  const teacher3 = await prisma.teacher.create({
    data: {
      userId: teacher3User.id,
      schoolId: school1.id,
      teacherId: 'TCH003',
      firstName: 'Robert',
      lastName: 'Wilson',
      dateOfBirth: new Date('1980-11-08'),
      gender: 'MALE',
      address: '321 Science Boulevard, Research Park',
      phone: '+1-555-1003',
      qualification: 'Ph.D. in Physics',
      hireDate: new Date('2018-09-01'),
      salary: 65000,
    }
  })

  // Assign subjects to teachers
  console.log('🔗 Assigning subjects to teachers...')
  await Promise.all([
    prisma.teacherSubject.create({
      data: {
        teacherId: teacher1.id,
        subjectId: subjects1[0].id, // Mathematics
      }
    }),
    prisma.teacherSubject.create({
      data: {
        teacherId: teacher2.id,
        subjectId: subjects1[1].id, // English
      }
    }),
    prisma.teacherSubject.create({
      data: {
        teacherId: teacher3.id,
        subjectId: subjects1[2].id, // Science
      }
    })
  ])

  // Create Classes for School 1
  console.log('🏛️ Creating classes...')
  const class1 = await prisma.class.create({
    data: {
      name: 'Grade 5 Section A',
      grade: 'Grade 5',
      section: 'A',
      capacity: 30,
      schoolId: school1.id,
      teacherId: teacher1.id,
      academicYearId: academicYear1.id,
    }
  })

  const class2 = await prisma.class.create({
    data: {
      name: 'Grade 5 Section B',
      grade: 'Grade 5',
      section: 'B',
      capacity: 30,
      schoolId: school1.id,
      teacherId: teacher2.id,
      academicYearId: academicYear1.id,
    }
  })

  const class3 = await prisma.class.create({
    data: {
      name: 'Grade 6 Section A',
      grade: 'Grade 6',
      section: 'A',
      capacity: 25,
      schoolId: school1.id,
      teacherId: teacher3.id,
      academicYearId: academicYear1.id,
    }
  })

  // Assign subjects to classes
  console.log('📖 Assigning subjects to classes...')
  for (const classItem of [class1, class2, class3]) {
    for (const subject of subjects1) {
      await prisma.classSubject.create({
        data: {
          classId: classItem.id,
          subjectId: subject.id,
        }
      })
    }
  }

  // Create Parents
  console.log('👨‍👩‍👧‍👦 Creating parents...')
  const parents = []
  for (let i = 1; i <= 10; i++) {
    const parentUser = await prisma.user.create({
      data: {
        email: `parent${i}@email.com`,
        name: `Parent ${i}`,
        role: 'PARENT',
        schoolId: school1.id,
        active: true,
      }
    })

    const parent = await prisma.parent.create({
      data: {
        userId: parentUser.id,
        schoolId: school1.id,
        firstName: `Parent`,
        lastName: `${i}`,
        phone: `+1-555-200${i}`,
        address: `${i}00 Parent Street, Family District`,
        occupation: i % 3 === 0 ? 'Engineer' : i % 3 === 1 ? 'Teacher' : 'Doctor',
      }
    })

    parents.push(parent)
  }

  // Create Students
  console.log('🎓 Creating students...')
  const students = []
  const studentNames = [
    { first: 'Alice', last: 'Johnson', gender: 'FEMALE' },
    { first: 'Bob', last: 'Smith', gender: 'MALE' },
    { first: 'Carol', last: 'Williams', gender: 'FEMALE' },
    { first: 'David', last: 'Brown', gender: 'MALE' },
    { first: 'Emma', last: 'Davis', gender: 'FEMALE' },
    { first: 'Frank', last: 'Miller', gender: 'MALE' },
    { first: 'Grace', last: 'Wilson', gender: 'FEMALE' },
    { first: 'Henry', last: 'Moore', gender: 'MALE' },
    { first: 'Ivy', last: 'Taylor', gender: 'FEMALE' },
    { first: 'Jack', last: 'Anderson', gender: 'MALE' },
    { first: 'Kelly', last: 'Thomas', gender: 'FEMALE' },
    { first: 'Leo', last: 'Jackson', gender: 'MALE' },
    { first: 'Mia', last: 'White', gender: 'FEMALE' },
    { first: 'Noah', last: 'Harris', gender: 'MALE' },
    { first: 'Olivia', last: 'Martin', gender: 'FEMALE' },
  ]

  const classes = [class1, class2, class3]
  
  for (let i = 0; i < studentNames.length; i++) {
    const studentName = studentNames[i]
    const assignedClass = classes[i % 3]
    
    const studentUser = await prisma.user.create({
      data: {
        email: `${studentName.first.toLowerCase()}.${studentName.last.toLowerCase()}@student.brightfuture.edu`,
        name: `${studentName.first} ${studentName.last}`,
        role: 'STUDENT',
        schoolId: school1.id,
        active: true,
      }
    })

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        schoolId: school1.id,
        studentId: `STU${String(i + 1).padStart(4, '0')}`,
        firstName: studentName.first,
        lastName: studentName.last,
        dateOfBirth: new Date(2014 - Math.floor(i / 5), (i % 12) + 1, (i % 28) + 1),
        gender: studentName.gender,
        address: `${i + 1}00 Student Avenue, Youth District`,
        phone: `+1-555-300${i + 1}`,
        emergencyContact: `+1-555-400${i + 1}`,
        classId: assignedClass.id,
      }
    })

    students.push(student)

    // Link students to parents
    const parentIndex = Math.floor(i / 1.5) % parents.length
    await prisma.parentStudent.create({
      data: {
        parentId: parents[parentIndex].id,
        studentId: student.id,
        relationship: i % 2 === 0 ? 'father' : 'mother',
      }
    })
  }

  // Create Attendance Records
  console.log('📅 Creating attendance records...')
  const today = new Date()
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(oneWeekAgo.getTime() + day * 24 * 60 * 60 * 1000)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    for (const student of students) {
      const status = Math.random() > 0.1 ? 'PRESENT' : Math.random() > 0.5 ? 'ABSENT' : 'LATE'
      
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId!,
          teacherId: teacher1.id,
          academicYearId: academicYear1.id,
          schoolId: school1.id,
          date: date,
          status: status,
          remarks: status === 'ABSENT' ? 'Sick' : status === 'LATE' ? 'Traffic delay' : '',
        }
      })
    }
  }

  // Create Grades
  console.log('📊 Creating grades...')
  for (const student of students) {
    for (const subject of subjects1.slice(0, 3)) { // Math, English, Science
      // Midterm exam
      await prisma.grade.create({
        data: {
          studentId: student.id,
          subjectId: subject.id,
          classId: student.classId!,
          teacherId: teacher1.id,
          academicYearId: academicYear1.id,
          schoolId: school1.id,
          type: 'EXAM',
          name: 'Midterm Examination',
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          maxScore: 100,
          percentage: 0, // Will be calculated
          grade: '', // Will be calculated
          date: new Date('2024-11-15'),
        }
      })

      // Assignment
      await prisma.grade.create({
        data: {
          studentId: student.id,
          subjectId: subject.id,
          classId: student.classId!,
          teacherId: teacher1.id,
          academicYearId: academicYear1.id,
          schoolId: school1.id,
          type: 'ASSIGNMENT',
          name: 'Research Project',
          score: Math.floor(Math.random() * 20) + 80, // 80-100
          maxScore: 100,
          percentage: 0, // Will be calculated
          grade: '', // Will be calculated
          date: new Date('2024-10-20'),
        }
      })
    }
  }

  // Update grade percentages and letter grades
  console.log('🔢 Calculating grade percentages...')
  const grades = await prisma.grade.findMany()
  for (const grade of grades) {
    const percentage = (grade.score / grade.maxScore) * 100
    let letterGrade = 'F'
    if (percentage >= 90) letterGrade = 'A'
    else if (percentage >= 80) letterGrade = 'B'
    else if (percentage >= 70) letterGrade = 'C'
    else if (percentage >= 60) letterGrade = 'D'

    await prisma.grade.update({
      where: { id: grade.id },
      data: {
        percentage: percentage,
        grade: letterGrade,
      }
    })
  }

  // Create Invoices
  console.log('💰 Creating invoices...')
  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    const parent = parents[Math.floor(i / 1.5) % parents.length]
    
    // Tuition invoice
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-TUI-${String(i + 1).padStart(4, '0')}`,
        studentId: student.id,
        parentId: parent.id,
        schoolId: school1.id,
        title: 'Monthly Tuition Fee',
        description: 'Tuition fee for the month of November 2024',
        amount: 450.00,
        dueDate: new Date('2024-11-30'),
        status: i % 3 === 0 ? 'PAID' : i % 3 === 1 ? 'PENDING' : 'OVERDUE',
        paidDate: i % 3 === 0 ? new Date('2024-11-15') : null,
      }
    })

    // Book fee invoice
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-BOOK-${String(i + 1).padStart(4, '0')}`,
        studentId: student.id,
        parentId: parent.id,
        schoolId: school1.id,
        title: 'Book and Supplies Fee',
        description: 'Academic books and supplies for 2024-2025',
        amount: 120.00,
        dueDate: new Date('2024-12-15'),
        status: i % 4 === 0 ? 'PAID' : 'PENDING',
        paidDate: i % 4 === 0 ? new Date('2024-11-20') : null,
      }
    })
  }

  console.log('✅ Seed completed successfully!')
  
  // Print summary
  console.log('\n📋 SEED SUMMARY:')
  console.log(`- Super Admin: 1 user`)
  console.log(`- Schools: 2 schools`)
  console.log(`- School Admins: 2 users`)
  console.log(`- Teachers: 3 users`)
  console.log(`- Students: ${students.length} users`)
  console.log(`- Parents: ${parents.length} users`)
  console.log(`- Classes: 3 classes`)
  console.log(`- Subjects: ${subjects1.length} subjects`)
  console.log(`- Attendance records: ~${students.length * 5} records`)
  console.log(`- Grades: ~${students.length * 6} grades`)
  console.log(`- Invoices: ${students.length * 2} invoices`)
  
  console.log('\n🔑 TEST CREDENTIALS:')
  console.log('Super Admin: superadmin@schoolyathu.com')
  console.log('School Admin: admin@brightfuture.edu')
  console.log('Teacher: john.smith@brightfuture.edu')
  console.log('Parent: parent1@email.com')
  console.log('Student: alice.johnson@student.brightfuture.edu')
  console.log('Password for all users: password123')
  
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })