"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  FileText, 
  DollarSign, 
  Settings,
  Menu,
  X,
  School,
  LogOut
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: string
}

const navigationItems = {
  SUPER_ADMIN: [
    { name: "Schools", href: "/dashboard/super-admin/schools", icon: School },
    { name: "Users", href: "/dashboard/super-admin/users", icon: Users },
    { name: "Settings", href: "/dashboard/super-admin/settings", icon: Settings },
  ],
  SCHOOL_ADMIN: [
    { name: "Dashboard", href: "/dashboard/school-admin", icon: School },
    { name: "Students", href: "/dashboard/school-admin/students", icon: GraduationCap },
    { name: "Teachers", href: "/dashboard/school-admin/teachers", icon: UserCheck },
    { name: "Parents", href: "/dashboard/school-admin/parents", icon: Users },
    { name: "Classes", href: "/dashboard/school-admin/classes", icon: Calendar },
    { name: "Subjects", href: "/dashboard/school-admin/subjects", icon: FileText },
    { name: "Invoices", href: "/dashboard/school-admin/invoices", icon: DollarSign },
    { name: "Settings", href: "/dashboard/school-admin/settings", icon: Settings },
  ],
  TEACHER: [
    { name: "Dashboard", href: "/dashboard/teacher", icon: School },
    { name: "My Classes", href: "/dashboard/teacher/classes", icon: Calendar },
    { name: "Students", href: "/dashboard/teacher/students", icon: GraduationCap },
    { name: "Attendance", href: "/dashboard/teacher/attendance", icon: UserCheck },
    { name: "Grades", href: "/dashboard/teacher/grades", icon: FileText },
    { name: "Profile", href: "/dashboard/teacher/profile", icon: Settings },
  ],
  PARENT: [
    { name: "Dashboard", href: "/dashboard/parent", icon: School },
    { name: "My Children", href: "/dashboard/parent/children", icon: GraduationCap },
    { name: "Grades", href: "/dashboard/parent/grades", icon: FileText },
    { name: "Attendance", href: "/dashboard/parent/attendance", icon: UserCheck },
    { name: "Invoices", href: "/dashboard/parent/invoices", icon: DollarSign },
    { name: "Profile", href: "/dashboard/parent/profile", icon: Settings },
  ],
  STUDENT: [
    { name: "Dashboard", href: "/dashboard/student", icon: School },
    { name: "My Grades", href: "/dashboard/student/grades", icon: FileText },
    { name: "Attendance", href: "/dashboard/student/attendance", icon: UserCheck },
    { name: "Assignments", href: "/dashboard/student/assignments", icon: Calendar },
    { name: "Profile", href: "/dashboard/student/profile", icon: Settings },
  ],
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()

  const navigation = navigationItems[role as keyof typeof navigationItems] || []

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
            <h2 className="text-lg font-semibold text-gray-900">School Yathu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-4">
            <h2 className="text-lg font-semibold text-gray-900">School Yathu</h2>
          </div>
          
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{role.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-3 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}