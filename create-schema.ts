import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSchema() {
  try {
    console.log('🚀 Creating database schema manually...')
    
    // Create enums first
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "GradeType" AS ENUM ('EXAM', 'ASSIGNMENT', 'QUIZ', 'PROJECT', 'HOMEWORK');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    
    console.log('✅ Enums created')
    
    // Create tables with basic structure
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "schools" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        website TEXT,
        logo TEXT,
        established TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP(3),
        name TEXT,
        image TEXT,
        role "UserRole" NOT NULL DEFAULT 'STUDENT',
        "schoolId" TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("schoolId") REFERENCES "schools"(id) ON DELETE CASCADE
      );
    `
    
    console.log('✅ Core tables created')
    console.log('🎉 Basic schema deployment completed!')
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createSchema()