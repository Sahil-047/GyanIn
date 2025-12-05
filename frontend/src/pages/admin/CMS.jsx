import { useState, useEffect } from 'react'
import { cmsAPI, coursesAPI, slotsAPI, merchandiseAPI } from '../../utils/api'
import ImageUploader from '../../components/common/ImageUploader'
import toast from 'react-hot-toast'
import { confirmToast } from '../../App'

const CMS = () => {
  const [activeTab, setActiveTab] = useState('carousel')
  const [cmsData, setCmsData] = useState({
    carousel: { carouselItems: [] },
    courses: { courses: [] },
    merchandise: { merchandise: [] },
    offers: { offers: [] },
    testimonials: { testimonials: [] }
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
      const sections = ['carousel', 'offers', 'ongoingCourses', 'testimonials']

      const cmsPromises = sections.map(section =>
        cmsAPI.getCMSSection(section, true).then(response => {
          return response
        }).catch(err => {
          // Return empty structure instead of null to prevent errors
          let emptyData = {};
          switch (section) {
            case 'carousel':
              emptyData = { carouselItems: [] };
              break;
            case 'offers':
              emptyData = { offers: [] };
              break;
            case 'testimonials':
              emptyData = { testimonials: [] };
              break;
            case 'ongoingCourses':
              emptyData = { ongoingCourses: [] };
              break;
            default:
              emptyData = {};
          }
          const fallbackResponse = { success: true, data: { section, data: emptyData } }
          return fallbackResponse
        })
      )

      // Fetch courses from the courses collection (admin should see all courses, including inactive)
      // Note: The public API filters by isActive, but we need all courses for admin
      // We'll fetch with a high limit and then filter client-side if needed
      const coursesPromise = coursesAPI.getCourses({ limit: 1000 })

      // Fetch merchandise from the merchandise collection
      const merchandisePromise = merchandiseAPI.getMerchandise({ limit: 100 })

      // Fetch slots from the slots collection
      const slotsPromise = slotsAPI.getSlots({ limit: 100 })

      const allResults = await Promise.allSettled([...cmsPromises, coursesPromise, merchandisePromise, slotsPromise])

      const newData = {
        carousel: { carouselItems: [] },
        courses: { courses: [] },
        merchandise: { merchandise: [] },
        offers: { offers: [] },
        ongoingCourses: { ongoingCourses: [] }
      }

      // Process CMS sections (carousel, offers)
      sections.forEach((section, index) => {
        const result = allResults[index]

        if (result.status === 'fulfilled' && result.value?.success) {
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
            // Handle carousel data structure - check multiple possible locations
            let carouselItems = [];

            if (cmsDocument.data?.carouselItems) {
              carouselItems = cmsDocument.data.carouselItems;
            } else if (cmsDocument.carouselItems) {
              carouselItems = cmsDocument.carouselItems;
            }

            newData[section] = {
              carouselItems: carouselItems
            };
          } else if (section === 'testimonials') {
            const testimonials = cmsDocument.data?.testimonials || []
            newData[section] = { testimonials }
          } else if (section === 'ongoingCourses') {
            // Filter out hidden batches from display
            const ongoingCourses = (cmsDocument.data?.ongoingCourses || []).filter(c => !c.isHidden)
            newData[section] = { ongoingCourses }
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
          monthlyPrice: course.monthlyPrice,
          yearlyPrice: course.yearlyPrice,
          class: course.class,
          image: course.image,
          enrollmentUrl: course.enrollmentUrl,
          rating: course.rating,
          students: course.students,
          category: course.category,
          duration: course.duration,
          tags: course.tags,
          isActive: course.isActive
        }))

        newData.courses = { courses: coursesData }
        // Set available courses for offers dropdown (only active/live courses)
        setAvailableCourses(coursesData.filter(course => course.id))
      }

      // Process merchandise from the merchandise collection
      const merchandiseResult = allResults[sections.length + 1]
      if (merchandiseResult.status === 'fulfilled' && merchandiseResult.value.success) {
        // Convert merchandise from merchandise collection to CMS format
        const merchandiseData = merchandiseResult.value.data.map(item => ({
          id: item._id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          stock: item.stock
        }))
        newData.merchandise = { merchandise: merchandiseData }
      }

      // Process slots from the slots collection
      const slotsResult = allResults[sections.length + 2]
      if (slotsResult.status === 'fulfilled' && slotsResult.value.success) {
        // Set available slots for ongoing courses dropdown
        setAvailableSlots(slotsResult.value.data.filter(slot => slot.isActive))
      }

      // Set CMS data - ensure all sections are properly initialized
      setCmsData(prevData => {
        const updatedData = {
          ...prevData,
          ...newData,
          // Ensure all sections exist with proper structure
          carousel: newData.carousel || { carouselItems: [] },
          offers: newData.offers || { offers: [] },
          testimonials: newData.testimonials || { testimonials: [] },
          ongoingCourses: newData.ongoingCourses || { ongoingCourses: [] },
          courses: newData.courses || { courses: [] },
          merchandise: newData.merchandise || { merchandise: [] }
        }

        return updatedData
      })

      // Extract instructor names from carousel data
      const instructorNames = new Set()
      const carouselItems = newData.carousel?.carouselItems || []
      carouselItems.forEach(item => {
        const teacherName = item.teacher?.name || item.title || item.subtitle
        if (teacherName && teacherName.trim()) {
          instructorNames.add(teacherName.trim())
        }
      })
      setInstructors(Array.from(instructorNames).sort())
    } catch (error) {
      toast.error('Failed to load CMS data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
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
        // Require at least one of monthly or one-time price (legacy price not considered)
        if (!formData.monthlyPrice && !formData.yearlyPrice) {
          errors.monthlyPrice = 'Provide monthly and/or one-time price'
        }
        if (formData.monthlyPrice && formData.monthlyPrice < 0) errors.monthlyPrice = 'Monthly price must be a positive number'
        if (formData.yearlyPrice && formData.yearlyPrice < 0) errors.yearlyPrice = 'One-time price must be a positive number'
        if (!formData.class || formData.class < 1 || formData.class > 12) errors.class = 'Class must be a number between 1 and 12'
        break
      case 'merchandise':
        if (!formData.title?.trim()) errors.title = 'Merchandise title is required'
        if (!formData.description?.trim()) errors.description = 'Description is required'
        else if (formData.description.trim().length < 10) errors.description = 'Description must be at least 10 characters'
        if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required'
        break
      case 'offers':
        if (!formData.name?.trim()) errors.name = 'Offer name is required'
        break
      case 'ongoingCourses':
        if (!formData.name?.trim()) errors.name = 'Name is required'
        if (!formData.offer?.trim()) errors.offer = 'Description is required'
        break
      case 'testimonials':
        if (!formData.name?.trim()) errors.name = 'Name is required'
        if (!formData.quote?.trim()) errors.quote = 'Testimonial is required'
        if (formData.rating && (formData.rating < 1 || formData.rating > 5)) errors.rating = 'Rating must be 1-5'
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
          scheduleImage: item.teacher?.scheduleImage || '', // Keep for backward compatibility
          schedule1Image: item.teacher?.schedule1Image || '',
          schedule2Image: item.teacher?.schedule2Image || ''
        };
      } else {
        // New structure
        formDataToSet = {
          id: item.id,
          teacherName: item.teacherName || '',
          description: item.description || '',
          teacherImage: item.teacherImage || '',
          schedule1Image: item.teacher?.schedule1Image || item.schedule1Image || '',
          schedule2Image: item.teacher?.schedule2Image || item.schedule2Image || ''
        };
      }
    } else if (activeTab === 'merchandise') {
      // Ensure proper ID and structure for merchandise
      formDataToSet = {
        id: item.id || item._id, // Use id if available, fallback to _id
        title: item.title || '',
        description: item.description || '',
        price: item.price || 0,
        category: item.category || '',
        image: item.image || '',
        stock: item.stock !== undefined ? item.stock : ''
      };
    } else if (activeTab === 'courses') {
      // Ensure proper ID and structure for courses
      formDataToSet = {
        id: item.id || item._id, // Use id if available, fallback to _id
        title: item.title || '',
        description: item.description || '',
        instructor: item.instructor || '',
        price: item.price || '',
        monthlyPrice: item.monthlyPrice || '',
        yearlyPrice: item.yearlyPrice || '',
        class: item.class || '',
        category: item.category || '',
        enrollmentUrl: item.enrollmentUrl || '',
        image: item.image || '',
        duration: item.duration || '',
        rating: item.rating || 0,
        students: item.students || 0,
        tags: item.tags || [],
        isActive: item.isActive !== undefined ? item.isActive : true
      };
    } else if (activeTab === 'offers') {
      formDataToSet = {
        id: item.id,
        name: item.name || '',
        offer: item.offer || '',
        color: item.color || '',
        validUntil: item.validUntil || '',
        discount: item.discount || '',
        isActive: item.isActive !== undefined ? item.isActive : true
      };
    } else if (activeTab === 'ongoingCourses') {
      // Ongoing batches can be edited (display only, not the batch)
      formDataToSet = {
        id: item.id,
        name: item.name || item.title || '',
        title: item.title || item.name || '',
        offer: item.offer || item.description || '',
        description: item.description || item.offer || '',
        color: item.color || 'from-blue-500 to-blue-600',
        isActive: item.isActive !== undefined ? item.isActive : true,
        slotId: item.slotId || '' // Keep slotId for reference
      };
    } else if (activeTab === 'testimonials') {
      formDataToSet = {
        id: item.id,
        name: item.name || '',
        role: item.role || '',
        quote: item.quote || '',
        image: item.image || '',
        rating: item.rating || 5,
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
        // Convert prices to numbers if they're strings, and remove if empty or invalid
        if (submitData.price !== undefined && submitData.price !== null && submitData.price !== '') {
          if (typeof submitData.price === 'string') {
            const parsed = parseFloat(submitData.price)
            if (isNaN(parsed) || parsed <= 0) {
              delete submitData.price
            } else {
              submitData.price = parsed
            }
          } else if (submitData.price <= 0) {
            delete submitData.price
          }
        } else {
          delete submitData.price
        }
        if (submitData.monthlyPrice !== undefined && submitData.monthlyPrice !== null && submitData.monthlyPrice !== '') {
          if (typeof submitData.monthlyPrice === 'string') {
            const parsed = parseFloat(submitData.monthlyPrice)
            if (isNaN(parsed) || parsed <= 0) {
              delete submitData.monthlyPrice
            } else {
              submitData.monthlyPrice = parsed
            }
          } else if (submitData.monthlyPrice <= 0) {
            delete submitData.monthlyPrice
          }
        } else {
          delete submitData.monthlyPrice
        }
        if (submitData.yearlyPrice !== undefined && submitData.yearlyPrice !== null && submitData.yearlyPrice !== '') {
          if (typeof submitData.yearlyPrice === 'string') {
            const parsed = parseFloat(submitData.yearlyPrice)
            if (isNaN(parsed) || parsed <= 0) {
              delete submitData.yearlyPrice
            } else {
              submitData.yearlyPrice = parsed
            }
          } else if (submitData.yearlyPrice <= 0) {
            delete submitData.yearlyPrice
          }
        } else {
          delete submitData.yearlyPrice
        }

        // Convert class to number if it's a string
        if (submitData.class && typeof submitData.class === 'string') {
          submitData.class = parseInt(submitData.class)
        }

        // Set default image if not provided
        if (!submitData.image || submitData.image.trim() === '') {
          submitData.image = 'https://via.placeholder.com/400x300?text=Course'
        }

        // Ensure isActive is set (default to true for new courses)
        if (submitData.isActive === undefined) {
          submitData.isActive = true
        }

        // For courses, use the courses API directly
        if (selectedItem) {
          // Update existing course - remove id from the update data
          const { id, ...updateData } = submitData

          // Ensure we use the correct ID from selectedItem (prefer id, fallback to _id)
          const courseId = selectedItem.id || selectedItem._id
          if (!courseId) {
            throw new Error('Course ID is missing. Please refresh and try again.')
          }

          // Validate ID format - MongoDB ObjectId should be 24 hex characters
          if (typeof courseId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(courseId)) {
            throw new Error('Invalid course ID format. Please refresh the page and try again.')
          }

          result = await coursesAPI.updateCourse(courseId, updateData)
        } else {
          // Create new course
          result = await coursesAPI.createCourse(submitData)
        }
      } else if (activeTab === 'merchandise') {
        // Convert price to number if it's a string
        if (submitData.price && typeof submitData.price === 'string') {
          submitData.price = parseFloat(submitData.price)
        }

        // Convert stock to number if it's a string
        if (submitData.stock && typeof submitData.stock === 'string') {
          submitData.stock = parseInt(submitData.stock)
        }

        // Set default image if not provided
        if (!submitData.image || submitData.image.trim() === '') {
          submitData.image = 'https://via.placeholder.com/400x300?text=Merchandise'
        }

        // For merchandise, use the merchandise API directly
        if (selectedItem) {
          // Update existing merchandise - remove id from the update data
          const { id, ...updateData } = submitData

          // Ensure we use the correct ID from selectedItem (prefer id, fallback to _id)
          const merchandiseId = selectedItem.id || selectedItem._id
          if (!merchandiseId) {
            throw new Error('Merchandise ID is missing. Please refresh and try again.')
          }

          // Validate ID format - MongoDB ObjectId should be 24 hex characters
          if (typeof merchandiseId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(merchandiseId)) {
            throw new Error('Invalid merchandise ID format. Please refresh the page and try again.')
          }

          result = await merchandiseAPI.updateMerchandise(merchandiseId, updateData)
        } else {
          // Create new merchandise
          result = await merchandiseAPI.createMerchandise(submitData)
        }
      } else {
        // For other tabs, use CMS API
        let apiMethod

        // For editing carousel items - don't allow editing old structure
        if (activeTab === 'carousel' && selectedItem && (selectedItem.title || selectedItem.subtitle)) {
          toast.error('Please delete this old carousel item and create a new one with the simplified structure.')
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
          case 'testimonials':
            if (selectedItem) {
              result = await cmsAPI.updateTestimonial(selectedItem.id, submitData)
            } else {
              result = await cmsAPI.addTestimonial(submitData)
            }
            break
          case 'ongoingCourses':
            if (selectedItem) {
              result = await cmsAPI.updateOngoingCourse(selectedItem.id, submitData)
            }
            break
          default:
            break
        }
      }

      if (result && result.success) {
        const action = selectedItem ? 'updated' : 'created'
        const itemName = activeTab === 'carousel' ? 'Carousel item'
          : activeTab === 'courses' ? 'Course'
            : activeTab === 'merchandise' ? 'Merchandise item'
              : activeTab === 'offers' ? 'Offer'
                : activeTab === 'ongoingCourses' ? 'Ongoing batch'
                  : activeTab === 'testimonials' ? 'Testimonial'
                    : 'Item'
        toast.success(`${itemName} ${action} successfully!`)
        setShowAddModal(false)
        setShowEditModal(false)
        setFormData({})
        setFormErrors({})
        setSelectedItem(null)

        // ROOT CAUSE FIX: Wait for backend, then force refetch with NO cache
        await new Promise(resolve => setTimeout(resolve, 600))

        // Force complete refetch - bypass ALL caches
        await fetchCMSData()

        // For offers, immediately add/update the offer in local state
        if (activeTab === 'offers' && result.data) {
          const offerData = {
            id: result.data.id,
            name: result.data.name || result.data.title,
            offer: result.data.offer || result.data.description,
            slotId: result.data.slotId || '',
            courseId: result.data.courseId || '',
            color: result.data.color || 'from-blue-500 to-blue-600',
            discount: result.data.discount || '',
            validUntil: result.data.validUntil || '',
            isActive: result.data.isActive !== undefined ? result.data.isActive : true
          }

          if (selectedItem) {
            // Update existing offer in local state
            setCmsData(prev => ({
              ...prev,
              offers: {
                offers: prev.offers.offers.map(o =>
                  o.id === offerData.id ? offerData : o
                )
              }
            }))
          } else {
            // Add new offer to local state
            setCmsData(prev => ({
              ...prev,
              offers: {
                offers: [offerData, ...prev.offers.offers]
              }
            }))
          }
        }

        // Still refresh to ensure everything is in sync (will deduplicate if needed)
        fetchCMSData()
      }
    } catch (error) {
      // Handle validation errors from backend
      if (error.data && error.data.errors) {
        const backendErrors = {}
        error.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg
        })
        setFormErrors(backendErrors)
      } else if (error.data && error.data.message) {
        // Show general error message
        toast.error(error.data.message || 'Failed to save. Please check the form and try again.')
      } else {
        toast.error(error.message || 'An error occurred. Please try again.')
      }
    }
    setLoading(false)
  }

  // Handle delete item
  const handleDelete = async (itemId) => {
    const confirmed = await confirmToast('Are you sure you want to delete this item?')
    if (!confirmed) return

    setLoading(true)
    try {
      let result;

      if (activeTab === 'courses') {
        // Delete course from the courses API
        result = await coursesAPI.deleteCourse(itemId);
      } else if (activeTab === 'merchandise') {
        // Delete merchandise from the merchandise API
        result = await merchandiseAPI.deleteMerchandise(itemId);
      } else if (activeTab === 'offers') {
        // Delete offer from CMS API
        result = await cmsAPI.deleteOffer(itemId);
      } else if (activeTab === 'ongoingCourses') {
        // Delete ongoing batch from carousel (doesn't delete the batch)
        const confirmed = await confirmToast('This will remove the batch from the carousel but will NOT delete the actual batch. Continue?')
        if (!confirmed) {
          setLoading(false)
          return
        }
        result = await cmsAPI.deleteOngoingCourse(itemId);
      } else if (activeTab === 'carousel') {
        // Delete carousel item from CMS API
        result = await cmsAPI.deleteCarouselItem(itemId);
      } else if (activeTab === 'testimonials') {
        result = await cmsAPI.deleteTestimonial(itemId)
      }

      if (result && result.success) {
        const itemName = activeTab === 'carousel' ? 'Carousel item'
          : activeTab === 'courses' ? 'Course'
            : activeTab === 'merchandise' ? 'Merchandise item'
              : activeTab === 'offers' ? 'Offer'
                : activeTab === 'ongoingCourses' ? 'Ongoing batch'
                  : activeTab === 'testimonials' ? 'Testimonial'
                    : 'Item'
        toast.success(`${itemName} deleted successfully!`)
        // Refresh data from server instead of updating local state
        await fetchCMSData();
      }
    } catch (error) {
      toast.error('Failed to delete item. Please try again.')
    }
    setLoading(false)
  }

  // Handle reorder carousel items
  const handleMoveUp = async (itemId) => {
    const items = cmsData.carousel?.carouselItems || []
    const currentIndex = items.findIndex(item => item.id === itemId)
    
    if (currentIndex <= 0) return

    const newItems = [...items]
    const temp = newItems[currentIndex]
    newItems[currentIndex] = newItems[currentIndex - 1]
    newItems[currentIndex - 1] = temp

    await handleReorder(newItems.map(item => item.id))
  }

  const handleMoveDown = async (itemId) => {
    const items = cmsData.carousel?.carouselItems || []
    const currentIndex = items.findIndex(item => item.id === itemId)
    
    if (currentIndex >= items.length - 1) return

    const newItems = [...items]
    const temp = newItems[currentIndex]
    newItems[currentIndex] = newItems[currentIndex + 1]
    newItems[currentIndex + 1] = temp

    await handleReorder(newItems.map(item => item.id))
  }

  const handleReorder = async (itemIds) => {
    setLoading(true)
    try {
      const result = await cmsAPI.reorderCarouselItems(itemIds)
      if (result && result.success) {
        toast.success('Carousel items reordered successfully!')
        await fetchCMSData()
      }
    } catch (error) {
      toast.error('Failed to reorder items. Please try again.')
    } finally {
      setLoading(false)
    }
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
                disableCrop={false}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Schedule 1 Image</label>
              <ImageUploader
                value={formData.schedule1Image || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, schedule1Image: url }))}
                buttonText="Upload schedule 1 image"
                bucketType="teacher"
                disableCrop={true}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Schedule 2 Image</label>
              <ImageUploader
                value={formData.schedule2Image || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, schedule2Image: url }))}
                buttonText="Upload schedule 2 image"
                bucketType="teacher"
                disableCrop={true}
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
                <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                <input
                  type="number"
                  name="monthlyPrice"
                  value={formData.monthlyPrice || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.monthlyPrice ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter monthly price"
                  min="0"
                  step="0.01"
                />
                {formErrors.monthlyPrice && <p className="mt-1 text-sm text-red-600">{formErrors.monthlyPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">One-time Price</label>
                <input
                  type="number"
                  name="yearlyPrice"
                  value={formData.yearlyPrice || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.yearlyPrice ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter one-time price"
                  min="0"
                  step="0.01"
                />
                {formErrors.yearlyPrice && <p className="mt-1 text-sm text-red-600">{formErrors.yearlyPrice}</p>}
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
                disableCrop={true}
                bucketType="course"
              />
            </div>
          </div>
        )

      case 'merchandise':
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
                placeholder="Enter merchandise title"
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
                minLength={10}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter merchandise description (minimum 10 characters)"
              />
              <div className="mt-1 flex items-center justify-between">
                {formErrors.description ? (
                  <p className="text-sm text-red-600">{formErrors.description}</p>
                ) : (
                  <p className="text-xs text-gray-500">Minimum 10 characters required</p>
                )}
                <p className={`text-xs ${(formData.description?.length || 0) < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {(formData.description?.length || 0)} / 10 characters
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock || ''}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category (e.g., Books, Apparel, etc.)"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Merchandise Image</label>
              <ImageUploader
                value={formData.image || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                buttonText="Upload merchandise image"
                disableCrop={true}
                bucketType="course"
              />
            </div>
          </div>
        )

      case 'offers':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Offer Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Special Discount, Limited Time Offer"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="offer"
                value={formData.offer || ''}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.offer ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Get 20% off on all courses this month"
              />
              {formErrors.offer && <p className="mt-1 text-sm text-red-600">{formErrors.offer}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount</label>
              <input
                type="text"
                name="discount"
                value={formData.discount || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 20% Off, Flat ₹500 Discount"
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

      case 'ongoingCourses':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Editing here only affects how this batch appears in the carousel. The actual batch/slot will not be modified.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Batch name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="offer"
                value={formData.offer || ''}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.offer ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Batch description"
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
              <label className="ml-2 block text-sm text-gray-900">Show in Carousel</label>
            </div>
          </div>
        )

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Student name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Class 10 Student, Parent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Testimonial *</label>
              <textarea
                name="quote"
                value={formData.quote || ''}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.quote ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Write testimonial..."
              />
              {formErrors.quote && <p className="mt-1 text-sm text-red-600">{formErrors.quote}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating || 5}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${formErrors.rating ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.rating && <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <ImageUploader
                value={formData.image || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                buttonText="Upload photo"
                bucketType="teacher"
                disableCrop={false}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render content based on active tab
  const renderContent = () => {
    // Safely get items with fallbacks
    const items = activeTab === 'carousel' ? (cmsData.carousel?.carouselItems || []) :
      activeTab === 'courses' ? (cmsData.courses?.courses || []) :
        activeTab === 'merchandise' ? (cmsData.merchandise?.merchandise || []) :
          activeTab === 'offers' ? (cmsData.offers?.offers || []) :
            activeTab === 'ongoingCourses' ? (cmsData.ongoingCourses?.ongoingCourses || []) :
              (cmsData.testimonials?.testimonials || [])

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
                  activeTab === 'merchandise' ? 'Merchandise' :
                    activeTab === 'offers' ? 'Manual Offers' :
                      activeTab === 'ongoingCourses' ? 'Ongoing Batches (Auto-Generated)' : 'Testimonials'}
            </h3>
            {activeTab !== 'ongoingCourses' && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New
              </button>
            )}
            {activeTab === 'ongoingCourses' && (
              <p className="text-xs text-gray-500">Auto-generated from active batches. Edit display or hide from carousel.</p>
            )}
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
                          <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                            {item.monthlyPrice && item.monthlyPrice > 0 && (
                              <span className="font-semibold text-blue-600">₹{item.monthlyPrice}/month</span>
                            )}
                            {item.yearlyPrice && item.yearlyPrice > 0 && (
                              <span className="font-semibold text-blue-600">₹{item.yearlyPrice} one-time</span>
                            )}
                            {(!item.monthlyPrice || item.monthlyPrice <= 0) && (!item.yearlyPrice || item.yearlyPrice <= 0) && item.price && item.price > 0 && (
                              <span className="font-semibold text-blue-600">₹{item.price}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'merchandise' && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-sm font-medium text-blue-600">₹{item.price}</span>
                            {item.stock !== undefined && (
                              <span className="text-sm text-gray-600">Stock: {item.stock}</span>
                            )}
                            {item.category && (
                              <span className="text-sm text-gray-600">Category: {item.category}</span>
                            )}
                          </div>
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
                          {item.discount && (
                            <p className="text-xs text-blue-600 mt-1">
                              Discount: {item.discount}
                            </p>
                          )}
                          {item.validUntil && <p className="text-xs text-gray-400 mt-1">Valid until: {new Date(item.validUntil).toLocaleDateString()}</p>}
                        </div>
                      )}

                      {activeTab === 'ongoingCourses' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 bg-gradient-to-r ${item.color || 'from-blue-500 to-blue-600'} rounded-lg flex items-center justify-center mr-3`}>
                                <span className="text-white font-bold text-sm">
                                  {(item.name || item.title)?.charAt(0) || 'O'}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-md font-medium text-gray-900">{item.name || item.title}</h4>
                                {item.subject && item.class && (
                                  <p className="text-xs text-gray-500">{item.subject} - Class {item.class}</p>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.offer || item.description}</p>
                          {item.instructor && (
                            <p className="text-xs text-blue-600 mt-1">Instructor: {item.instructor}</p>
                          )}
                          {item.availableSeats !== undefined && (
                            <p className={`text-xs mt-1 ${item.availableSeats < 10 ? 'text-red-600' : 'text-green-600'}`}>
                              Seats Available: {item.availableSeats} / {item.capacity}
                            </p>
                          )}
                          {item.slotId && (
                            <p className="text-xs text-gray-400 mt-1">
                              Batch ID: {item.slotId.substring(0, 8)}... (Auto-generated)
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === 'testimonials' && (
                        <div>
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-300 rounded-full mr-3 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-md font-medium text-gray-900">{item.name}</h4>
                              {item.role && <p className="text-xs text-gray-500">{item.role}</p>}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">“{item.quote}”</p>
                          {item.rating && (
                            <div className="mt-1 text-yellow-500 text-xs">{'★'.repeat(item.rating)}{'☆'.repeat(Math.max(0, 5 - item.rating))}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {/* Reorder buttons for carousel items */}
                      {activeTab === 'carousel' && !(item.title || item.subtitle) && (
                        <>
                          <button
                            onClick={() => handleMoveUp(item.id)}
                            disabled={items.findIndex(i => i.id === item.id) === 0}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveDown(item.id)}
                            disabled={items.findIndex(i => i.id === item.id) === items.length - 1}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </>
                      )}
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
            <option value="merchandise">Merchandise</option>
            <option value="offers">Manual Offers</option>
            <option value="ongoingCourses">Ongoing Batches</option>
            <option value="testimonials">Testimonials</option>
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
                onClick={() => setActiveTab('merchandise')}
                className={`${activeTab === 'merchandise'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Merchandise
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`${activeTab === 'offers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Manual Offers
              </button>
              <button
                onClick={() => setActiveTab('ongoingCourses')}
                className={`${activeTab === 'ongoingCourses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Ongoing Batches
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`${activeTab === 'testimonials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Testimonials
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
                      activeTab === 'merchandise' ? 'Merchandise Item' :
                        activeTab === 'offers' ? 'Offer' : 'Testimonial'}
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
                      activeTab === 'merchandise' ? 'Merchandise Item' :
                        activeTab === 'offers' ? 'Offer' :
                          activeTab === 'ongoingCourses' ? 'Ongoing Batch' : 'Testimonial'}
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