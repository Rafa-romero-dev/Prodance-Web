import Link from 'next/link'

export default function DashboardsLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Prodance Academy</h1>
          <p className="text-xl text-gray-600">Select a dashboard to view your information</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Student Payment Dashboard */}
          <Link href="/dashboards/student">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="px-6 py-8">
                <div className="text-2xl font-bold text-gray-900 mb-2">Student Payments</div>
                <p className="text-gray-600 mb-6">
                  View your charges, receipts, outstanding balance, and payment history.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Go to Dashboard</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Attendance Dashboard */}
          <Link href="/dashboards/attendance">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="h-32 bg-gradient-to-r from-green-500 to-green-600"></div>
              <div className="px-6 py-8">
                <div className="text-2xl font-bold text-gray-900 mb-2">Attendance Tracking</div>
                <p className="text-gray-600 mb-6">
                  Monitor attendance records, absence count, and recovery status.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  <span>Go to Dashboard</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Billing Dashboard */}
          <Link href="/dashboards/admin/billing">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="h-32 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="px-6 py-8">
                <div className="text-2xl font-bold text-gray-900 mb-2">Admin Billing</div>
                <p className="text-gray-600 mb-6">
                  Overview of all students, charges, receipts, and outstanding payments.
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  <span>Go to Dashboard</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Teacher Dashboard */}
          <Link href="/dashboards/teacher">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="h-32 bg-gradient-to-r from-teal-500 to-teal-600"></div>
              <div className="px-6 py-8">
                <div className="text-2xl font-bold text-gray-900 mb-2">Teacher</div>
                <p className="text-gray-600 mb-6">
                  Manage student recoveries and mark completion.
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  <span>Go to Dashboard</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Finance Officer Dashboard */}
          <Link href="/dashboards/finance-officer">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="h-32 bg-gradient-to-r from-amber-500 to-amber-600"></div>
              <div className="px-6 py-8">
                <div className="text-2xl font-bold text-gray-900 mb-2">Finance Officer</div>
                <p className="text-gray-600 mb-6">
                  Approve receipts and allocate payments to charges.
                </p>
                <div className="flex items-center text-amber-600 font-medium">
                  <span>Go to Dashboard</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Tracking</h3>
              <p className="text-gray-600">
                Real-time view of charges, receipts, and outstanding balances
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Analytics</h3>
              <p className="text-gray-600">
                Track attendance patterns and monitor recovery requirements
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Reports</h3>
              <p className="text-gray-600">
                Comprehensive billing overview and student outstanding balances
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recovery Management</h3>
              <p className="text-gray-600">
                Manage student recoveries with status tracking
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-500 text-white mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Receipt Approval</h3>
              <p className="text-gray-600">
                Batch approve and reject payment receipts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
