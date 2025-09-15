import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import StudentsImportClient from "@/components/students/students-import-client"

export default async function StudentsImportPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <StudentsImportClient />
    </DashboardLayout>
  )
}