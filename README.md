# School Yathu - Multi-Tenant School Management System

A comprehensive multi-tenant school management system built with Next.js, offering role-based dashboards for administrators, teachers, parents, and students.

## 🏫 Features

### Multi-Tenant Architecture
- **School Isolation**: Each school operates in its own secure environment
- **Data Segregation**: All data is scoped by `schoolId` for complete tenant isolation
- **Scalable**: Support for unlimited schools on a single platform

### Role-Based Access Control
- **Super Admin**: Manages all schools and system settings
- **School Admin**: Manages individual school operations
- **Teacher**: Manages classes, attendance, and grades
- **Parent**: Views children's progress and handles payments
- **Student**: Accesses personal academic information

### Core Modules
- ✅ **Student Management**: Registration, profiles, class assignments
- ✅ **Teacher Management**: Profiles, subject assignments, class management
- ✅ **Parent Management**: Account linking, communication
- ✅ **Class Management**: Class creation, student assignments
- ✅ **Subject Management**: Curriculum organization
- ✅ **Attendance Tracking**: Daily attendance management
- ✅ **Grade Management**: Assessment and report cards
- ✅ **Invoice System**: Fee management and payment tracking
- ✅ **Academic Year Management**: Term and semester organization

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **UI**: TailwindCSS with Lucide React icons
- **TypeScript**: Full type safety
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone and navigate to the project:**
   ```bash
   git clone <your-repo-url>
   cd schoolyathu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database URL and auth secrets:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/schoolyathu"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Setup the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🔐 Authentication

Default development credentials:
- **Email**: Any valid email address
- **Password**: `password123`

## 🌐 Deployment to Vercel

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL`: Your PostgreSQL connection string (Neon/Supabase)
   - `NEXTAUTH_SECRET`: Random secret for JWT signing
   - `NEXTAUTH_URL`: Your production domain

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## 📱 Usage

### Demo Credentials
Use any email with password `password123` to test the system.

## 🎯 Next Steps

- Set up your PostgreSQL database (Neon/Supabase recommended)
- Configure authentication providers
- Customize the UI and branding
- Add more advanced features
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
