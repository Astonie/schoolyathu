// Simple seed with basic data that doesn't require complex schema
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function simpleSeed() {
  console.log('🌱 Starting simple seed process...')
  
  try {
    // Test if we can perform basic operations
    console.log('🔍 Testing basic operations...')
    
    // Try to count existing records
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)
    
    if (userCount === 0) {
      console.log('📝 Database appears to be empty, but schema might not be deployed.')
      console.log('❗ Please deploy the schema first using the Prisma dashboard or direct database connection.')
      return
    }
    
    console.log('✅ Schema appears to be deployed, continuing with seed...')
    
    // Create a super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@schoolyathu.com',
        name: 'System Administrator',
        role: 'SUPER_ADMIN',
        active: true,
      }
    })
    
    console.log('✅ Super admin created:', superAdmin.email)
    
    // Create a test school
    const school = await prisma.school.create({
      data: {
        name: 'Demo School',
        address: '123 Education Street',
        phone: '+1-555-0123',
        email: 'info@demoschool.edu',
      }
    })
    
    console.log('✅ Demo school created:', school.name)
    
    console.log('🎉 Simple seed completed!')
    console.log('💡 Use email "admin@schoolyathu.com" with password "password123" to login')
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('Table') && error.message.includes('doesn\'t exist')) {
      console.log('❗ Database schema not deployed. Please run schema deployment first.')
      console.log('💡 This usually means the database tables haven\'t been created yet.')
    } else {
      console.error('❌ Seed failed:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

simpleSeed()