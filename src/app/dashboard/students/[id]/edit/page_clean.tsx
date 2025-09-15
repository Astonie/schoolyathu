import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import EditStudentForm from "@/components/students/edit-student-form"

export default async function EditStudentPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <EditStudentForm />
    </DashboardLayout>
  )
}
