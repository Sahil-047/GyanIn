import { useState, useEffect } from 'react'
import { readmissionsAPI, slotsAPI } from '../../utils/api'

const Readmissions = () => {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [readmissions, setReadmissions] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [selectedReadmission, setSelectedReadmission] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  // Form state for new readmission
  const [formData, setFormData] = useState({
    studentName: '',
    course: '',
    contact: '',
    email: '',
    slotName: '',
    reason: '',
    previousCourse: ''
  })

  const [formErrors, setFormErrors] = useState({})

  // Fetch readmissions
  const fetchReadmissions = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedTab !== 'all' && { status: selectedTab }),
        ...(searchTerm && { search: searchTerm })
      }

      const data = await readmissionsAPI.getReadmissions(params)
      
      if (data.success) {
        setReadmissions(data.data)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching readmissions:', error)
    }
    setLoading(false)
  }

  // Fetch slots
  const fetchSlots = async () => {
    try {
      const data = await slotsAPI.getSlots()
      
      if (data.success) {
        setSlots(data.data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const data = await readmissionsAPI.getStats()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchReadmissions()
    fetchStats()
  }, [currentPage, selectedTab, searchTerm])

  useEffect(() => {
    fetchSlots()
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      slotName: slot.name,
      course: slot.course
    }))
    setShowSlotModal(false)
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    
    if (!formData.studentName.trim()) errors.studentName = 'Student name is required'
    if (!formData.course.trim()) errors.course = 'Course is required'
    if (!formData.contact.trim()) errors.contact = 'Contact is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!formData.slotName.trim()) errors.slotName = 'Slot is required'
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (formData.contact && !phoneRegex.test(formData.contact)) {
      errors.contact = 'Please enter a valid 10-digit phone number'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // Log the form data being sent for debugging
      console.log('Submitting readmission data:', formData)
      const data = await readmissionsAPI.createReadmission(formData)
      
      if (data.success) {
        setShowAddModal(false)
        setFormData({
          studentName: '',
          course: '',
          contact: '',
          email: '',
          slotName: '',
          reason: '',
          previousCourse: ''
        })
        fetchReadmissions()
        fetchStats()
      }
    } catch (error) {
      console.error('Error creating readmission:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        errors: error.errors
      })
      
      // Handle validation errors from server
      if (error.errors) {
        const serverErrors = {}
        error.errors.forEach(err => {
          serverErrors[err.path] = err.msg
        })
        setFormErrors(serverErrors)
      }
    }
    setLoading(false)
  }

  // Handle status update
  const handleStatusUpdate = async (id, status, notes = '') => {
    setLoading(true)
    try {
      const data = await readmissionsAPI.updateReadmissionStatus(id, status, notes)
      
      if (data.success) {
        fetchReadmissions()
        fetchStats()
        setShowViewModal(false)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
    setLoading(false)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this readmission?')) return
    
    setLoading(true)
    try {
      const data = await readmissionsAPI.deleteReadmission(id)
      
      if (data.success) {
        fetchReadmissions()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting readmission:', error)
    }
    setLoading(false)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = ''
    let textColor = ''
    
    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100'
        textColor = 'text-yellow-800'
        break
      case 'approved':
        bgColor = 'bg-green-100'
        textColor = 'text-green-800'
        break
      case 'rejected':
        bgColor = 'bg-red-100'
        textColor = 'text-red-800'
        break
      default:
        bgColor = 'bg-gray-100'
        textColor = 'text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Readmission Management</h1>
      <p className="mt-1 text-sm text-gray-500">View and manage student readmission applications.</p>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {/* Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Filter Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedTab === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedTab === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setSelectedTab('approved')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedTab === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setSelectedTab('rejected')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedTab === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name, ID, or course"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Export */}
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>

            {/* Add New */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-500">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : readmissions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No readmissions found
                        </td>
                      </tr>
                    ) : (
                      readmissions.map((readmission) => (
                        <tr key={readmission._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{readmission.studentName}</div>
                                <div className="text-sm text-gray-500">{readmission.contact}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{readmission.course}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{readmission.slotName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={readmission.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(readmission.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2 justify-end">
                              <button 
                                onClick={() => {
                                  setSelectedReadmission(readmission)
                                  setShowViewModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                              {readmission.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusUpdate(readmission._id, 'approved')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleStatusUpdate(readmission._id, 'rejected')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleDelete(readmission._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span> pages
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {currentPage}
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Add Readmission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Readmission</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name *</label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.studentName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter student name"
                    />
                    {formErrors.studentName && <p className="mt-1 text-sm text-red-600">{formErrors.studentName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course *</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.course ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter course name"
                    />
                    {formErrors.course && <p className="mt-1 text-sm text-red-600">{formErrors.course}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact *</label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.contact ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter phone number"
                    />
                    {formErrors.contact && <p className="mt-1 text-sm text-red-600">{formErrors.contact}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slot *</label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        name="slotName"
                        value={formData.slotName}
                        readOnly
                        className="block w-full border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50"
                        placeholder="Select a slot"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSlotModal(true)}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        Select
                      </button>
                    </div>
                    {formErrors.slotName && <p className="mt-1 text-sm text-red-600">{formErrors.slotName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Previous Course</label>
                    <input
                      type="text"
                      name="previousCourse"
                      value={formData.previousCourse}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter previous course (optional)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Reason for Readmission</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reason for readmission (optional)"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Readmission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Slot Selection Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select a Slot</h3>
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {slots.filter(slot => slot.isActive).map((slot) => (
                  <div
                    key={slot._id}
                    onClick={() => handleSlotSelect(slot)}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{slot.name}</h4>
                    <p className="text-sm text-gray-600">{slot.course}</p>
                    <p className="text-sm text-gray-600">{slot.subject} - {slot.class}</p>
                    <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                    <p className="text-sm text-gray-600">{slot.days.join(', ')}</p>
                    <p className="text-sm text-gray-600">Capacity: {slot.enrolledStudents}/{slot.capacity}</p>
                    <p className="text-sm text-gray-600">Instructor: {slot.instructor}</p>
                    <p className="text-sm text-gray-600">Type: {slot.type}</p>
                    <p className="text-sm text-gray-600">Location: {slot.location}</p>
                  </div>
                ))}
              </div>
              
              {slots.filter(slot => slot.isActive).length === 0 && (
                <p className="text-center text-gray-500 py-4">No active slots available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Readmission Modal */}
      {showViewModal && selectedReadmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Readmission Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.course}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.contact}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slot</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.slotName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={selectedReadmission.status} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Applied Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedReadmission.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedReadmission.previousCourse && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Previous Course</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReadmission.previousCourse}</p>
                    </div>
                  )}
                  {selectedReadmission.reason && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Reason</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReadmission.reason}</p>
                    </div>
                  )}
                  {selectedReadmission.notes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReadmission.notes}</p>
                    </div>
                  )}
                </div>

                {selectedReadmission.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleStatusUpdate(selectedReadmission._id, 'approved')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReadmission._id, 'rejected')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Readmissions