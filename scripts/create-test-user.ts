// Simple script to create a test user
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('Creating test super admin user...')
    
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Test Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true,
      }
    })
    
    console.log('✅ Test user created successfully!')
    console.log('Email: admin@test.com')
    console.log('Password: password123')
    
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()