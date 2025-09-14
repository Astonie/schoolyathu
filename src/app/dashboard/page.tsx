import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  // Redirect to role-specific dashboard
  const roleRoutes = {
    SUPER_ADMIN: "/dashboard/super-admin",
    SCHOOL_ADMIN: "/dashboard/school-admin",
    TEACHER: "/dashboard/teacher", 
    PARENT: "/dashboard/parent",
    STUDENT: "/dashboard/student"
  }

  const redirectTo = roleRoutes[user.role as keyof typeof roleRoutes]
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to School Yathu</h1>
        <p className="text-gray-600">Your role-specific dashboard is being prepared...</p>
      </div>
    </div>
  )
}