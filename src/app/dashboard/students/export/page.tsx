import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import StudentsExportClient from "@/components/students/students-export-client"

export default async function StudentsExportPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <StudentsExportClient />
    </DashboardLayout>
  )
}