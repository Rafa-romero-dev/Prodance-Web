'use client'

import { useEffect, useState } from 'react'

interface AttendanceSummary {
  totalSessions: number
  presentCount: number
  absentCount: number
  absenceRate: number
  activeRecoveries: number
  completedRecoveries: number
  recentSessions: Array<any>
  byClass: Array<{
    className: string
    total: number
    present: number
    absent: number
  }>
}

export default function AttendanceTrackingDashboard() {
  const [studentId] = useState('demo-student-1') // In real app, get from auth
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/attendance/summary?studentId=${studentId}`)

        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }

        const data = await res.json()
        setSummary(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [studentId])

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

  const getAbsenceStatusColor = (rate: number) => {
    if (rate === 0) return 'bg-green-100 text-green-800'
    if (rate < 20) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getAttendancePercentage = (present: number, total: number) => {
    if (total === 0) return 0
    return Math.round((present / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="mt-2 text-gray-600">Monitor attendance records and recovery status</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Total Sessions</div>
                <div className="mt-2 text-2xl font-bold text-gray-900">{summary.totalSessions}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Present</div>
                <div className="mt-2 text-2xl font-bold text-green-600">{summary.presentCount}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {summary.totalSessions > 0 && `${getAttendancePercentage(summary.presentCount, summary.totalSessions)}%`}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Absent</div>
                <div className="mt-2 text-2xl font-bold text-red-600">{summary.absentCount}</div>
              </div>
              <div className={`rounded-lg shadow p-6 ${getAbsenceStatusColor(summary.absenceRate)}`}>
                <div className="text-sm font-medium opacity-75">Absence Rate</div>
                <div className="mt-2 text-2xl font-bold">{summary.absenceRate}%</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Active Recoveries</div>
                <div className="mt-2 text-2xl font-bold text-orange-600">
                  {summary.activeRecoveries}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Attendance by Class */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Attendance by Class</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {summary.byClass.length > 0 ? (
                    summary.byClass.map((classData) => (
                      <div key={classData.className} className="px-6 py-4">
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-gray-900">{classData.className}</div>
                            <div className="text-sm text-gray-600">
                              {getAttendancePercentage(classData.present, classData.total)}% attendance
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${getAttendancePercentage(classData.present, classData.total)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          {classData.present} present, {classData.absent} absent out of{' '}
                          {classData.total} sessions
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-gray-600">No attendance records</div>
                  )}
                </div>
              </div>

              {/* Recovery Status */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recovery Status</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Active Recoveries</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {summary.activeRecoveries}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Completed Recoveries</div>
                      <div className="text-2xl font-bold text-green-600">
                        {summary.completedRecoveries}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-blue-50">
                    <div className="text-sm text-gray-700">
                      {summary.activeRecoveries > 0
                        ? `You have ${summary.activeRecoveries} active recovery sessions. Complete them to continue enrollment.`
                        : 'No active recoveries. Great attendance!'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {summary.recentSessions.length > 0 ? (
                      summary.recentSessions.map((session, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{session.class.name}</td>
                          <td className="px-6 py-4 text-sm">
                            {session.attendances.length > 0 && (
                              <span
                                className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                  session.attendances[0].status === 'PRESENT'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {session.attendances[0].status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-600">
                          No recent sessions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
