import { useState, useEffect } from 'react'
import { cmsAPI } from '../../utils/api'

const CMS = () => {
  const [activeTab, setActiveTab] = useState('carousel')
  const [cmsData, setCmsData] = useState({
    carousel: { carouselItems: [] },
    courses: { courses: [] },
    testimonials: { testimonials: [] },
    offers: { offers: [] }
  })
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})

  // Fetch CMS data
  const fetchCMSData = async () => {
    setLoading(true)
    try {
      const sections = ['carousel', 'courses', 'testimonials', 'offers']
      const promises = sections.map(section => cmsAPI.getCMSSection(section))
      const results = await Promise.allSettled(promises)
      
      const newData = {}
      results.forEach((result, index) => {
        const section = sections[index]
        if (result.status === 'fulfilled' && result.value.success) {
          newData[section] = result.value.data.data
        } else {
          newData[section] = section === 'carousel' ? { carouselItems: [] } :
                           section === 'courses' ? { courses: [] } :
                           section === 'testimonials' ? { testimonials: [] } :
                           { offers: [] }
        }
      })
      
      setCmsData(newData)
    } catch (error) {
      console.error('Error fetching CMS data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCMSData()
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form based on active tab
  const validateForm = () => {
    const errors = {}
    
    switch (activeTab) {
      case 'carousel':
        if (!formData.title?.trim()) errors.title = 'Title is required'
        if (!formData.subtitle?.trim()) errors.subtitle = 'Subtitle is required'
        break
      case 'courses':
        if (!formData.title?.trim()) errors.title = 'Course title is required'
        if (!formData.description?.trim()) errors.description = 'Description is required'
        break
      case 'testimonials':
        if (!formData.name?.trim()) errors.name = 'Name is required'
        if (!formData.role?.trim()) errors.role = 'Role is required'
        if (!formData.content?.trim()) errors.content = 'Content is required'
        break
      case 'offers':
        if (!formData.title?.trim()) errors.title = 'Offer title is required'
        if (!formData.description?.trim()) errors.description = 'Description is required'
        break
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle add new item
  const handleAdd = () => {
    setFormData({})
    setFormErrors({})
    setShowAddModal(true)
  }

  // Handle edit item
  const handleEdit = (item) => {
    setFormData(item)
    setFormErrors({})
    setSelectedItem(item)
    setShowEditModal(true)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      let apiMethod
      switch (activeTab) {
        case 'carousel':
          apiMethod = cmsAPI.addCarouselItem
          break
        case 'courses':
          apiMethod = cmsAPI.addCourse
          break
        case 'testimonials':
          apiMethod = cmsAPI.addTestimonial
          break
        case 'offers':
          apiMethod = cmsAPI.addOffer
          break
      }
      
      const data = await apiMethod(formData)
      
      if (data.success) {
        setShowAddModal(false)
        setShowEditModal(false)
        fetchCMSData()
      }
    } catch (error) {
      console.error('Error saving CMS item:', error)
    }
    setLoading(false)
  }

  // Handle delete item
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    
    setLoading(true)
    try {
      // For now, we'll just remove from local state
      // In a real app, you'd call a delete API
      setCmsData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [activeTab === 'carousel' ? 'carouselItems' : 
           activeTab === 'courses' ? 'courses' :
           activeTab === 'testimonials' ? 'testimonials' : 'offers']: 
          prev[activeTab][activeTab === 'carousel' ? 'carouselItems' : 
                         activeTab === 'courses' ? 'courses' :
                         activeTab === 'testimonials' ? 'testimonials' : 'offers']
            .filter(item => item.id !== itemId)
        }
      }))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
    setLoading(false)
  }

  // Render form based on active tab
  const renderForm = () => {
    switch (activeTab) {
      case 'carousel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter carousel title"
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle *</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.subtitle ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter carousel subtitle"
              />
              {formErrors.subtitle && <p className="mt-1 text-sm text-red-600">{formErrors.subtitle}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Teacher Name</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter teacher name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Teacher Role</label>
                <input
                  type="text"
                  name="teacherRole"
                  value={formData.teacherRole || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter teacher role"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Teacher Image URL</label>
              <input
                type="url"
                name="teacherImage"
                value={formData.teacherImage || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter teacher image URL"
              />
            </div>
          </div>
        )
        
      case 'courses':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter course title"
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter course description"
              />
              {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter course image URL"
              />
            </div>
          </div>
        )
        
      case 'testimonials':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter name"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.role ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter role"
                />
                {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Testimonial Content *</label>
              <textarea
                name="content"
                value={formData.content || ''}
                onChange={handleInputChange}
                rows={4}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.content ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter testimonial content"
              />
              {formErrors.content && <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Avatar Image URL</label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter avatar image URL"
              />
            </div>
          </div>
        )
        
      case 'offers':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Offer Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter offer title"
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter offer description"
              />
              {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount</label>
                <input
                  type="text"
                  name="discount"
                  value={formData.discount || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 20% OFF, $50 OFF"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Offer Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter offer image URL"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Active Offer</label>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  // Render content based on active tab
  const renderContent = () => {
    const items = activeTab === 'carousel' ? cmsData.carousel.carouselItems :
                 activeTab === 'courses' ? cmsData.courses.courses :
                 activeTab === 'testimonials' ? cmsData.testimonials.testimonials :
                 cmsData.offers.offers

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {activeTab === 'carousel' ? 'Carousel Items' :
               activeTab === 'courses' ? 'Courses' :
               activeTab === 'testimonials' ? 'Testimonials' : 'Sales & Offers'}
            </h3>
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New
            </button>
          </div>
          
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No items found. Click "Add New" to create your first item.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {activeTab === 'carousel' && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.subtitle}</p>
                          {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                          {item.teacher?.name && (
                            <div className="mt-2 flex items-center">
                              <div className="h-8 w-8 bg-gray-300 rounded-full mr-2"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.teacher.name}</p>
                                <p className="text-xs text-gray-500">{item.teacher.role}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'courses' && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                      )}
                      
                      {activeTab === 'testimonials' && (
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                            <div>
                              <h4 className="text-md font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500">{item.role}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">"{item.content}"</p>
                        </div>
                      )}
                      
                      {activeTab === 'offers' && (
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-md font-medium text-gray-900">{item.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          {item.discount && <p className="text-sm text-blue-600 font-medium">{item.discount}</p>}
                          {item.validUntil && <p className="text-xs text-gray-400">Valid until: {item.validUntil}</p>}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Content Management System</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your website content from here.</p>

      {/* Tabs */}
      <div className="mt-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="carousel">Carousel & Teachers</option>
            <option value="courses">Courses</option>
            <option value="testimonials">Testimonials</option>
            <option value="offers">Sales & Offers</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('carousel')}
                className={`${
                  activeTab === 'carousel'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Carousel & Teachers
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`${
                  activeTab === 'testimonials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Testimonials
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`${
                  activeTab === 'offers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Sales & Offers
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderContent()}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New {activeTab === 'carousel' ? 'Carousel Item' :
                           activeTab === 'courses' ? 'Course' :
                           activeTab === 'testimonials' ? 'Testimonial' : 'Offer'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {renderForm()}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit {activeTab === 'carousel' ? 'Carousel Item' :
                        activeTab === 'courses' ? 'Course' :
                        activeTab === 'testimonials' ? 'Testimonial' : 'Offer'}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {renderForm()}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CMS