import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import StudentAnalyticsClient from "@/components/students/student-analytics-client"

export default async function StudentAnalyticsPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <StudentAnalyticsClient />
    </DashboardLayout>
  )
}