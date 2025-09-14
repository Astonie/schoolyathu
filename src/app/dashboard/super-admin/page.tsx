import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"

export default async function SuperAdminDashboard() {
  const user = await requireRole([UserRole.SUPER_ADMIN])

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.name}! Manage all schools and system settings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Schools Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                    🏫
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Total Schools</dt>
                  <dd className="text-lg font-semibold text-gray-900">12</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white">
                    👥
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                  <dd className="text-lg font-semibold text-gray-900">1,247</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Students Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500 text-white">
                    🎓
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                  <dd className="text-lg font-semibold text-gray-900">856</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                    NS
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New school &quot;Bright Future Academy&quot; was created</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                    NU
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">25 new users registered today</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}