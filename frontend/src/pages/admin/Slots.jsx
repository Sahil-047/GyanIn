import { useState, useEffect } from 'react'
import { slotsAPI, cmsAPI } from '../../utils/api'

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
    // startTime and endTime removed from form per requirements
    days: [],
    instructor: '',
    location: '',
    capacity: 25,
    enrolledStudents: 0
  })

  const [formErrors, setFormErrors] = useState({})
  const [instructors, setInstructors] = useState([])

  // Static data for dropdowns
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const locations = ['GyanIN-1', 'GyanIN-2']

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

    }
  }

  useEffect(() => {
    fetchSlots()
    fetchStats()
  }, [currentPage, filterCourse, filterType, filterStatus, searchTerm])

  useEffect(() => {
    fetchStats()
  }, [])

  // Fetch instructors from carousel API
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await cmsAPI.getCMSSection('carousel')
        if (response.success && response.data.data.carouselItems) {
          // Extract instructor names from carousel data
          const instructorNames = new Set()
          response.data.data.carouselItems.forEach(item => {
            const teacherName = item.teacher?.name || item.title || item.subtitle
            if (teacherName && teacherName.trim()) {
              instructorNames.add(teacherName.trim())
            }
          })
          setInstructors(Array.from(instructorNames).sort())
        }
      } catch (error) {
        // Silently fail - instructors will remain empty, form will use text input
      }
    }
    fetchInstructors()
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

    if (!formData.name.trim()) errors.name = 'Batch name is required'
    // Course removed from form
    if (!formData.subject.trim()) errors.subject = 'Subject is required'
    if (!formData.class.toString().trim()) errors.class = 'Class is required'
    if (formData.days.length === 0) errors.days = 'At least one day must be selected'
    if (!formData.instructor.trim()) errors.instructor = 'Teacher name is required'
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
    if (!window.confirm('Are you sure you want to delete this batch?')) return

    setLoading(true)
    try {
      const data = await slotsAPI.deleteSlot(id)

      if (data.success) {
        fetchSlots()
        fetchStats()
      }
    } catch (error) {

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

    }
    setLoading(false)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gray-100 rounded-lg">
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage batches for online and offline classes</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">Batches</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
                <p className="text-xs text-gray-500 mt-1">Batches</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Inactive</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inactive}</p>
                <p className="text-xs text-gray-500 mt-1">Batches</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Capacity</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCapacity}</p>
                <p className="text-xs text-gray-500 mt-1">Total Seats</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Enrolled</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEnrolled}</p>
                <p className="text-xs text-gray-500 mt-1">Students</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
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
            <div className="flex space-x-3 bg-white p-2 rounded-xl shadow-md border border-gray-200">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  filterStatus === 'All'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('Active')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  filterStatus === 'Active'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setFilterStatus('Inactive')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  filterStatus === 'Inactive'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Inactive ({stats.inactive})
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                className="focus:ring-2 focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400"
                placeholder="Search by name, course, or instructor..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Add New */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Batch
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Manage Batches
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
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
            {/* Table */}
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow-xl overflow-hidden border border-gray-200 sm:rounded-xl bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Batch Name
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Subject - Class
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Instructor
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Type & Status
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Enrollment
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="relative px-6 py-4">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center">
                              <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-500">Loading...</span>
                              </div>
                            </td>
                          </tr>
                        ) : slots.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                              No batches found
                            </td>
                          </tr>
                        ) : (
                          slots.map((slot) => (
                            <tr key={slot._id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{slot.name}</div>
                                  <div className="text-sm text-gray-500">{slot.course}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{slot.subject}</div>
                                <div className="text-sm text-gray-500">Class {slot.class}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{slot.instructor}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${slot.type === 'online'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                    }`}>
                                    {slot.type.toUpperCase()}
                                  </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${slot.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                    {slot.isActive ? 'ACTIVE' : 'INACTIVE'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{slot.enrolledStudents}/{slot.capacity}</div>
                                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                      className={`h-2 rounded-full ${slot.enrolledStudents / slot.capacity > 0.8
                                          ? 'bg-red-500'
                                          : slot.enrolledStudents / slot.capacity > 0.6
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                        }`}
                                      style={{ width: `${(slot.enrolledStudents / slot.capacity) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{slot.location}</div>
                                <div className="text-sm text-gray-500">{slot.days.join(', ')}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-1 justify-end">
                                  <button 
                                    onClick={() => handleView(slot)}
                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-150"
                                    title="View details"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleEdit(slot)}
                                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-150"
                                    title="Edit batch"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleToggleStatus(slot._id)}
                                    className={`p-2 rounded-lg transition-all duration-150 ${slot.isActive
                                        ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                      }`}
                                    title={slot.isActive ? 'Deactivate batch' : 'Activate batch'}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {slot.isActive ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                      )}
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(slot._id)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-150"
                                    title="Delete batch"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
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
          <div className="space-y-6">
            {/* Online Batches Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-purple-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Online Batches
                  <span className="ml-3 text-purple-200 font-normal">
                    ({slots.filter(slot => slot.type === 'online').length} total)
                  </span>
                </h3>
              </div>
              <div className="p-6">
                {slots.filter(slot => slot.type === 'online').length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No online batches found</p>
                ) : (
                  <div className="space-y-4">
                    {slots.filter(slot => slot.type === 'online').map(slot => (
                      <div key={slot._id} className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">{slot.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{slot.subject} - Class {slot.class}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-700">
                                <strong>Instructor:</strong> {slot.instructor}
                              </span>
                              <span className="text-sm text-gray-700">
                                <strong>Location:</strong> {slot.location}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-700">
                                <strong>Days:</strong> {slot.days.join(', ')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${slot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {slot.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                            <div className="mt-2">
                              <p className="text-sm font-medium text-purple-700">
                                {slot.enrolledStudents}/{slot.capacity} enrolled
                              </p>
                              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className={`h-2 rounded-full ${slot.enrolledStudents / slot.capacity > 0.8 ? 'bg-red-500' : slot.enrolledStudents / slot.capacity > 0.6 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${(slot.enrolledStudents / slot.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Offline Batches Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-orange-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Offline Batches
                  <span className="ml-3 text-orange-200 font-normal">
                    ({slots.filter(slot => slot.type === 'offline').length} total)
                  </span>
                </h3>
              </div>
              <div className="p-6">
                {slots.filter(slot => slot.type === 'offline').length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No offline batches found</p>
                ) : (
                  <div className="space-y-4">
                    {slots.filter(slot => slot.type === 'offline').map(slot => (
                      <div key={slot._id} className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">{slot.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{slot.subject} - Class {slot.class}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-700">
                                <strong>Instructor:</strong> {slot.instructor}
                              </span>
                              <span className="text-sm text-gray-700">
                                <strong>Location:</strong> {slot.location}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-700">
                                <strong>Days:</strong> {slot.days.join(', ')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${slot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {slot.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                            <div className="mt-2">
                              <p className="text-sm font-medium text-orange-700">
                                {slot.enrolledStudents}/{slot.capacity} enrolled
                              </p>
                              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className={`h-2 rounded-full ${slot.enrolledStudents / slot.capacity > 0.8 ? 'bg-red-500' : slot.enrolledStudents / slot.capacity > 0.6 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${(slot.enrolledStudents / slot.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Batch</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Batch Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter batch name"
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>

                  {/* Course removed per requirements */}

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
                    <label className="block text-sm font-medium text-gray-700">Class (Number) *</label>
                    <input
                      type="number"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      placeholder="Enter class number (e.g., 1, 2, 3...)"
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

                  {/* Start/End time removed per requirements */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher Name *</label>
                    {instructors.length > 0 ? (
                      <select
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.instructor ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select an instructor</option>
                        {instructors.map((instructor, index) => (
                          <option key={index} value={instructor}>
                            {instructor}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.instructor ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter teacher name (no instructors available in carousel)"
                      />
                    )}
                    {formErrors.instructor && <p className="mt-1 text-sm text-red-600">{formErrors.instructor}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                    {formData.type === 'offline' ? (
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select a location</option>
                        {locations.map((location, index) => (
                          <option key={index} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Online Platform (e.g., Zoom, Google Meet)"
                      />
                    )}
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
                    {loading ? 'Creating...' : 'Create Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditModal && selectedSlot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Batch</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Batch Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter batch name"
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>

                  {/* Course removed per requirements */}

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
                    <label className="block text-sm font-medium text-gray-700">Class (Number) *</label>
                    <input
                      type="number"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      placeholder="Enter class number (e.g., 1, 2, 3...)"
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

                  {/* Start/End time removed per requirements */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher Name *</label>
                    {instructors.length > 0 ? (
                      <select
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.instructor ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select an instructor</option>
                        {instructors.map((instructor, index) => (
                          <option key={index} value={instructor}>
                            {instructor}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.instructor ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter teacher name (no instructors available in carousel)"
                      />
                    )}
                    {formErrors.instructor && <p className="mt-1 text-sm text-red-600">{formErrors.instructor}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                    {formData.type === 'offline' ? (
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select a location</option>
                        {locations.map((location, index) => (
                          <option key={index} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Online Platform (e.g., Zoom, Google Meet)"
                      />
                    )}
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
                    {loading ? 'Updating...' : 'Update Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Batch Modal */}
      {showViewModal && selectedSlot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Batch Details</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Batch Name</label>
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
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSlot.class}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedSlot.type === 'online'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {selectedSlot.type.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedSlot.isActive
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
                      Edit Batch
                    </button>
                    <button
                      onClick={() => handleToggleStatus(selectedSlot._id)}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${selectedSlot.isActive
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
