import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed process...')

  try {
    // First, let's try to create the tables using raw SQL
    console.log('📊 Creating database schema...')
    
    // Create tables in the correct order (respecting foreign key dependencies)
    const createTablesSQL = `
      -- Create User table first (no dependencies)
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'STUDENT',
        "schoolId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

      -- Create School table (no dependencies)
      CREATE TABLE IF NOT EXISTS "schools" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints for schools
      CREATE UNIQUE INDEX IF NOT EXISTS "schools_email_key" ON "schools"("email");

      -- Create Student table
      CREATE TABLE IF NOT EXISTS "students" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "studentNumber" TEXT NOT NULL,
        "grade" INTEGER NOT NULL,
        "dateOfBirth" TIMESTAMP(3) NOT NULL,
        "address" TEXT NOT NULL,
        "emergencyContact" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "students_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints for students
      CREATE UNIQUE INDEX IF NOT EXISTS "students_userId_key" ON "students"("userId");
      CREATE UNIQUE INDEX IF NOT EXISTS "students_studentNumber_schoolId_key" ON "students"("studentNumber", "schoolId");

      -- Create Teacher table
      CREATE TABLE IF NOT EXISTS "teachers" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "employeeNumber" TEXT NOT NULL,
        "department" TEXT NOT NULL,
        "hireDate" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints for teachers
      CREATE UNIQUE INDEX IF NOT EXISTS "teachers_userId_key" ON "teachers"("userId");
      CREATE UNIQUE INDEX IF NOT EXISTS "teachers_employeeNumber_schoolId_key" ON "teachers"("employeeNumber", "schoolId");

      -- Create Parent table
      CREATE TABLE IF NOT EXISTS "parents" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "occupation" TEXT,
        "phoneNumber" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints for parents
      CREATE UNIQUE INDEX IF NOT EXISTS "parents_userId_key" ON "parents"("userId");

      -- Create Class table
      CREATE TABLE IF NOT EXISTS "classes" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "grade" INTEGER NOT NULL,
        "section" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "maxStudents" INTEGER NOT NULL DEFAULT 30,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints for classes
      CREATE UNIQUE INDEX IF NOT EXISTS "classes_name_grade_section_schoolId_key" ON "classes"("name", "grade", "section", "schoolId");

      -- Create Subject table
      CREATE TABLE IF NOT EXISTS "subjects" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "description" TEXT,
        "grade" INTEGER NOT NULL,
        "schoolId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints for subjects
      CREATE UNIQUE INDEX IF NOT EXISTS "subjects_code_schoolId_key" ON "subjects"("code", "schoolId");

      -- Create Grade table
      CREATE TABLE IF NOT EXISTS "grades" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "subjectId" TEXT NOT NULL,
        "classId" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "score" DOUBLE PRECISION NOT NULL,
        "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
        "gradingPeriod" TEXT NOT NULL,
        "examType" TEXT NOT NULL,
        "examDate" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
      );

      -- Create Attendance table
      CREATE TABLE IF NOT EXISTS "attendances" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "classId" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PRESENT',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
      );

      -- Create unique constraints for attendance
      CREATE UNIQUE INDEX IF NOT EXISTS "attendances_studentId_date_key" ON "attendances"("studentId", "date");

      -- Create Invoice table
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL,
        "dueDate" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "paidAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
      );

      -- Create join tables
      CREATE TABLE IF NOT EXISTS "_StudentClasses" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "_StudentClasses_AB_unique" ON "_StudentClasses"("A", "B");
      CREATE INDEX IF NOT EXISTS "_StudentClasses_B_index" ON "_StudentClasses"("B");

      CREATE TABLE IF NOT EXISTS "_StudentParents" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "_StudentParents_AB_unique" ON "_StudentParents"("A", "B");
      CREATE INDEX IF NOT EXISTS "_StudentParents_B_index" ON "_StudentParents"("B");

      CREATE TABLE IF NOT EXISTS "_SubjectTeachers" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "_SubjectTeachers_AB_unique" ON "_SubjectTeachers"("A", "B");
      CREATE INDEX IF NOT EXISTS "_SubjectTeachers_B_index" ON "_SubjectTeachers"("B");

      -- Add foreign key constraints
      ALTER TABLE "users" ADD CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "teachers" ADD CONSTRAINT "teachers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "parents" ADD CONSTRAINT "parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "parents" ADD CONSTRAINT "parents_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "classes" ADD CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "subjects" ADD CONSTRAINT "subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "grades" ADD CONSTRAINT "grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "grades" ADD CONSTRAINT "grades_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "grades" ADD CONSTRAINT "grades_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "grades" ADD CONSTRAINT "grades_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "grades" ADD CONSTRAINT "grades_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "attendances" ADD CONSTRAINT "attendances_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "attendances" ADD CONSTRAINT "attendances_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "attendances" ADD CONSTRAINT "attendances_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "invoices" ADD CONSTRAINT "invoices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "invoices" ADD CONSTRAINT "invoices_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      ALTER TABLE "_StudentClasses" ADD CONSTRAINT "_StudentClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "_StudentClasses" ADD CONSTRAINT "_StudentClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "_StudentParents" ADD CONSTRAINT "_StudentParents_A_fkey" FOREIGN KEY ("A") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "_StudentParents" ADD CONSTRAINT "_StudentParents_B_fkey" FOREIGN KEY ("B") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "_SubjectTeachers" ADD CONSTRAINT "_SubjectTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "_SubjectTeachers" ADD CONSTRAINT "_SubjectTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    // Execute the schema creation (this might fail if using Accelerate)
    try {
      await prisma.$executeRawUnsafe(createTablesSQL)
      console.log('✅ Database schema created successfully!')
    } catch (error) {
      console.log('⚠️ Schema creation skipped (might already exist or using Accelerate)')
      console.log('Error:', error.message)
    }

    // Generate unique IDs
    const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

    // Clear existing data (if any)
    console.log('🧹 Clearing existing data...')
    try {
      await prisma.$executeRaw`TRUNCATE TABLE "attendances", "grades", "invoices", "_StudentClasses", "_StudentParents", "_SubjectTeachers", "subjects", "classes", "parents", "teachers", "students", "users", "schools" RESTART IDENTITY CASCADE`
    } catch (error) {
      console.log('⚠️ Data clearing skipped:', error.message)
    }

    // Create Schools
    console.log('🏫 Creating schools...')
    const schools = [
      {
        id: generateId(),
        name: 'Greenwood Elementary School',
        address: '123 Education Street, Learning City, LC 12345',
        phone: '+1-555-0101',
        email: 'admin@greenwood.edu'
      },
      {
        id: generateId(),
        name: 'Riverside High School',
        address: '456 Knowledge Avenue, Study Town, ST 67890',
        phone: '+1-555-0102',
        email: 'admin@riverside.edu'
      }
    ]

    for (const school of schools) {
      await prisma.school.upsert({
        where: { email: school.email },
        update: {},
        create: school
      })
    }

    console.log('✅ Schools created successfully!')

    // Create Super Admin
    console.log('👑 Creating super admin...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@schoolyathu.com' },
      update: {},
      create: {
        id: generateId(),
        email: 'admin@schoolyathu.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })

    // Create School Admins
    console.log('🎓 Creating school admins...')
    const schoolAdmins = []
    
    for (let i = 0; i < schools.length; i++) {
      const admin = await prisma.user.upsert({
        where: { email: `admin${i + 1}@schoolyathu.com` },
        update: {},
        create: {
          id: generateId(),
          email: `admin${i + 1}@schoolyathu.com`,
          password: hashedPassword,
          name: `School Admin ${i + 1}`,
          role: 'SCHOOL_ADMIN',
          schoolId: schools[i].id,
          isActive: true
        }
      })
      schoolAdmins.push(admin)
    }

    // Create Teachers
    console.log('👨‍🏫 Creating teachers...')
    const teachers = []
    const teacherNames = [
      'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis',
      'Robert Wilson', 'Lisa Anderson', 'David Martinez', 'Jennifer Taylor'
    ]
    const departments = ['Mathematics', 'English', 'Science', 'History', 'Art', 'Physical Education']

    for (let i = 0; i < teacherNames.length; i++) {
      const schoolId = schools[i % schools.length].id
      const user = await prisma.user.create({
        data: {
          id: generateId(),
          email: `teacher${i + 1}@schoolyathu.com`,
          password: hashedPassword,
          name: teacherNames[i],
          role: 'TEACHER',
          schoolId,
          isActive: true
        }
      })

      const teacher = await prisma.teacher.create({
        data: {
          id: generateId(),
          userId: user.id,
          schoolId,
          employeeNumber: `T${String(i + 1).padStart(4, '0')}`,
          department: departments[i % departments.length],
          hireDate: new Date(2020 + (i % 4), (i % 12), 1)
        }
      })

      teachers.push(teacher)
    }

    // Create Parents
    console.log('👨‍👩‍👧‍👦 Creating parents...')
    const parents = []
    const parentNames = [
      'William Johnson', 'Mary Wilson', 'James Brown', 'Patricia Davis',
      'Robert Miller', 'Jennifer Garcia', 'Michael Rodriguez', 'Linda Martinez'
    ]

    for (let i = 0; i < parentNames.length; i++) {
      const schoolId = schools[i % schools.length].id
      const user = await prisma.user.create({
        data: {
          id: generateId(),
          email: `parent${i + 1}@schoolyathu.com`,
          password: hashedPassword,
          name: parentNames[i],
          role: 'PARENT',
          schoolId,
          isActive: true
        }
      })

      const parent = await prisma.parent.create({
        data: {
          id: generateId(),
          userId: user.id,
          schoolId,
          occupation: ['Engineer', 'Doctor', 'Teacher', 'Lawyer', 'Business Owner'][i % 5],
          phoneNumber: `+1-555-${String(200 + i).padStart(4, '0')}`
        }
      })

      parents.push(parent)
    }

    // Create Students
    console.log('🎒 Creating students...')
    const students = []
    const studentNames = [
      'Alex Johnson', 'Emma Wilson', 'Oliver Brown', 'Sophia Davis',
      'Noah Miller', 'Isabella Garcia', 'Liam Rodriguez', 'Ava Martinez',
      'William Jones', 'Mia Anderson', 'Benjamin Taylor', 'Charlotte Thomas'
    ]

    for (let i = 0; i < studentNames.length; i++) {
      const schoolId = schools[i % schools.length].id
      const user = await prisma.user.create({
        data: {
          id: generateId(),
          email: `student${i + 1}@schoolyathu.com`,
          password: hashedPassword,
          name: studentNames[i],
          role: 'STUDENT',
          schoolId,
          isActive: true
        }
      })

      const student = await prisma.student.create({
        data: {
          id: generateId(),
          userId: user.id,
          schoolId,
          studentNumber: `S${String(i + 1).padStart(6, '0')}`,
          grade: Math.floor(Math.random() * 12) + 1,
          dateOfBirth: new Date(2005 + (i % 10), (i % 12), (i % 28) + 1),
          address: `${100 + i} Student Street, Learning City, LC 1234${i}`,
          emergencyContact: `+1-555-${String(300 + i).padStart(4, '0')}`
        }
      })

      students.push(student)

      // Connect student to parent
      if (parents[i % parents.length]) {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            parents: {
              connect: { id: parents[i % parents.length].id }
            }
          }
        })
      }
    }

    // Create Subjects
    console.log('📚 Creating subjects...')
    const subjects = []
    const subjectData = [
      { name: 'Mathematics', code: 'MATH101' },
      { name: 'English Literature', code: 'ENG101' },
      { name: 'Physics', code: 'PHY101' },
      { name: 'Chemistry', code: 'CHE101' },
      { name: 'Biology', code: 'BIO101' },
      { name: 'History', code: 'HIS101' },
      { name: 'Geography', code: 'GEO101' },
      { name: 'Art', code: 'ART101' }
    ]

    for (const school of schools) {
      for (const subjectInfo of subjectData) {
        const subject = await prisma.subject.create({
          data: {
            id: generateId(),
            name: subjectInfo.name,
            code: `${subjectInfo.code}-${school.id.slice(-3)}`,
            description: `${subjectInfo.name} curriculum for ${school.name}`,
            grade: Math.floor(Math.random() * 12) + 1,
            schoolId: school.id
          }
        })
        subjects.push(subject)

        // Connect subjects to teachers
        const schoolTeachers = teachers.filter(t => t.schoolId === school.id)
        if (schoolTeachers.length > 0) {
          const teacher = schoolTeachers[Math.floor(Math.random() * schoolTeachers.length)]
          await prisma.subject.update({
            where: { id: subject.id },
            data: {
              teachers: {
                connect: { id: teacher.id }
              }
            }
          })
        }
      }
    }

    // Create Classes
    console.log('🏛️ Creating classes...')
    const classes = []
    
    for (const school of schools) {
      const schoolTeachers = teachers.filter(t => t.schoolId === school.id)
      const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      const sections = ['A', 'B', 'C']

      for (const grade of grades.slice(0, 6)) { // Create classes for grades 1-6
        for (const section of sections.slice(0, 2)) { // Create sections A and B
          if (schoolTeachers.length > 0) {
            const teacher = schoolTeachers[Math.floor(Math.random() * schoolTeachers.length)]
            const classRoom = await prisma.class.create({
              data: {
                id: generateId(),
                name: `Grade ${grade} - Section ${section}`,
                grade,
                section,
                teacherId: teacher.id,
                schoolId: school.id,
                maxStudents: 30
              }
            })
            classes.push(classRoom)

            // Connect students to classes
            const schoolStudents = students.filter(s => s.schoolId === school.id && s.grade === grade)
            for (const student of schoolStudents.slice(0, 25)) { // Max 25 students per class
              await prisma.class.update({
                where: { id: classRoom.id },
                data: {
                  students: {
                    connect: { id: student.id }
                  }
                }
              })
            }
          }
        }
      }
    }

    console.log('🎯 Creating sample data...')

    // Create sample grades
    for (const student of students.slice(0, 10)) {
      const studentClasses = await prisma.class.findMany({
        where: { 
          schoolId: student.schoolId,
          students: { some: { id: student.id } }
        },
        include: { teacher: true }
      })

      for (const classRoom of studentClasses) {
        const classSubjects = await prisma.subject.findMany({
          where: { 
            schoolId: student.schoolId,
            grade: classRoom.grade 
          }
        })

        for (const subject of classSubjects.slice(0, 3)) {
          await prisma.grade.create({
            data: {
              id: generateId(),
              studentId: student.id,
              subjectId: subject.id,
              classId: classRoom.id,
              teacherId: classRoom.teacherId,
              schoolId: student.schoolId,
              score: Math.floor(Math.random() * 40) + 60, // Score between 60-100
              maxScore: 100,
              gradingPeriod: 'Q1',
              examType: 'MIDTERM',
              examDate: new Date(2024, 2, 15)
            }
          })
        }
      }
    }

    // Create sample attendance
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const attendanceDate = new Date(today)
      attendanceDate.setDate(today.getDate() - i)

      for (const student of students.slice(0, 15)) {
        const studentClasses = await prisma.class.findMany({
          where: { 
            schoolId: student.schoolId,
            students: { some: { id: student.id } }
          }
        })

        for (const classRoom of studentClasses.slice(0, 1)) {
          await prisma.attendance.create({
            data: {
              id: generateId(),
              studentId: student.id,
              classId: classRoom.id,
              teacherId: classRoom.teacherId,
              schoolId: student.schoolId,
              date: attendanceDate,
              status: Math.random() > 0.1 ? 'PRESENT' : Math.random() > 0.5 ? 'ABSENT' : 'LATE',
              notes: Math.random() > 0.8 ? 'Good participation' : null
            }
          })
        }
      }
    }

    // Create sample invoices
    for (const student of students.slice(0, 10)) {
      await prisma.invoice.create({
        data: {
          id: generateId(),
          studentId: student.id,
          schoolId: student.schoolId,
          amount: Math.floor(Math.random() * 500) + 100,
          description: 'Monthly tuition fee',
          dueDate: new Date(2024, 3, 30),
          status: Math.random() > 0.3 ? 'PAID' : 'PENDING',
          paidAt: Math.random() > 0.3 ? new Date(2024, 3, 15) : null
        }
      })
    }

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
    console.log('Super Admin: admin@schoolyathu.com / admin123')
    console.log('School Admin: admin1@schoolyathu.com / admin123')
    console.log('Teacher: teacher1@schoolyathu.com / admin123')
    console.log('Parent: parent1@schoolyathu.com / admin123')
    console.log('Student: student1@schoolyathu.com / admin123')

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