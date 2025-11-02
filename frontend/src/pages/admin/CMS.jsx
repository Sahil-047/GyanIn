import { useState, useEffect } from 'react'
import { cmsAPI, coursesAPI, slotsAPI } from '../../utils/api'
import ImageUploader from '../../components/common/ImageUploader'

const CMS = () => {
  const [activeTab, setActiveTab] = useState('carousel')
  const [cmsData, setCmsData] = useState({
    carousel: { carouselItems: [] },
    courses: { courses: [] },
    offers: { offers: [] }
  })
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [instructors, setInstructors] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])

  // Fetch CMS data
  const fetchCMSData = async () => {
    setLoading(true)
    try {
      // Fetch CMS sections (excluding courses which will be fetched separately)
      const sections = ['carousel', 'offers']
      const cmsPromises = sections.map(section =>
        cmsAPI.getCMSSection(section).catch(err => {

          return { success: true, data: { data: null } }
        })
      )

      // Fetch courses from the courses collection
      const coursesPromise = coursesAPI.getCourses({ limit: 100 })
      
      // Fetch slots from the slots collection
      const slotsPromise = slotsAPI.getSlots({ limit: 100 })

      const allResults = await Promise.allSettled([...cmsPromises, coursesPromise, slotsPromise])

      const newData = {
        carousel: { carouselItems: [] },
        courses: { courses: [] },
        offers: { offers: [] }
      }

      // Process CMS sections (carousel, offers)
      sections.forEach((section, index) => {
        const result = allResults[index]

        if (result.status === 'fulfilled' && result.value.success) {
          const cmsDocument = result.value.data


          // Special handling for offers to map old and new data formats
          if (section === 'offers') {

            const offers = cmsDocument.data?.offers || [];


            newData[section] = {
              offers: offers.map(offer => {
                const mappedOffer = {
                  id: offer.id,
                  name: offer.name || offer.title,
                  offer: offer.offer || offer.description,
                  slotId: offer.slotId || '',
                  courseId: offer.courseId || '', // Keep for backward compatibility
                  color: offer.color,
                  discount: offer.discount,
                  validUntil: offer.validUntil,
                  isActive: typeof offer.isActive === 'boolean' ? offer.isActive : true
                };

                return mappedOffer;
              })
            };

          } else if (section === 'carousel') {
            // Handle carousel data structure


            const carouselItems = cmsDocument.data?.carouselItems || [];


            newData[section] = {
              carouselItems: carouselItems
            };
          } else {
            newData[section] = cmsDocument.data || {}
          }


        }
      })

      // Process courses from the courses collection
      const coursesResult = allResults[sections.length]
      if (coursesResult.status === 'fulfilled' && coursesResult.value.success) {
        // Convert courses from courses collection to CMS format
        const coursesData = coursesResult.value.data.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          class: course.class,
          image: course.image,
          enrollmentUrl: course.enrollmentUrl
        }))
        newData.courses = { courses: coursesData }
        // Set available courses for offers dropdown (only active/live courses)
        setAvailableCourses(coursesData.filter(course => course.id))
      }

      // Process slots from the slots collection
      const slotsResult = allResults[sections.length + 1]
      if (slotsResult.status === 'fulfilled' && slotsResult.value.success) {
        // Set available slots for ongoing courses dropdown
        setAvailableSlots(slotsResult.value.data.filter(slot => slot.isActive))
      }

      setCmsData(newData)

      // Extract instructor names from carousel data
      const instructorNames = new Set()
      newData.carousel.carouselItems.forEach(item => {
        const teacherName = item.teacher?.name || item.title || item.subtitle
        if (teacherName && teacherName.trim()) {
          instructorNames.add(teacherName.trim())
        }
      })
      setInstructors(Array.from(instructorNames).sort())
    } catch (error) {

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
        if (!formData.teacherName?.trim()) errors.teacherName = 'Teacher name is required'
        if (!formData.description?.trim()) errors.description = 'Description is required'
        break
      case 'courses':
        if (!formData.title?.trim()) errors.title = 'Course title is required'
        if (!formData.description?.trim()) errors.description = 'Description is required'
        if (!formData.instructor?.trim()) errors.instructor = 'Instructor is required'
        if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required'
        if (!formData.class || formData.class < 1 || formData.class > 12) errors.class = 'Class must be a number between 1 and 12'
        break
      case 'offers':
        if (!formData.name?.trim()) errors.name = 'Batch name is required'
        if (!formData.offer?.trim()) errors.offer = 'Description is required'
        if (!formData.slotId?.trim()) errors.slotId = 'Batch selection is required'
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle add new item
  const handleAdd = () => {
    // Set default values for new items
    const defaultData = activeTab === 'offers' ? { isActive: true } : {}
    setFormData(defaultData)
    setFormErrors({})
    setShowAddModal(true)
  }

  // Handle edit item
  const handleEdit = (item) => {
    // Handle backward compatibility for carousel items
    let formDataToSet = { ...item };

    if (activeTab === 'carousel') {
      // If old structure, convert to new structure for editing
      if (item.title || item.teacher) {
        formDataToSet = {
          id: item.id,
          teacherName: item.teacher?.name || item.title || '',
          description: item.teacher?.description || item.description || '',
          teacherImage: item.teacher?.image || item.image || '',
          scheduleImage: item.teacher?.scheduleImage || ''
        };
      } else {
        // New structure
        formDataToSet = {
          id: item.id,
          teacherName: item.teacherName || '',
          description: item.description || '',
          teacherImage: item.teacherImage || '',
          scheduleImage: item.scheduleImage || ''
        };
      }
    } else if (activeTab === 'offers') {
      // Ensure slotId is included for ongoing courses
      formDataToSet = {
        id: item.id,
        name: item.name || '',
        offer: item.offer || '',
        slotId: item.slotId || '',
        color: item.color || '',
        validUntil: item.validUntil || '',
        isActive: item.isActive !== undefined ? item.isActive : true
      };
    }

    setFormData(formDataToSet)
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
      let result
      let submitData = { ...formData }

      if (activeTab === 'courses') {
        // Convert price to number if it's a string
        if (submitData.price && typeof submitData.price === 'string') {
          submitData.price = parseFloat(submitData.price)
        }

        // Convert class to number if it's a string
        if (submitData.class && typeof submitData.class === 'string') {
          submitData.class = parseInt(submitData.class)
        }

        // Set default image if not provided
        if (!submitData.image || submitData.image.trim() === '') {
          submitData.image = 'https://via.placeholder.com/400x300?text=Course'
        }

        // For courses, use the courses API directly
        if (selectedItem) {
          // Update existing course - remove id from the update data
          const { id, ...updateData } = submitData

          result = await coursesAPI.updateCourse(selectedItem.id, updateData)
        } else {
          // Create new course
          result = await coursesAPI.createCourse(submitData)
        }
      } else {
        // For other tabs, use CMS API
        let apiMethod

        // For editing carousel items - don't allow editing old structure
        if (activeTab === 'carousel' && selectedItem && (selectedItem.title || selectedItem.subtitle)) {
          alert('Please delete this old carousel item and create a new one with the simplified structure.');
          setLoading(false)
          return
        }

        switch (activeTab) {
          case 'carousel':
            if (selectedItem) {
              // Update existing carousel item
              result = await cmsAPI.updateCarouselItem(selectedItem.id, submitData)
            } else {
              // Create new carousel item
              result = await cmsAPI.addCarouselItem(submitData)
            }
            break
          case 'offers':
            if (selectedItem) {
              // Update existing offer
              result = await cmsAPI.updateOffer(selectedItem.id, submitData)
            } else {
              // Create new offer
              result = await cmsAPI.addOffer(submitData)
            }
            break
          default:
            break
        }
      }

      if (result && result.success) {
        setShowAddModal(false)
        setShowEditModal(false)
        fetchCMSData()
      }
    } catch (error) {

    }
    setLoading(false)
  }

  // Handle delete item
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    setLoading(true)
    try {
      let result;

      if (activeTab === 'courses') {
        // Delete course from the courses API
        result = await coursesAPI.deleteCourse(itemId);
      } else if (activeTab === 'offers') {
        // Delete offer from CMS API
        result = await cmsAPI.deleteOffer(itemId);
      } else if (activeTab === 'carousel') {
        // Delete carousel item from CMS API
        result = await cmsAPI.deleteCarouselItem(itemId);
      }

      if (result && result.success) {
        // Refresh data from server instead of updating local state
        await fetchCMSData();
      }
    } catch (error) {
      // Error handled silently
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
              <label className="block text-sm font-medium text-gray-700">Teacher Name *</label>
              <input
                type="text"
                name="teacherName"
                value={formData.teacherName || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.teacherName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter teacher name"
              />
              {formErrors.teacherName && <p className="mt-1 text-sm text-red-600">{formErrors.teacherName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter teacher description"
              />
              {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Teacher Image</label>
              <ImageUploader
                value={formData.teacherImage || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, teacherImage: url }))}
                buttonText="Upload teacher image"
                bucketType="teacher"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Schedule Image</label>
              <ImageUploader
                value={formData.scheduleImage || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, scheduleImage: url }))}
                buttonText="Upload schedule image"
                bucketType="teacher"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Instructor *</label>
                {instructors.length > 0 ? (
                  <select
                    name="instructor"
                    value={formData.instructor || ''}
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
                    value={formData.instructor || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.instructor ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter instructor name (no instructors available in carousel)"
                  />
                )}
                {formErrors.instructor && <p className="mt-1 text-sm text-red-600">{formErrors.instructor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter price"
                />
                {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Class *</label>
                <input
                  type="number"
                  name="class"
                  value={formData.class || ''}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.class ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter class (1-12)"
                />
                {formErrors.class && <p className="mt-1 text-sm text-red-600">{formErrors.class}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Enrollment URL</label>
              <input
                type="url"
                name="enrollmentUrl"
                value={formData.enrollmentUrl || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/enroll"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to use default admissions page</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Course Image</label>
              <ImageUploader
                value={formData.image || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                buttonText="Upload course image"
                bucketType="course"
              />
            </div>
          </div>
        )

      case 'offers':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Weekend Batch A, Evening Batch B"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch *</label>
              <select
                name="slotId"
                value={formData.slotId || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 ${formErrors.slotId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select a batch</option>
                {availableSlots.map((slot) => {
                  const availableSeats = slot.capacity - slot.enrolledStudents;
                  return (
                    <option key={slot._id} value={slot._id}>
                      {slot.name} - {slot.subject} (Class {slot.class}) - {availableSeats} seats available
                    </option>
                  );
                })}
              </select>
              {formErrors.slotId && <p className="mt-1 text-sm text-red-600">{formErrors.slotId}</p>}
              <p className="mt-1 text-xs text-gray-500">Choose an active batch from the slots</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="offer"
                value={formData.offer || ''}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.offer ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Evening classes with flexible timings"
              />
              {formErrors.offer && <p className="mt-1 text-sm text-red-600">{formErrors.offer}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color Theme</label>
              <select
                name="color"
                value={formData.color || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select color</option>
                <option value="from-blue-500 to-blue-600">Blue</option>
                <option value="from-green-500 to-green-600">Green</option>
                <option value="from-purple-500 to-purple-600">Purple</option>
                <option value="from-orange-500 to-orange-600">Orange</option>
                <option value="from-red-500 to-red-600">Red</option>
                <option value="from-teal-500 to-teal-600">Teal</option>
                <option value="from-indigo-500 to-indigo-600">Indigo</option>
                <option value="from-pink-500 to-pink-600">Pink</option>
                <option value="from-cyan-500 to-cyan-600">Cyan</option>
                <option value="from-emerald-500 to-emerald-600">Emerald</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
                activeTab === 'courses' ? 'Courses' : 'Ongoing Courses'}
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
                          {/* Support both old and new carousel structure */}
                          {(() => {
                            const teacherName = item.teacher?.name || item.title;
                            const teacherImage = item.teacher?.image || item.image || item.teacherImage;
                            const description = item.teacher?.description || item.description;

                            return (
                              <>
                                {teacherName && (
                                  <div className="mt-2 flex items-center">
                                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center overflow-hidden">
                                      <img src={teacherImage} alt={teacherName} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{teacherName}</p>
                                    </div>
                                  </div>
                                )}
                                {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {activeTab === 'courses' && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                      )}

                      {activeTab === 'offers' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 bg-gradient-to-r ${item.color || 'from-blue-500 to-blue-600'} rounded-lg flex items-center justify-center mr-3`}>
                                <span className="text-white font-bold text-sm">
                                  {(item.name || item.title)?.charAt(0) || 'O'}
                                </span>
                              </div>
                              <h4 className="text-md font-medium text-gray-900">{item.name || item.title}</h4>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.offer || item.description}</p>
                          {item.slotId && (
                            <p className="text-xs text-blue-600 mt-1">
                              Batch: {availableSlots.find(s => s._id === item.slotId)?.name || 'Batch selected'}
                            </p>
                          )}
                          {availableSlots.find(s => s._id === item.slotId) && (() => {
                            const availableSeats = availableSlots.find(s => s._id === item.slotId).capacity - availableSlots.find(s => s._id === item.slotId).enrolledStudents;
                            const isLowAvailability = availableSeats < 10;
                            return (
                              <p className={`text-xs mt-1 ${isLowAvailability ? 'text-red-600' : 'text-green-600'}`}>
                                Seats Available: {availableSeats}
                              </p>
                            );
                          })()}
                          {item.validUntil && <p className="text-xs text-gray-400 mt-1">Valid until: {new Date(item.validUntil).toLocaleDateString()}</p>}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {/* Hide edit button for old carousel structure */}
                      {!(activeTab === 'carousel' && (item.title || item.subtitle)) && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                      )}
                      {/* Show delete button for all items */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                      {/* Show info badge for old carousel items */}
                      {activeTab === 'carousel' && (item.title || item.subtitle) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Old Format
                        </span>
                      )}
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
            <option value="offers">Ongoing Courses</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('carousel')}
                className={`${activeTab === 'carousel'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Carousel & Teachers
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`${activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`${activeTab === 'offers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Ongoing Courses
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
                    activeTab === 'courses' ? 'Course' : 'Offer'}
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
                    activeTab === 'courses' ? 'Course' : 'Offer'}
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