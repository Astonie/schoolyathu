import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting production seed...')
  
  try {
    // Check if we can connect to the database
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Create or update super admin (NextAuth.js compatible)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@schoolyathu.com' },
      update: {},
      create: {
        id: 'clx1234567890123456789',
        email: 'admin@schoolyathu.com',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        active: true,
      }
    })
    
    console.log('✅ Super admin created:', superAdmin.email)
    
    // Create Bright Future School
    const school = await prisma.school.upsert({
      where: { id: 'clx1234567890123456788' },
      update: {},
      create: {
        id: 'clx1234567890123456788',
        name: 'Bright Future School',
        address: '123 Education Avenue, Learning City',
        phone: '+1-555-0123',
        email: 'admin@brightfuture.edu',
      }
    })
    
    console.log('✅ School created:', school.name)
    
    // Create school admin for Bright Future School
    const schoolAdmin = await prisma.user.upsert({
      where: { email: 'admin@brightfuture.edu' },
      update: {},
      create: {
        id: 'clx1234567890123456787',
        email: 'admin@brightfuture.edu',
        name: 'School Administrator',
        role: 'SCHOOL_ADMIN',
        schoolId: school.id,
        active: true,
      }
    })
    
    console.log('✅ School admin created:', schoolAdmin.email)
    
    console.log('🎉 Production seed completed!')
    console.log('🔑 Login credentials (use "password123" for any user):')
    console.log('   Super Admin: admin@schoolyathu.com / password123')
    console.log('   School Admin: admin@brightfuture.edu / password123')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})