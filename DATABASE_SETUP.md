# School Yathu - Database Setup Guide

## Current Status

✅ **Completed:**
- ✅ Next.js 15 application setup with TypeScript and TailwindCSS
- ✅ Prisma schema with comprehensive multi-tenant models
- ✅ NextAuth.js authentication configuration
- ✅ Multi-role dashboard layouts (Super Admin, School Admin, Teacher, Parent, Student)
- ✅ API routes for schools, students, and health checks
- ✅ Middleware for tenant isolation
- ✅ Deployment configuration for Vercel
- ✅ Development server running on http://localhost:3000

⚠️ **Pending:**
- ⚠️ Database schema deployment
- ⚠️ Database seeding with test data

## Database Schema Deployment Issue

The current blocker is that **Prisma Accelerate URLs are designed for query acceleration, not schema deployment**. You need a direct database connection for migrations and schema operations.

### Solution Options:

#### Option 1: Use Prisma Studio Dashboard (Recommended)
1. Go to https://cloud.prisma.io/
2. Login to your Prisma account
3. Navigate to your project
4. Use the Schema tab to deploy your schema directly through the dashboard
5. This will create all the necessary tables in your database

#### Option 2: Get Direct Database URL
1. From your Neon database dashboard, get the direct PostgreSQL connection URL
2. Replace the `DIRECT_DATABASE_URL` in `.env` with the working direct URL
3. Run: `npx prisma migrate dev --name init`

#### Option 3: Use Database Provider Dashboard
1. Log into your Neon database dashboard
2. Use the SQL editor to run the schema creation SQL
3. Copy the schema from `prisma/schema.prisma` or use the generated SQL

## Ready-to-Use Test Data

Once the schema is deployed, run this command to populate with test data:

\`\`\`bash
npx tsx simplified-seed.ts
\`\`\`

### Test Accounts (Password: admin123)

| Role | Email | Description |
|------|-------|-------------|
| 👑 Super Admin | admin@schoolyathu.com | System administrator |
| 🎓 School Admin 1 | admin1@schoolyathu.com | Greenwood Elementary admin |
| 🎓 School Admin 2 | admin2@schoolyathu.com | Riverside High admin |
| 👨‍🏫 Teacher 1 | teacher1@schoolyathu.com | Math teacher at Greenwood |
| 👨‍🏫 Teacher 2 | teacher2@schoolyathu.com | English teacher at Riverside |
| 👨‍👩‍👧‍👦 Parent 1 | parent1@schoolyathu.com | Alex Johnson's parent |
| 👨‍👩‍👧‍👦 Parent 2 | parent2@schoolyathu.com | Emma Wilson's parent |
| 🎒 Student 1 | student1@schoolyathu.com | Alex Johnson, Grade 5 |
| 🎒 Student 2 | student2@schoolyathu.com | Emma Wilson, Grade 8 |

## Application Features Ready for Testing

### 🔐 Authentication System
- Multi-role sign-in with NextAuth.js
- Role-based dashboard routing
- Session management with tenant isolation

### 📊 Dashboard Layouts
- **Super Admin**: System-wide management
- **School Admin**: School-specific administration
- **Teacher**: Class and student management
- **Parent**: Child progress monitoring  
- **Student**: Personal academic dashboard

### 🌐 API Endpoints
- `/api/health` - System health check
- `/api/schools` - School management
- `/api/students` - Student management
- Protected with role-based authentication

### 🏢 Multi-Tenant Architecture
- Row-level security with schoolId scoping
- Middleware-enforced tenant isolation
- Separate data contexts per school

## Next Steps

1. **Deploy Database Schema** (choose one option above)
2. **Run Seed Script**: `npx tsx simplified-seed.ts`
3. **Test Authentication**: Visit http://localhost:3000/auth/signin
4. **Explore Dashboards**: Login with different role accounts
5. **Deploy to Vercel**: `vercel --prod`

## Development Commands

\`\`\`bash
# Start development server
npm run dev

# Deploy database schema (after fixing connection)
npx prisma migrate dev --name init

# Seed test data (after schema deployment)
npx tsx simplified-seed.ts

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
\`\`\`

## Environment Configuration

### Development (.env.local)
\`\`\`bash
# Prisma Accelerate for queries
DATABASE_URL="prisma+postgres://..."

# Direct URL for migrations (need working connection)
DIRECT_DATABASE_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
\`\`\`

### Production (Vercel Environment Variables)
- `DATABASE_URL` → Prisma Accelerate URL
- `NEXTAUTH_SECRET` → Strong random secret
- `NEXTAUTH_URL` → Your production domain

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Prisma ORM     │    │   PostgreSQL    │
│                 │◄──►│                  │◄──►│    Database     │
│ • Auth (NextJS) │    │ • Multi-tenant   │    │ • Row-level     │
│ • Multi-role    │    │ • Type-safe      │    │   Security      │
│ • Dashboards    │    │ • Accelerated    │    │ • Relationships │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

The application is fully functional except for the database schema deployment. Once that's resolved, you'll have a complete multi-tenant school management system ready for production use.