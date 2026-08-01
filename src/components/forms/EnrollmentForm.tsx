'use client'

import { useState, useEffect } from 'react'

interface EnrollmentFormProps {
  studentId?: string
  administratorId: string
  onSuccess?: (enrollment: any) => void
  onError?: (error: string) => void
}

export function EnrollmentForm({
  studentId: initialStudentId,
  administratorId,
  onSuccess,
  onError,
}: EnrollmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState(initialStudentId || '')
  const [selectedClass, setSelectedClass] = useState('')
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/admin/students')
        if (response.ok) {
          const data = await response.json()
          setStudents(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    }

    fetchStudents()
  }, [])

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/admin/classes')
        if (response.ok) {
          const data = await response.json()
          setClasses(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    fetchClasses()
  }, [])

  // Filter classes when student is selected
  useEffect(() => {
    if (selectedStudent) {
      // In a real app, you'd filter by class capacity and student's existing enrollments
      setFilteredClasses(classes.filter((c) => c.status === 'ACTIVE'))
    } else {
      setFilteredClasses([])
    }
  }, [selectedStudent, classes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!selectedStudent || !selectedClass) {
        throw new Error('Please select both student and class')
      }

      const response = await fetch('/api/enrollment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          classId: selectedClass,
          administratorId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create enrollment')
      }

      const result = await response.json()
      onSuccess?.(result.data)

      // Reset form
      setSelectedClass('')
      if (!initialStudentId) {
        setSelectedStudent('')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const getStudentName = (id: string) => {
    const student = students.find((s) => s.id === id)
    return student ? `${student.firstName} ${student.lastName}` : ''
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Enrollment</h2>

      <div className="space-y-6">
        {/* Student Selection */}
        {!initialStudentId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Choose a student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {initialStudentId && (
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              Student: <strong>{getStudentName(initialStudentId)}</strong>
            </p>
          </div>
        )}

        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
            disabled={!selectedStudent}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Choose a class --</option>
            {filteredClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Level {cls.level}) - Type: {cls.type}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-gray-700">
              {(() => {
                const selectedClassData = classes.find((c) => c.id === selectedClass)
                if (!selectedClassData) return 'Class details loading...'
                return `This will generate an ENROLLMENT charge for ${selectedClassData.name}`
              })()}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedStudent || !selectedClass}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Enrollment...' : 'Create Enrollment'}
        </button>
      </div>
    </form>
  )
}
