'use client'

import { useEffect, useState } from 'react'

interface Recovery {
  id: string
  studentName: string
  studentId: string
  enrollmentId: string
  status: string
  generatedAt: string
  charge: {
    amount: number
    remainingAmount: number
  }
}

export default function TeacherDashboard() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/teacher/recoveries')

        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }

        const data = await res.json()
        setRecoveries(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCompleteRecovery = async (recoveryId: string) => {
    try {
      setCompletingId(recoveryId)
      const res = await fetch('/api/recovery/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recoveryId,
          administratorId: 'teacher-admin', // In real app, get from auth
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to complete recovery')
      }

      // Remove completed recovery from list
      setRecoveries((prev) => prev.filter((r) => r.id !== recoveryId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCompletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <a href="/dashboards" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboards
          </a>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage student recoveries and track completion</p>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Active Recoveries</div>
            <div className="mt-2 text-3xl font-bold text-orange-600">{recoveries.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Ready to Schedule</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {recoveries.filter((r) => r.status === 'READY_TO_SCHEDULE').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Pending Payment</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">
              {recoveries.filter((r) => r.status === 'PENDING_PAYMENT').length}
            </div>
          </div>
        </div>

        {/* Recoveries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Students Needing Recovery</h2>
          </div>

          {recoveries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Recovery Charge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Generated Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recoveries.map((recovery) => (
                    <tr key={recovery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{recovery.studentName}</div>
                        <div className="text-sm text-gray-600">{recovery.studentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            recovery.status === 'READY_TO_SCHEDULE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {recovery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          ${(recovery.charge.amount / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">
                          Remaining: ${(recovery.charge.remainingAmount / 100).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(recovery.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleCompleteRecovery(recovery.id)}
                          disabled={completingId === recovery.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                        >
                          {completingId === recovery.id ? 'Completing...' : 'Mark Complete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-600">
              <p className="text-lg">No active recoveries</p>
              <p className="text-sm mt-1">All students are on track!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
