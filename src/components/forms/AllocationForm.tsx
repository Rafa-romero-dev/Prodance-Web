'use client'

import { useState, useEffect } from 'react'

interface AllocationFormProps {
  receiptId?: string
  chargeId?: string
  administratorId: string
  onSuccess?: (allocation: any) => void
  onError?: (error: string) => void
}

export function AllocationForm({
  receiptId: initialReceiptId,
  chargeId: initialChargeId,
  administratorId,
  onSuccess,
  onError,
}: AllocationFormProps) {
  const [loading, setLoading] = useState(false)
  const [receipts, setReceipts] = useState<any[]>([])
  const [charges, setCharges] = useState<any[]>([])
  const [selectedReceipt, setSelectedReceipt] = useState(initialReceiptId || '')
  const [selectedCharge, setSelectedCharge] = useState(initialChargeId || '')
  const [allocationAmount, setAllocationAmount] = useState('')
  const [receiptBalance, setReceiptBalance] = useState(0)
  const [chargeBalance, setChargeBalance] = useState(0)

  // Fetch receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await fetch('/api/admin/receipts-pending')
        if (response.ok) {
          const data = await response.json()
          setReceipts(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching receipts:', error)
      }
    }

    fetchReceipts()
  }, [])

  // Fetch charges when needed
  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await fetch('/api/admin/charges-pending')
        if (response.ok) {
          const data = await response.json()
          setCharges(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching charges:', error)
      }
    }

    fetchCharges()
  }, [])

  // Update receipt balance when selected
  useEffect(() => {
    const receipt = receipts.find((r) => r.id === selectedReceipt)
    if (receipt) {
      setReceiptBalance(receipt.amount / 100)
    }
  }, [selectedReceipt, receipts])

  // Update charge balance when selected
  useEffect(() => {
    const charge = charges.find((c) => c.id === selectedCharge)
    if (charge) {
      setChargeBalance(charge.remainingAmount / 100)
    }
  }, [selectedCharge, charges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amount = parseFloat(allocationAmount)

      if (!selectedReceipt || !selectedCharge || !amount) {
        throw new Error('Please fill in all fields')
      }

      if (amount > receiptBalance) {
        throw new Error(
          `Allocation amount exceeds receipt balance. Available: $${receiptBalance.toFixed(2)}`
        )
      }

      if (amount > chargeBalance) {
        throw new Error(
          `Allocation amount exceeds charge balance. Available: $${chargeBalance.toFixed(2)}`
        )
      }

      const response = await fetch('/api/finance/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: selectedReceipt,
          chargeId: selectedCharge,
          allocationAmount: amount,
          administratorId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to allocate payment')
      }

      const result = await response.json()
      onSuccess?.(result.data)

      // Reset form
      setAllocationAmount('')
      setSelectedReceipt('')
      setSelectedCharge('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Allocate Payment</h2>

      <div className="space-y-6">
        {/* Receipt Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Approved Receipt
          </label>
          <select
            value={selectedReceipt}
            onChange={(e) => setSelectedReceipt(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose a receipt --</option>
            {receipts.map((receipt) => (
              <option key={receipt.id} value={receipt.id}>
                {receipt.billingMonth} - ${(receipt.amount / 100).toFixed(2)} ({receipt.id.slice(0, 8)})
              </option>
            ))}
          </select>
          {selectedReceipt && (
            <p className="text-sm text-gray-600 mt-2">Available balance: ${receiptBalance.toFixed(2)}</p>
          )}
        </div>

        {/* Charge Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pending Charge
          </label>
          <select
            value={selectedCharge}
            onChange={(e) => setSelectedCharge(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose a charge --</option>
            {charges.map((charge) => (
              <option key={charge.id} value={charge.id}>
                {charge.type} - ${(charge.remainingAmount / 100).toFixed(2)} ({charge.id.slice(0, 8)})
              </option>
            ))}
          </select>
          {selectedCharge && (
            <p className="text-sm text-gray-600 mt-2">Remaining balance: ${chargeBalance.toFixed(2)}</p>
          )}
        </div>

        {/* Allocation Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allocation Amount (USD)
          </label>
          <input
            type="number"
            value={allocationAmount}
            onChange={(e) => setAllocationAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {allocationAmount && (
            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-gray-600">
                After allocation: Receipt ${(receiptBalance - parseFloat(allocationAmount)).toFixed(2)},
                Charge ${(chargeBalance - parseFloat(allocationAmount)).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedReceipt || !selectedCharge || !allocationAmount}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Allocate Payment'}
        </button>
      </div>
    </form>
  )
}
