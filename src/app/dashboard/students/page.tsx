import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import StudentsPageClient from "@/components/students/students-page-client"

export default async function StudentsPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <StudentsPageClient />
    </DashboardLayout>
  )
}