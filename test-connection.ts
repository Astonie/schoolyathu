import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Try a simple query
    await prisma.$connect()
    console.log('✅ Successfully connected to database')
    
    // Try to get database version
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📋 Database info:', result)
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()