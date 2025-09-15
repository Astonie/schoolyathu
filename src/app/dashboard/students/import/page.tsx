"use client"

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  FileSpreadsheet,
  Users,
  Eye,
  RefreshCw
} from 'lucide-react'

interface ImportResult {
  success: boolean
  message: string
  imported: number
  errors: Array<{
    row: number
    field: string
    message: string
    data: any
  }>
  duplicates: Array<{
    row: number
    email: string
    existingId: string
  }>
}

interface PreviewData {
  headers: string[]
  rows: any[][]
  totalRows: number
}

export default function StudentImportPage() {
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'import' | 'result'>('upload')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }

  const parseFile = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('File must contain at least headers and one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      )

      setPreview({
        headers,
        rows: rows.slice(0, 10), // Preview first 10 rows
        totalRows: rows.length
      })
      setStep('preview')
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file. Please ensure it\'s a valid CSV file.')
    }
  }

  const downloadTemplate = () => {
    const template = [
      'firstName,lastName,email,gender,dateOfBirth,className,address,phone,emergencyContact,nationality,bloodGroup,medicalConditions',
      'John,Doe,john.doe@example.com,MALE,2010-05-15,Grade 5A,123 Main St,+1-555-0123,+1-555-0124,American,O+,None',
      'Jane,Smith,jane.smith@example.com,FEMALE,2011-03-22,Grade 4B,456 Oak Ave,+1-555-0125,+1-555-0126,Canadian,A+,Asthma'
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student-import-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setStep('import')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('validate', 'true')

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      setImportResult(result)
      setStep('result')
    } catch (error) {
      console.error('Error importing students:', error)
      setImportResult({
        success: false,
        message: 'An unexpected error occurred during import',
        imported: 0,
        errors: [],
        duplicates: []
      })
      setStep('result')
    } finally {
      setImporting(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setPreview(null)
    setImportResult(null)
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/students">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Students</h1>
          <p className="text-gray-600">Bulk import student data from CSV files</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {[
            { key: 'upload', label: 'Upload File', icon: Upload },
            { key: 'preview', label: 'Preview Data', icon: Eye },
            { key: 'import', label: 'Import', icon: Users },
            { key: 'result', label: 'Results', icon: CheckCircle }
          ].map((stepItem, index) => {
            const isActive = step === stepItem.key
            const isCompleted = ['upload', 'preview', 'import'].indexOf(stepItem.key) < ['upload', 'preview', 'import'].indexOf(step)
            
            return (
              <div key={stepItem.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive ? 'border-indigo-600 bg-indigo-600 text-white' :
                  isCompleted ? 'border-green-600 bg-green-600 text-white' :
                  'border-gray-300 text-gray-500'
                }`}>
                  <stepItem.icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-indigo-600' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {stepItem.label}
                </span>
                {index < 3 && (
                  <div className={`ml-8 h-0.5 w-16 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">Download Template</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Use our template to ensure your data is formatted correctly for import.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 flex items-center gap-2 text-sm text-blue-800 hover:text-blue-900"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Student Data</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h4>
              <p className="text-gray-600 mb-4">
                Select a CSV file containing student data. Maximum file size: 10MB
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </button>
            </div>

            {/* Format Requirements */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Required fields: firstName, lastName, email, gender, dateOfBirth</li>
                <li>• Optional fields: className, address, phone, emergencyContact, nationality, bloodGroup, medicalConditions</li>
                <li>• Date format: YYYY-MM-DD (e.g., 2010-05-15)</li>
                <li>• Gender values: MALE or FEMALE</li>
                <li>• Email addresses must be unique</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && preview && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
              <div className="text-sm text-gray-600">
                Showing first 10 rows of {preview.totalRows} total rows
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th key={index} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={resetImport}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Choose Different File
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Import Students
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'import' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <RefreshCw className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Students...</h3>
          <p className="text-gray-600">Please wait while we process your file.</p>
        </div>
      )}

      {step === 'result' && importResult && (
        <div className="space-y-6">
          {/* Summary */}
          <div className={`rounded-lg p-6 ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-3">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  Import {importResult.success ? 'Completed' : 'Failed'}
                </h3>
                <p className={`text-sm mt-1 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {importResult.message}
                </p>
                {importResult.imported > 0 && (
                  <p className="text-sm text-green-700 mt-2">
                    Successfully imported {importResult.imported} students.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Duplicates */}
          {importResult.duplicates.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Duplicate Students Found</h3>
              <div className="space-y-2">
                {importResult.duplicates.map((duplicate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="text-sm text-yellow-800">
                      Row {duplicate.row}: {duplicate.email} already exists
                    </span>
                    <Link 
                      href={`/dashboard/students/${duplicate.existingId}`}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      View Student
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Errors</h3>
              <div className="space-y-2">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm text-red-800">
                      <strong>Row {error.row}:</strong> {error.message}
                    </div>
                    {error.field && (
                      <div className="text-xs text-red-600 mt-1">
                        Field: {error.field}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={resetImport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Import More Students
            </button>
            <Link 
              href="/dashboard/students"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              View All Students
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}