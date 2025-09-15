import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"

export default async function SubjectsPage() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role={user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage curriculum subjects and academic programs
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              📚
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Subjects Module</h3>
            <p className="mt-1 text-sm text-gray-500">
              This module is coming soon. It will include curriculum management and subject assignment features.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}