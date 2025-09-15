import { requireRole, UserRole } from "@/lib/auth-utils"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"

export default async function SchoolAdminDashboard() {
  const user = await requireRole([UserRole.SCHOOL_ADMIN])

  return (
    <DashboardLayout role="SCHOOL_ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.name}! Manage your school efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Students Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                    🎓
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Students</dt>
                  <dd className="text-lg font-semibold text-gray-900">342</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Teachers Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white">
                    👨‍🏫
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Teachers</dt>
                  <dd className="text-lg font-semibold text-gray-900">24</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Classes Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500 text-white">
                    📚
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Classes</dt>
                  <dd className="text-lg font-semibold text-gray-900">18</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500 text-white">
                    💰
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500">Monthly Revenue</dt>
                  <dd className="text-lg font-semibold text-gray-900">$12,450</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <Link href="/dashboard/students/add" className="block w-full text-left px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                + Add New Student
              </Link>
              <Link href="/dashboard/teachers/add" className="block w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 rounded-md hover:bg-green-100">
                + Add New Teacher
              </Link>
              <Link href="/dashboard/classes/add" className="block w-full text-left px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100">
                + Create New Class
              </Link>
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Enrollments</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      JS
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">John Smith</p>
                    <p className="text-xs text-gray-500">Grade 5A</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      MD
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Maria Davis</p>
                    <p className="text-xs text-gray-500">Grade 3B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pending Invoices</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">Tuition Fee - March</span>
                  <span className="text-sm font-medium text-red-600">$2,340</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">Bus Fee - March</span>
                  <span className="text-sm font-medium text-red-600">$890</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">Lab Fee - March</span>
                  <span className="text-sm font-medium text-red-600">$450</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}