import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/health - Test database connectivity
export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT version()`
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      info: result
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        status: "error", 
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}