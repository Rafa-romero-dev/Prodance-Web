'use client'

import { useEffect, useState } from 'react'

interface BillingSummary {
  totalCharges: number
  totalPaid: number
  totalPending: number
  chargeCount: number
  receiptCount: number
  chargesByType: Record<string, any>
  lastChargeDate: string | null
}

interface Charge {
  id: string
  type: string
  description: string
  amount: number
  remainingAmount: number
  status: string
  dueDate: string | null
}

interface Enrollment {
  id: string
  className: string
  level: string
  classType: string
  status: string
  schedule: { day: string; startTime: string; endTime: string } | null
}

export default function StudentPaymentDashboard() {
  const [studentId] = useState('demo-student-1') // In real app, get from auth
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [charges, setCharges] = useState<Charge[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [summaryRes, chargesRes, enrollmentsRes] = await Promise.all([
          fetch(`/api/finance/billing-summary?studentId=${studentId}`),
          fetch(`/api/finance/charges?studentId=${studentId}`),
          fetch(`/api/student/enrollments?studentId=${studentId}`),
        ])

        if (!summaryRes.ok || !chargesRes.ok || !enrollmentsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const summaryData = await summaryRes.json()
        const chargesData = await chargesRes.json()
        const enrollmentsData = await enrollmentsRes.json()

        setSummary(summaryData.data)
        setCharges(chargesData.data)
        setEnrollments(enrollmentsData.data)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
          <p className="mt-2 text-gray-600">View your charges, receipts, and payment history</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Total Charges</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalCharges)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Total Paid</div>
              <div className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalPaid)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Outstanding Balance</div>
              <div className="mt-2 text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalPending)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Charges</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {summary.chargeCount}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Enrollments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Active Classes</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="px-6 py-4">
                      <div className="font-medium text-gray-900">{enrollment.className}</div>
                      <div className="text-sm text-gray-600 mt-1">Level: {enrollment.level}</div>
                      <div className="text-sm text-gray-600">
                        Type: {enrollment.classType}
                      </div>
                      {enrollment.schedule && (
                        <div className="text-sm text-gray-600 mt-2">
                          {enrollment.schedule.day} {enrollment.schedule.startTime} -{' '}
                          {enrollment.schedule.endTime}
                        </div>
                      )}
                      <div className="mt-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            enrollment.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-gray-600">No active enrollments</div>
                )}
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Outstanding Charges</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {charges.length > 0 ? (
                      charges.map((charge) => (
                        <tr key={charge.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">{charge.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{charge.description}</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900">
                            {formatCurrency(charge.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                            {formatCurrency(charge.remainingAmount)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                charge.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : charge.status === 'PARTIALLY_PAID'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {charge.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                          No outstanding charges
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
