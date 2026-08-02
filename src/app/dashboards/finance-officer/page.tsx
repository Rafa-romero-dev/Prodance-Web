'use client'

import { useEffect, useState } from 'react'
import { AllocationForm } from '@/components/forms/AllocationForm'

interface PendingReceipt {
  id: string
  studentName: string
  billingMonth: string
  amount: number
  uploadedAt: string
}

interface ApprovedReceipt {
  id: string
  studentName: string
  billingMonth: string
  amount: number
  remainingBalance: number
}

export default function FinanceOfficerDashboard() {
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([])
  const [approvedReceipts, setApprovedReceipts] = useState<ApprovedReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'pending' | 'allocation'>('pending')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/finance/receipts-pending'),
        fetch('/api/admin/receipts-pending'),
      ])

      if (!pendingRes.ok || !approvedRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const pendingData = await pendingRes.json()
      const approvedData = await approvedRes.json()

      setPendingReceipts(pendingData.data || [])
      setApprovedReceipts(approvedData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReceipt = async (receiptId: string) => {
    try {
      setApprovingId(receiptId)
      const res = await fetch('/api/finance/approve-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to approve receipt')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRejectReceipt = async (receiptId: string) => {
    try {
      setRejectingId(receiptId)
      const reason = prompt('Enter reason for rejection:')
      if (!reason) return

      const res = await fetch('/api/finance/reject-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId, reason }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to reject receipt')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRejectingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Finance Officer Dashboard</h1>
          <p className="mt-2 text-gray-600">Approve receipts and allocate payments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Pending Receipts</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">{pendingReceipts.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Approved Receipts</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{approvedReceipts.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total to Allocate</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {formatCurrency(
                approvedReceipts.reduce((sum, r) => sum + r.remainingBalance, 0)
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-6 py-3 font-medium ${
              selectedTab === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Receipts ({pendingReceipts.length})
          </button>
          <button
            onClick={() => setSelectedTab('allocation')}
            className={`px-6 py-3 font-medium ${
              selectedTab === 'allocation'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Allocate Payments
          </button>
        </div>

        {/* Pending Receipts Tab */}
        {selectedTab === 'pending' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pendingReceipts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Billing Month
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingReceipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{receipt.studentName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{receipt.billingMonth}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(receipt.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(receipt.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleApproveReceipt(receipt.id)}
                            disabled={approvingId === receipt.id}
                            className="inline-block px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-xs font-medium"
                          >
                            {approvingId === receipt.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectReceipt(receipt.id)}
                            disabled={rejectingId === receipt.id}
                            className="inline-block px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                          >
                            {rejectingId === receipt.id ? 'Rejecting...' : 'Reject'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-600">
                <p className="text-lg">No pending receipts</p>
                <p className="text-sm mt-1">All receipts have been reviewed</p>
              </div>
            )}
          </div>
        )}

        {/* Allocation Tab */}
        {selectedTab === 'allocation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <AllocationForm
                onSuccess={() => {
                  fetchData()
                  alert('Payment allocated successfully!')
                }}
                onError={(error) => alert(error)}
              />
            </div>

            {/* Allocation Summary */}
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <strong>Approved Receipts Ready:</strong> {approvedReceipts.length}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Total to Allocate:</strong>{' '}
                      {formatCurrency(
                        approvedReceipts.reduce((sum, r) => sum + r.remainingBalance, 0)
                      )}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Approved Receipts with Balance</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {approvedReceipts.length > 0 ? (
                        approvedReceipts.map((receipt) => (
                          <div
                            key={receipt.id}
                            className="p-3 bg-gray-50 rounded border border-gray-200"
                          >
                            <p className="font-medium text-gray-900">{receipt.studentName}</p>
                            <p className="text-xs text-gray-600">{receipt.billingMonth}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              Balance: <span className="font-medium">{formatCurrency(receipt.remainingBalance)}</span>
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No approved receipts available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
