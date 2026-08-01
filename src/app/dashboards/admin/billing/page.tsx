'use client'

import { useEffect, useState } from 'react'

interface BillingOverview {
  summary: {
    totalCharges: number
    totalPaid: number
    totalOutstanding: number
    totalReceiptAmount: number
    approvedReceiptAmount: number
    chargeCount: number
    receiptCount: number
  }
  chargesByType: Record<string, any>
  chargesByStatus: Record<string, number>
  receiptsByStatus: Record<string, number>
  topOutstandingStudents: Array<{
    id: string
    name: string
    email: string
    outstanding: number
    chargeCount: number
  }>
}

export default function AdminBillingDashboard() {
  const [overview, setOverview] = useState<BillingOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/billing-overview')

        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }

        const data = await res.json()
        setOverview(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
          <h1 className="text-3xl font-bold text-gray-900">Billing Overview</h1>
          <p className="mt-2 text-gray-600">Monitor all charges, receipts, and outstanding payments</p>
        </div>

        {/* Summary Cards */}
        {overview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Total Charges</div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(overview.summary.totalCharges)}
                </div>
                <div className="mt-1 text-xs text-gray-500">{overview.summary.chargeCount} charges</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Total Paid</div>
                <div className="mt-2 text-2xl font-bold text-green-600">
                  {formatCurrency(overview.summary.totalPaid)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {Math.round((overview.summary.totalPaid / overview.summary.totalCharges) * 100)}% collected
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Outstanding Balance</div>
                <div className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(overview.summary.totalOutstanding)}
                </div>
                <div className="mt-1 text-xs text-gray-500">Awaiting payment</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Approved Receipts</div>
                <div className="mt-2 text-2xl font-bold text-blue-600">
                  {formatCurrency(overview.summary.approvedReceiptAmount)}
                </div>
                <div className="mt-1 text-xs text-gray-500">{overview.summary.receiptCount} receipts</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Charges by Type */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Charges by Type</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {Object.entries(overview.chargesByType).map(([type, data]) => (
                    <div key={type} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{type}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {data.count} charges
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(data.total)}
                          </div>
                          <div className="text-sm text-green-600">
                            {formatCurrency(data.paid)} paid
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charge Status */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Charge Status</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {Object.entries(overview.chargesByStatus).map(([status, count]) => (
                    <div key={status} className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-gray-900">{status}</div>
                        <div className="text-lg font-bold text-gray-900">{count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receipt Status */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Receipt Status</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {Object.entries(overview.receiptsByStatus).map(([status, count]) => (
                    <div key={status} className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-gray-900">{status}</div>
                        <div className="text-lg font-bold text-gray-900">{count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Outstanding Students */}
            <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Outstanding Students</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        Outstanding
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        Charges
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {overview.topOutstandingStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                          {formatCurrency(student.outstanding)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {student.chargeCount}
                        </td>
                      </tr>
                    ))}
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
