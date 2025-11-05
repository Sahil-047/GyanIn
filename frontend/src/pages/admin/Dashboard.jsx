import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../../utils/api'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await dashboardAPI.getDashboardData()
      if (response.success) {
        setDashboardData(response.data)
      }
    } catch (err) {
      
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchDashboardData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { statistics, recent } = dashboardData || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gray-100 rounded-lg">
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Overview of your academy management system</p>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics?.readmissions?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Students</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Students */}
        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics?.readmissions?.pending || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Students</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Batches */}
        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics?.slots?.active || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Batches</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Total Contacts */}
        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics?.contacts?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Contacts</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Students Status */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-gray-900">Students Status</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Approved</span>
                  <span className="text-lg font-bold text-green-600">{statistics?.readmissions?.approved || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-lg font-bold text-yellow-600">{statistics?.readmissions?.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Rejected</span>
                  <span className="text-lg font-bold text-red-600">{statistics?.readmissions?.rejected || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Batches Overview */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-gray-900">Batches Overview</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Online Batches</span>
                  <span className="text-lg font-bold text-purple-600">{statistics?.slots?.online || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Offline Batches</span>
                  <span className="text-lg font-bold text-orange-600">{statistics?.slots?.offline || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-gray-300">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">{statistics?.slots?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Status */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-gray-900">Contacts Status</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">New</span>
                  <span className="text-lg font-bold text-blue-600">{statistics?.contacts?.new || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">In Progress</span>
                  <span className="text-lg font-bold text-yellow-600">{statistics?.contacts?.inProgress || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Resolved</span>
                  <span className="text-lg font-bold text-green-600">{statistics?.contacts?.resolved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link to="/admin/readmissions" className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 group">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3 group-hover:bg-blue-600 transition-colors">
                <svg className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Students</h3>
                <p className="mt-1 text-sm text-gray-600">View and manage student applications</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/slots" className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 group">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-lg p-3 group-hover:bg-green-600 transition-colors">
                <svg className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">Batch Management</h3>
                <p className="mt-1 text-sm text-gray-600">Manage batches and bookings</p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/cms" className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 group">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-50 rounded-lg p-3 group-hover:bg-purple-600 transition-colors">
                <svg className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Website CMS</h3>
                <p className="mt-1 text-sm text-gray-600">Manage website content</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="bg-white shadow-xl overflow-hidden sm:rounded-xl border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {/* Recent Students */}
            {recent?.readmissions?.slice(0, 3).map((readmission) => (
              <li key={readmission._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{readmission.studentName}</p>
                        <p className="text-sm text-gray-500">Readmission request for {readmission.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        readmission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        readmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {readmission.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(readmission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {/* Recent Contacts */}
            {recent?.contacts?.slice(0, 2).map((contact) => (
              <li key={contact._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.queryType} - {contact.message?.substring(0, 50)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        contact.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {contact.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {/* Show message if no recent activity */}
            {(!recent?.readmissions?.length && !recent?.contacts?.length) && (
              <li>
                <div className="px-4 py-4 sm:px-6 text-center">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard