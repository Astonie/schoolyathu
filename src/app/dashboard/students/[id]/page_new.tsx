import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import StudentDetailsClient from "@/components/students/student-details-client"

export default async function StudentDetailsPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <StudentDetailsClient />
    </DashboardLayout>
  )
}