"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Filter,
  RefreshCw,
  CheckCircle
} from 'lucide-react'

export default function StudentsExportClient() {
  const { data: session } = useSession()
  const [exporting, setExporting] = useState(false)
  const [exportFilters, setExportFilters] = useState({
    format: 'csv',
    includeInactive: false,
    classId: '',
    grade: '',
    dateRange: '6months'
  })

  const handleExport = async () => {
    setExporting(true)
    
    try {
      const params = new URLSearchParams()
      Object.entries(exportFilters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await fetch(`/api/students/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `students-export-${timestamp}.${exportFilters.format}`
        a.download = filename
        
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to export data')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('An error occurred during export')
    } finally {
      setExporting(false)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/students">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Students</h1>
          <p className="text-gray-600">Download student data in various formats</p>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Export Configuration
        </h3>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'csv', label: 'CSV', description: 'Comma-separated values (Excel compatible)' },
              { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
              { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' }
            ].map(format => (
              <label key={format.value} className="relative">
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={exportFilters.format === format.value}
                  onChange={(e) => setExportFilters({...exportFilters, format: e.target.value})}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  exportFilters.format === format.value 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{format.label}</p>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Status
            </label>
            <select
              value={exportFilters.includeInactive ? 'all' : 'active'}
              onChange={(e) => setExportFilters({
                ...exportFilters, 
                includeInactive: e.target.value === 'all'
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active Students Only</option>
              <option value="all">All Students (including inactive)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Filter
            </label>
            <select
              value={exportFilters.classId}
              onChange={(e) => setExportFilters({...exportFilters, classId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Classes</option>
              <option value="grade1">Grade 1</option>
              <option value="grade2">Grade 2</option>
              <option value="grade3">Grade 3</option>
              <option value="grade4">Grade 4</option>
              <option value="grade5">Grade 5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Filter
            </label>
            <select
              value={exportFilters.grade}
              onChange={(e) => setExportFilters({...exportFilters, grade: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Grades</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={exportFilters.dateRange}
              onChange={(e) => setExportFilters({...exportFilters, dateRange: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Data Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Data to Include
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'basic', label: 'Basic Information', description: 'Name, email, gender, DOB' },
              { key: 'contact', label: 'Contact Details', description: 'Phone, address, emergency contact' },
              { key: 'academic', label: 'Academic Data', description: 'Class, grades, performance' },
              { key: 'attendance', label: 'Attendance Records', description: 'Attendance history and rates' },
              { key: 'family', label: 'Family Information', description: 'Parent/guardian details' },
              { key: 'medical', label: 'Medical Information', description: 'Blood group, medical conditions' }
            ].map(field => (
              <label key={field.key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="mt-1 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{field.label}</p>
                  <p className="text-xs text-gray-600">{field.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Export Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Format: {exportFilters.format.toUpperCase()}</p>
            <p>• Students: {exportFilters.includeInactive ? 'All students' : 'Active students only'}</p>
            <p>• Classes: {exportFilters.classId || 'All classes'}</p>
            <p>• Time Range: {exportFilters.dateRange === 'all' ? 'All time' : exportFilters.dateRange}</p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/students">
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </Link>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Export Tips</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
              <li>• JSON format is useful for developers and data integration</li>
              <li>• Large exports may take a few moments to process</li>
              <li>• Exported data includes only information you have permission to access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}