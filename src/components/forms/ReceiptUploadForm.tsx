'use client'

import { useState } from 'react'

interface ReceiptUploadFormProps {
  studentId: string
  onSuccess?: (receipt: any) => void
  onError?: (error: string) => void
}

export function ReceiptUploadForm({ studentId, onSuccess, onError }: ReceiptUploadFormProps) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    billingMonth: new Date().toISOString().slice(0, 7),
    amount: '',
    bank: '',
    referenceNumber: '',
    notes: '',
    imageUrl: '',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you'd upload to UploadThing
      // For now, create a data URL for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        setFormData((prev) => ({ ...prev, imageUrl: dataUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/finance/upload-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          billingMonth: formData.billingMonth,
          amount: parseFloat(formData.amount),
          imageUrl: formData.imageUrl,
          bank: formData.bank || undefined,
          referenceNumber: formData.referenceNumber || undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload receipt')
      }

      const result = await response.json()
      onSuccess?.(result.data)

      // Reset form
      setFormData({
        billingMonth: new Date().toISOString().slice(0, 7),
        amount: '',
        bank: '',
        referenceNumber: '',
        notes: '',
        imageUrl: '',
      })
      setImagePreview(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Payment Receipt</h2>

      <div className="space-y-6">
        {/* Billing Month */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Month
          </label>
          <input
            type="month"
            name="billingMonth"
            value={formData.billingMonth}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Receipt Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="max-w-xs max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Bank */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank (Optional)
          </label>
          <input
            type="text"
            name="bank"
            value={formData.bank}
            onChange={handleInputChange}
            placeholder="e.g., Bank of America"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number (Optional)
          </label>
          <input
            type="text"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleInputChange}
            placeholder="e.g., Transaction ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional information..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload Receipt'}
        </button>
      </div>
    </form>
  )
}
