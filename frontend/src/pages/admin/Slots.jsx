import { useState, useEffect } from 'react'
import { slotsAPI } from '../../utils/api'

const Slots = () => {
  const [activeTab, setActiveTab] = useState('manage')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalCapacity: 0,
    totalEnrolled: 0
  })

  // Form state for new/edit slot
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    subject: '',
    class: '',
    type: 'online',
    startTime: '',
    endTime: '',
    days: [],
    instructor: '',
    location: '',
    capacity: 25,
    enrolledStudents: 0
  })

  const [formErrors, setFormErrors] = useState({})

  // Static data for dropdowns
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Fetch slots
  const fetchSlots = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(filterCourse !== 'All' && { course: filterCourse }),
        ...(filterType !== 'All' && { type: filterType }),
        ...(filterStatus !== 'All' && { isActive: filterStatus === 'Active' }),
        ...(searchTerm && { search: searchTerm })
      }

      const data = await slotsAPI.getSlots(params)
      
      if (data.success) {
        setSlots(data.data)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    }
    setLoading(false)
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const data = await slotsAPI.getStats()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchSlots()
    fetchStats()
  }, [currentPage, filterCourse, filterType, filterStatus, searchTerm])

  useEffect(() => {
    fetchStats()
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      if (name === 'days') {
        setFormData(prev => ({
          ...prev,
          days: checked 
            ? [...prev.days, value]
            : prev.days.filter(day => day !== value)
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) errors.name = 'Slot name is required'
    if (!formData.course.trim()) errors.course = 'Course is required'
    if (!formData.subject.trim()) errors.subject = 'Subject is required'
    if (!formData.class.trim()) errors.class = 'Class level is required'
    if (!formData.startTime.trim()) errors.startTime = 'Start time is required'
    if (!formData.endTime.trim()) errors.endTime = 'End time is required'
    if (formData.days.length === 0) errors.days = 'At least one day must be selected'
    if (!formData.instructor.trim()) errors.instructor = 'Instructor is required'
    if (!formData.location.trim()) errors.location = 'Location is required'
    if (formData.capacity < 1 || formData.capacity > 50) errors.capacity = 'Capacity must be between 1 and 50'
    if (formData.enrolledStudents < 0) errors.enrolledStudents = 'Enrolled students cannot be negative'
    if (formData.enrolledStudents > formData.capacity) errors.enrolledStudents = 'Enrolled students cannot exceed capacity'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      let data
      if (selectedSlot) {
        // Update existing slot
        data = await slotsAPI.updateSlot(selectedSlot._id, formData)
      } else {
        // Create new slot
        data = await slotsAPI.createSlot(formData)
      }
      
      if (data.success) {
        setShowAddModal(false)
        setShowEditModal(false)
        setSelectedSlot(null)
        setFormData({
          name: '',
          course: '',
          subject: '',
          class: '',
          type: 'online',
          startTime: '',
          endTime: '',
          days: [],
          instructor: '',
          location: '',
          capacity: 25,
          enrolledStudents: 0
        })
        fetchSlots()
        fetchStats()
      }
    } catch (error) {
      console.error('Error saving slot:', error)
      // Handle validation errors from server
      if (error.errors) {
        const serverErrors = {}
        error.errors.forEach(error => {
          serverErrors[error.path] = error.msg
        })
        setFormErrors(serverErrors)
      }
    }
    setLoading(false)
  }

  // Handle edit
  const handleEdit = (slot) => {
    setSelectedSlot(slot)
    setFormData(slot)
    setShowEditModal(true)
  }

  // Handle view
  const handleView = (slot) => {
    setSelectedSlot(slot)
    setShowViewModal(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return
    
    setLoading(true)
    try {
      const data = await slotsAPI.deleteSlot(id)
      
      if (data.success) {
        fetchSlots()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting slot:', error)
    }
    setLoading(false)
  }

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    setLoading(true)
    try {
      const data = await slotsAPI.toggleSlot(id)
      
      if (data.success) {
        fetchSlots()
        fetchStats()
      }
    } catch (error) {
      console.error('Error toggling slot status:', error)
    }
    setLoading(false)
  }

  // Handle update enrolled students
  const handleUpdateEnrolledStudents = async (id, enrolledStudents) => {
    setLoading(true)
    try {
      const data = await slotsAPI.updateEnrolledStudents(id, enrolledStudents)
      
      if (data.success) {
        fetchSlots()
        fetchStats()
      }
    } catch (error) {
      console.error('Error updating enrolled students:', error)
    }
    setLoading(false)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const renderSlotCard = (slot) => (
    <div key={slot._id} className={`bg-white rounded-lg shadow-md p-6 ${!slot.isActive ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{slot.name}</h3>
          <p className="text-sm text-gray-600">{slot.course} - {slot.subject}</p>
          <p className="text-sm text-gray-500">{slot.class} Level</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            slot.type === 'online' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {slot.type.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            slot.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {slot.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Time</p>
          <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Days</p>
          <p className="text-sm text-gray-600">{slot.days.join(', ')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Instructor</p>
          <p className="text-sm text-gray-600">{slot.instructor}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Location</p>
          <p className="text-sm text-gray-600">{slot.location}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Enrollment</span>
          <span className="text-sm text-gray-600">{slot.enrolledStudents}/{slot.capacity}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              slot.enrolledStudents / slot.capacity > 0.8 
                ? 'bg-red-500' 
                : slot.enrolledStudents / slot.capacity > 0.6 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            style={{ width: `${(slot.enrolledStudents / slot.capacity) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleView(slot)}
          className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
        >
          View
        </button>
        <button
          onClick={() => handleEdit(slot)}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => handleToggleStatus(slot._id)}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
            slot.isActive 
              ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {slot.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => handleDelete(slot._id)}
          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Slot Management</h1>
      <p className="mt-1 text-sm text-gray-500">Manage time slots for online and offline classes.</p>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Slots</dt>
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
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Slots</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Slots</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.inactive}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Capacity</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalCapacity}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Enrolled Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalEnrolled}</dd>
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
                onClick={() => setFilterStatus('All')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterStatus === 'All'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('Active')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterStatus === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setFilterStatus('Inactive')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterStatus === 'Inactive'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                Inactive ({stats.inactive})
              </button>
            </div>

            {/* Course Filter */}
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Courses</option>
              {Array.from(new Set(slots.map(slot => slot.course))).map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name, course, or instructor"
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Slots
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'manage' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Loading...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No slots found
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {slots.map(renderSlotCard)}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
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
        )}

        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Slot Overview</h3>
            <div className="space-y-4">
              {courses.map(course => {
                const courseSlots = slots.filter(slot => slot.course === course)
                const onlineSlots = courseSlots.filter(slot => slot.type === 'online')
                const offlineSlots = courseSlots.filter(slot => slot.type === 'offline')
                
                return (
                  <div key={course} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{course}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <h5 className="font-medium text-blue-900">Online Slots</h5>
                        <p className="text-sm text-blue-700">
                          {onlineSlots.length} slots, {onlineSlots.reduce((sum, slot) => sum + slot.enrolledStudents, 0)}/{onlineSlots.reduce((sum, slot) => sum + slot.capacity, 0)} enrolled
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <h5 className="font-medium text-green-900">Offline Slots</h5>
                        <p className="text-sm text-green-700">
                          {offlineSlots.length} slots, {offlineSlots.reduce((sum, slot) => sum + slot.enrolledStudents, 0)}/{offlineSlots.reduce((sum, slot) => sum + slot.capacity, 0)} enrolled
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Slot</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Slot Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter slot name"
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course *</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="Enter course name"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.course ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.course && <p className="mt-1 text-sm text-red-600">{formErrors.course}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter subject name"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.subject ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.subject && <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Level *</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      placeholder="Enter class level (e.g., Beginner, Intermediate, Advanced)"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.class ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.class && <p className="mt-1 text-sm text-red-600">{formErrors.class}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.startTime && <p className="mt-1 text-sm text-red-600">{formErrors.startTime}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.endTime ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.endTime && <p className="mt-1 text-sm text-red-600">{formErrors.endTime}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructor *</label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.instructor ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter instructor name"
                    />
                    {formErrors.instructor && <p className="mt-1 text-sm text-red-600">{formErrors.instructor}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder={formData.type === 'online' ? 'Online Platform (e.g., Zoom, Google Meet)' : 'Physical Location (e.g., Room 101)'}
                    />
                    {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      max="50"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.capacity ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.capacity && <p className="mt-1 text-sm text-red-600">{formErrors.capacity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Enrolled Students *</label>
                    <input
                      type="number"
                      name="enrolledStudents"
                      value={formData.enrolledStudents}
                      onChange={handleInputChange}
                      min="0"
                      max={formData.capacity}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.enrolledStudents ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.enrolledStudents && <p className="mt-1 text-sm text-red-600">{formErrors.enrolledStudents}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {days.map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          name="days"
                          value={day}
                          checked={formData.days.includes(day)}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.days && <p className="mt-1 text-sm text-red-600">{formErrors.days}</p>}
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
                    {loading ? 'Creating...' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {showEditModal && selectedSlot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Slot</h3>
                <button
                  onClick={() => setShowEditModal(false)}
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
                    <label className="block text-sm font-medium text-gray-700">Slot Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter slot name"
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course *</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="Enter course name"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.course ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.course && <p className="mt-1 text-sm text-red-600">{formErrors.course}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter subject name"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.subject ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.subject && <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Level *</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      placeholder="Enter class level (e.g., Beginner, Intermediate, Advanced)"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.class ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.class && <p className="mt-1 text-sm text-red-600">{formErrors.class}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.startTime && <p className="mt-1 text-sm text-red-600">{formErrors.startTime}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.endTime ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.endTime && <p className="mt-1 text-sm text-red-600">{formErrors.endTime}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructor *</label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.instructor ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter instructor name"
                    />
                    {formErrors.instructor && <p className="mt-1 text-sm text-red-600">{formErrors.instructor}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder={formData.type === 'online' ? 'Online Platform (e.g., Zoom, Google Meet)' : 'Physical Location (e.g., Room 101)'}
                    />
                    {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      max="50"
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.capacity ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.capacity && <p className="mt-1 text-sm text-red-600">{formErrors.capacity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Enrolled Students *</label>
                    <input
                      type="number"
                      name="enrolledStudents"
                      value={formData.enrolledStudents}
                      onChange={handleInputChange}
                      min="0"
                      max={formData.capacity}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.enrolledStudents ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.enrolledStudents && <p className="mt-1 text-sm text-red-600">{formErrors.enrolledStudents}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {days.map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          name="days"
                          value={day}
                          checked={formData.days.includes(day)}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.days && <p className="mt-1 text-sm text-red-600">{formErrors.days}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Slot Modal */}
      {showViewModal && selectedSlot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Slot Details</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Slot Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.course}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Level</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.class}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedSlot.type === 'online' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedSlot.type.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedSlot.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSlot.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Days</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.days.join(', ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructor</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.instructor}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.capacity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Enrolled Students</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.enrolledStudents}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedSlot.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedSlot.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowViewModal(false)
                        handleEdit(selectedSlot)
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Slot
                    </button>
                    <button
                      onClick={() => handleToggleStatus(selectedSlot._id)}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        selectedSlot.isActive 
                          ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' 
                          : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                      {selectedSlot.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Slots