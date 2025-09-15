import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import AddStudentForm from "@/components/students/add-student-form"

export default async function AddStudentPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <AddStudentForm />
    </DashboardLayout>
  )
}
