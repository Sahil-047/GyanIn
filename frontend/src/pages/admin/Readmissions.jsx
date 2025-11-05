import { useState, useEffect } from 'react'
import { readmissionsAPI, slotsAPI } from '../../utils/api'
import { Snackbar, Alert } from '@mui/material'
import { confirmToast } from '../../App'

const Readmissions = () => {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [readmissions, setReadmissions] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [showEditSlotModal, setShowEditSlotModal] = useState(false)
  const [selectedReadmission, setSelectedReadmission] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'warning' | 'info'
  })

  // Form state for new readmission
  const [formData, setFormData] = useState({
    studentName: '',
    subject: '',
    contact: '',
    slotName: '',
    batch: ''
  })

  // Form state for editing readmission
  const [editFormData, setEditFormData] = useState({
    studentName: '',
    subject: '',
    contact: '',
    slotName: '',
    batch: ''
  })

  const [formErrors, setFormErrors] = useState({})
  const [editFormErrors, setEditFormErrors] = useState({})

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
      subject: slot.subject || slot.course,
      batch: String(slot.class ?? '')
    }))
    setShowSlotModal(false)
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    
    if (!formData.studentName.trim()) errors.studentName = 'Student name is required'
    if (!formData.subject.trim()) errors.subject = 'Subject is required'
    if (!formData.contact.trim()) errors.contact = 'Contact is required'
    if (!formData.slotName.trim()) errors.slotName = 'Slot is required'
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (formData.contact && !phoneRegex.test(formData.contact)) {
      errors.contact = 'Please enter a valid 10-digit phone number'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  // Close snackbar
  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showSnackbar('Please fill all required fields correctly', 'warning')
      return
    }
    
    setLoading(true)
    try {
      // Log the form data being sent for debugging
      
      const data = await readmissionsAPI.createReadmission(formData)
      
      if (data.success) {
        setShowAddModal(false)
        setFormData({
          studentName: '',
          subject: '',
          contact: '',
          slotName: ''
        })
        fetchReadmissions()
        fetchStats()
        showSnackbar('Readmission created successfully!', 'success')
      }
    } catch (error) {
      
      // Handle validation errors from server
      if (error.errors) {
        const serverErrors = {}
        error.errors.forEach(err => {
          serverErrors[err.path] = err.msg
        })
        setFormErrors(serverErrors)
        showSnackbar('Please correct the errors in the form', 'error')
      } else {
        const errorMessage = error.data?.message || error.message || 'Failed to create readmission'
        showSnackbar(errorMessage, 'error')
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
        
        // Show success notification
        const statusText = status === 'approved' ? 'approved' : 'rejected'
        showSnackbar(`Readmission ${statusText} successfully!`, 'success')
      }
    } catch (error) {
      
      // Show error notification
      const errorMessage = error.data?.message || error.message || 'Failed to update status'
      showSnackbar(errorMessage, 'error')
    }
    setLoading(false)
  }

  // Handle edit
  const handleEdit = (readmission) => {
    setSelectedReadmission(readmission)
    setEditFormData({
      studentName: readmission.studentName,
      subject: readmission.subject || readmission.course,
      contact: readmission.contact,
      slotName: readmission.slotName,
      batch: readmission.batch || ''
    })
    setEditFormErrors({})
    setShowEditModal(true)
  }

  // Handle edit slot select
  const handleEditSlotSelect = (slot) => {
    setEditFormData(prev => ({
      ...prev,
      slotName: slot.name,
      subject: slot.subject || slot.course,
      batch: String(slot.class ?? '')
    }))
    setShowEditSlotModal(false)
  }

  // Validate edit form
  const validateEditForm = () => {
    const errors = {}
    
    if (!editFormData.studentName.trim()) errors.studentName = 'Student name is required'
    if (!editFormData.subject.trim()) errors.subject = 'Subject is required'
    if (!editFormData.contact.trim()) errors.contact = 'Contact is required'
    if (!editFormData.slotName.trim()) errors.slotName = 'Slot is required'
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (editFormData.contact && !phoneRegex.test(editFormData.contact)) {
      errors.contact = 'Please enter a valid 10-digit phone number'
    }
    
    setEditFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEditForm()) {
      showSnackbar('Please fill all required fields correctly', 'warning')
      return
    }
    
    setLoading(true)
    try {
      const data = await readmissionsAPI.updateReadmission(selectedReadmission._id, editFormData)
      
      if (data.success) {
        setShowEditModal(false)
        setEditFormData({
          studentName: '',
          subject: '',
          contact: '',
          slotName: '',
          batch: ''
        })
        fetchReadmissions()
        fetchStats()
        showSnackbar('Readmission updated successfully!', 'success')
      }
    } catch (error) {
      // Handle validation errors from server
      if (error.errors) {
        const serverErrors = {}
        error.errors.forEach(err => {
          serverErrors[err.path] = err.msg
        })
        setEditFormErrors(serverErrors)
        showSnackbar('Please correct the errors in the form', 'error')
      } else {
        const errorMessage = error.data?.message || error.message || 'Failed to update readmission'
        showSnackbar(errorMessage, 'error')
      }
    }
    setLoading(false)
  }

  // Handle delete
  const handleDelete = async (id) => {
    const confirmed = await confirmToast('Are you sure you want to delete this readmission?')
    if (!confirmed) return
    
    setLoading(true)
    try {
      const data = await readmissionsAPI.deleteReadmission(id)
      
      if (data.success) {
        fetchReadmissions()
        fetchStats()
        showSnackbar('Readmission deleted successfully!', 'success')
      }
    } catch (error) {
      
      showSnackbar('Failed to delete readmission', 'error')
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
            <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage and track student applications</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">Applications</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting Review</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
                <p className="text-xs text-gray-500 mt-1">Accepted</p>
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
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rejected</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">Declined</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                onClick={() => setSelectedTab('all')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  selectedTab === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  selectedTab === 'pending'
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setSelectedTab('approved')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  selectedTab === 'approved'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setSelectedTab('rejected')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  selectedTab === 'rejected'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                className="focus:ring-2 focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400"
                placeholder="Search by name, ID, or subject..."
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
              Add New Readmission
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow-xl overflow-hidden border border-gray-200 sm:rounded-xl bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Batch
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="relative px-6 py-4">
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
                        <tr key={readmission._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white font-semibold text-sm">
                                  {readmission.studentName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{readmission.studentName}</div>
                                <div className="text-sm text-gray-500">{readmission.contact}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{readmission.subject || readmission.course}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{readmission.slotName}</div>
                            {readmission.slotInfo && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">{readmission.slotInfo.enrolledStudents}/{readmission.slotInfo.capacity}</span> enrolled
                                {readmission.slotInfo.isFull && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                    FULL
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={readmission.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(readmission.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-1 justify-end">
                              <button 
                                onClick={() => {
                                  setSelectedReadmission(readmission)
                                  setShowViewModal(true)
                                }}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-150"
                                title="View details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleEdit(readmission)}
                                className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-150"
                                title="Edit readmission"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {readmission.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusUpdate(readmission._id, 'approved')}
                                    disabled={readmission.slotInfo?.isFull}
                                    className={`p-2 rounded-lg transition-all duration-150 ${
                                      readmission.slotInfo?.isFull 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                    }`}
                                    title={readmission.slotInfo?.isFull ? 'Slot is FULL - Cannot approve' : 'Approve readmission'}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleStatusUpdate(readmission._id, 'rejected')}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-150"
                                    title="Reject readmission"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleDelete(readmission._id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-150"
                                title="Delete readmission"
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
                    <label className="block text-sm font-medium text-gray-700">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.subject ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter subject name"
                    />
                    {formErrors.subject && <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>}
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
                    <label className="block text-sm font-medium text-gray-700">Batch *</label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        name="slotName"
                        value={formData.slotName}
                        readOnly
                        className="block w-full border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50"
                        placeholder="Select a batch"
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

      {/* Batch Selection Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-5/6 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select a Batch</h3>
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Batch Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject - Class</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Days</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Capacity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Instructor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slots.filter(slot => slot.isActive).map((slot) => (
                      <tr
                        key={slot._id}
                        onClick={() => handleSlotSelect(slot)}
                        className="cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{slot.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.course}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.subject} - {slot.class}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.startTime} - {slot.endTime}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.days.join(', ')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.enrolledStudents}/{slot.capacity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.instructor}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.type}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {slots.filter(slot => slot.isActive).length === 0 && (
                <p className="text-center text-gray-500 py-4">No active batches available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Readmission Modal */}
      {showEditModal && selectedReadmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Readmission</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name *</label>
                    <input
                      type="text"
                      name="studentName"
                      value={editFormData.studentName}
                      onChange={(e) => {
                        setEditFormData(prev => ({ ...prev, studentName: e.target.value }))
                        if (editFormErrors.studentName) {
                          setEditFormErrors(prev => ({ ...prev, studentName: '' }))
                        }
                      }}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${editFormErrors.studentName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter student name"
                    />
                    {editFormErrors.studentName && <p className="mt-1 text-sm text-red-600">{editFormErrors.studentName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={editFormData.subject}
                      onChange={(e) => {
                        setEditFormData(prev => ({ ...prev, subject: e.target.value }))
                        if (editFormErrors.subject) {
                          setEditFormErrors(prev => ({ ...prev, subject: '' }))
                        }
                      }}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${editFormErrors.subject ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter subject name"
                    />
                    {editFormErrors.subject && <p className="mt-1 text-sm text-red-600">{editFormErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact *</label>
                    <input
                      type="tel"
                      name="contact"
                      value={editFormData.contact}
                      onChange={(e) => {
                        setEditFormData(prev => ({ ...prev, contact: e.target.value }))
                        if (editFormErrors.contact) {
                          setEditFormErrors(prev => ({ ...prev, contact: '' }))
                        }
                      }}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${editFormErrors.contact ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter phone number"
                    />
                    {editFormErrors.contact && <p className="mt-1 text-sm text-red-600">{editFormErrors.contact}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch *</label>
                    <div className="mt-1 flex">
                      <input
                        type="text"
                        name="slotName"
                        value={editFormData.slotName}
                        readOnly
                        className="block w-full border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50"
                        placeholder="Select a batch"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditSlotModal(true)}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        Select
                      </button>
                    </div>
                    {editFormErrors.slotName && <p className="mt-1 text-sm text-red-600">{editFormErrors.slotName}</p>}
                  </div>
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
                    {loading ? 'Updating...' : 'Update Readmission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Selection Modal */}
      {showEditSlotModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-5/6 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select a Batch</h3>
                <button
                  onClick={() => setShowEditSlotModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Batch Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject - Class</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Days</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Capacity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Instructor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slots.filter(slot => slot.isActive).map((slot) => (
                      <tr
                        key={slot._id}
                        onClick={() => handleEditSlotSelect(slot)}
                        className="cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{slot.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.course}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.subject} - {slot.class}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.startTime} - {slot.endTime}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.days.join(', ')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.enrolledStudents}/{slot.capacity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.instructor}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.type}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{slot.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {slots.filter(slot => slot.isActive).length === 0 && (
                <p className="text-center text-gray-500 py-4">No active batches available</p>
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
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.subject || selectedReadmission.course}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.contact}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slot</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReadmission.slotName}</p>
                    {selectedReadmission.slotInfo && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">
                          Enrollment: {selectedReadmission.slotInfo.enrolledStudents}/{selectedReadmission.slotInfo.capacity}
                        </span>
                        {selectedReadmission.slotInfo.isFull ? (
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            FULL - Cannot Approve
                          </span>
                        ) : (
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {selectedReadmission.slotInfo.availableSlots} slots available
                          </span>
                        )}
                      </div>
                    )}
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
                      disabled={selectedReadmission.slotInfo?.isFull}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        selectedReadmission.slotInfo?.isFull
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      }`}
                      title={selectedReadmission.slotInfo?.isFull ? 'Slot is FULL - Cannot approve' : 'Approve this readmission'}
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

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default Readmissions