import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTables() {
  try {
    console.log('Checking database tables...')
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    
    console.log('📋 Existing tables:', tables)
    
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('⚠️ No tables found. Database schema needs to be deployed.')
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()