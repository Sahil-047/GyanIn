// ✅ Import API config
import API_CONFIG from '../config'

// ✅ Ensure base URL is exactly: https://api.gyanin.academy/api
const API_BASE = API_CONFIG.baseURL
  ? `${API_CONFIG.baseURL}/api/admin`          // ✅ becomes: https://api.gyanin.academy/api/admin
  : '/api/admin'                               // ✅ local development

// ✅ Generic API caller
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      const error = new Error(data.message || 'API call failed')
      error.status = response.status
      error.data = data
      if (data.errors) {
        error.errors = data.errors
      }
      throw error
    }
    
    return data
  } catch (error) {
    throw error
  }
}

// Readmissions API
export const readmissionsAPI = {
  // Get all readmissions with filters
  getReadmissions: (params = {}) => {
    const queryParams = new URLSearchParams(params)
    return apiCall(`/readmissions?${queryParams}`)
  },

  // Get single readmission
  getReadmission: (id) => apiCall(`/readmissions/${id}`),

  // Create new readmission
  createReadmission: (data) => apiCall('/readmissions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update readmission
  updateReadmission: (id, data) => apiCall(`/readmissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Update readmission status
  updateReadmissionStatus: (id, status, notes = '') => apiCall(`/readmissions/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  }),

  // Delete readmission
  deleteReadmission: (id) => apiCall(`/readmissions/${id}`, {
    method: 'DELETE'
  }),

  // Get readmission statistics
  getStats: () => apiCall('/readmissions/stats')
}

// Slots API
export const slotsAPI = {
  // Get all slots
  getSlots: (params = {}) => {
    const queryParams = new URLSearchParams(params)
    return apiCall(`/slots?${queryParams}`)
  },

  // Get single slot
  getSlot: (id) => apiCall(`/slots/${id}`),

  // Create new slot
  createSlot: (data) => apiCall('/slots', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update slot
  updateSlot: (id, data) => apiCall(`/slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Toggle slot status
  toggleSlot: (id) => apiCall(`/slots/${id}/toggle`, {
    method: 'PUT'
  }),

  // Update enrolled students
  updateEnrolledStudents: (id, enrolledStudents) => apiCall(`/slots/${id}/enroll`, {
    method: 'PUT',
    body: JSON.stringify({ enrolledStudents })
  }),

  // Delete slot
  deleteSlot: (id) => apiCall(`/slots/${id}`, {
    method: 'DELETE'
  }),

  // Get slot statistics
  getStats: () => apiCall('/slots/stats')
}

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics and recent data
  getDashboardData: () => apiCall('/dashboard')
}

// CMS API
export const cmsAPI = {
  // Get all CMS content
  getCMSContent: (params = {}) => {
    const queryParams = new URLSearchParams(params)
    return apiCall(`/cms?${queryParams}`)
  },

  // Get specific section content
  getCMSSection: (section) => apiCall(`/cms/${section}`),

  // Create or update CMS content
  saveCMSContent: (section, data) => apiCall('/cms', {
    method: 'POST',
    body: JSON.stringify({ section, data })
  }),

  // Update specific CMS content
  updateCMSContent: (id, data) => apiCall(`/cms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Toggle CMS content status
  toggleCMSContent: (id) => apiCall(`/cms/${id}/toggle`, {
    method: 'PUT'
  }),

  // Delete CMS content
  deleteCMSContent: (id) => apiCall(`/cms/${id}`, {
    method: 'DELETE'
  }),

  // Add course to CMS
  addCourse: (courseData) => apiCall('/cms/courses', {
    method: 'POST',
    body: JSON.stringify(courseData)
  }),

  // Add carousel item to CMS
  addCarouselItem: (carouselData) => apiCall('/cms/carousel', {
    method: 'POST',
    body: JSON.stringify(carouselData)
  }),

  // Update carousel item in CMS
  updateCarouselItem: (carouselId, carouselData) => apiCall(`/cms/carousel/${carouselId}`, {
    method: 'PUT',
    body: JSON.stringify(carouselData)
  }),

  // Add offer to CMS
  addOffer: (offerData) => apiCall('/cms/offers', {
    method: 'POST',
    body: JSON.stringify(offerData)
  }),

  // Update offer in CMS
  updateOffer: (offerId, offerData) => apiCall(`/cms/offers/${offerId}`, {
    method: 'PUT',
    body: JSON.stringify(offerData)
  }),

  // Delete offer from CMS
  deleteOffer: (offerId) => apiCall(`/cms/offers/${offerId}`, {
    method: 'DELETE'
  }),

  // Delete carousel item from CMS
  deleteCarouselItem: (carouselId) => apiCall(`/cms/carousel/${carouselId}`, {
    method: 'DELETE'
  }),

  // Testimonials
  addTestimonial: (data) => apiCall('/cms/testimonials', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTestimonial: (id, data) => apiCall(`/cms/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTestimonial: (id) => apiCall(`/cms/testimonials/${id}`, {
    method: 'DELETE'
  }),

  // Ongoing Batches (auto-generated from batches)
  updateOngoingCourse: (id, data) => apiCall(`/cms/ongoingCourses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteOngoingCourse: (id) => apiCall(`/cms/ongoingCourses/${id}`, {
    method: 'DELETE'
  })
}

// ✅ Uploads API URL
const UPLOADS_BASE = API_CONFIG.baseURL
  ? `${API_CONFIG.baseURL}/api/uploads`        // ✅ https://api.gyanin.academy/api/uploads
  : '/api/uploads'

export const uploadsAPI = {
  uploadImage: async (file, type = 'teacher') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type) // 'teacher' or 'course'

    const response = await fetch(`${UPLOADS_BASE}/image`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    if (!response.ok) {
      const error = new Error(data.message || 'Upload failed')
      error.status = response.status
      error.data = data
      throw error
    }
    return data
  }
}

// ✅ Public API (no extra /api)
const PUBLIC_API_BASE = API_CONFIG.baseURL
  ? `${API_CONFIG.baseURL}/api`            
  : '/api'

// ✅ Public API Caller
const publicApiCall = async (endpoint, options = {}) => {
  const url = `${PUBLIC_API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      const error = new Error(data.message || 'API failed')
      error.status = response.status
      error.data = data
      throw error
    }
    
    return data
  } catch (error) {
    throw error
  }
}

export const coursesAPI = {
  // Get all courses
  getCourses: (params = {}) => {
    const queryParams = new URLSearchParams(params)
    return publicApiCall(`/courses?${queryParams}`)
  },

  // Get single course
  getCourse: (id) => publicApiCall(`/courses/${id}`),

  // Get all categories
  getCategories: () => publicApiCall('/courses/categories'),

  // Create new course
  createCourse: (courseData) => publicApiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData)
  }),

  // Update course
  updateCourse: (id, courseData) => publicApiCall(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData)
  }),

  // Delete course
  deleteCourse: (id) => publicApiCall(`/courses/${id}`, {
    method: 'DELETE'
  })
}

export const merchandiseAPI = {
  // Get all merchandise
  getMerchandise: (params = {}) => {
    const queryParams = new URLSearchParams(params)
    return publicApiCall(`/merchandise?${queryParams}`)
  },

  // Get single merchandise item
  getMerchandiseItem: (id) => publicApiCall(`/merchandise/${id}`),

  // Get all categories
  getCategories: () => publicApiCall('/merchandise/categories'),

  // Create new merchandise
  createMerchandise: (merchandiseData) => publicApiCall('/merchandise', {
    method: 'POST',
    body: JSON.stringify(merchandiseData)
  }),

  // Update merchandise
  updateMerchandise: (id, merchandiseData) => publicApiCall(`/merchandise/${id}`, {
    method: 'PUT',
    body: JSON.stringify(merchandiseData)
  }),

  // Delete merchandise
  deleteMerchandise: (id) => publicApiCall(`/merchandise/${id}`, {
    method: 'DELETE'
  })
}

// Public Readmissions API (for students to submit applications)
export const publicReadmissionsAPI = {
  // Submit a readmission application
  submitReadmission: (data) => publicApiCall('/public/readmissions', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Public Slots API (for students to view available slots)
export const publicSlotsAPI = {
  // Get all active slots
  getActiveSlots: (params = {}) => {
    const queryParams = new URLSearchParams(params)
    return publicApiCall(`/public/slots?${queryParams}`)
  },

  // Get single slot
  getSlot: (id) => publicApiCall(`/public/slots/${id}`)
}

// Contact API (for contact form submissions)
export const contactAPI = {
  // Submit contact form
  submitContact: (data) => publicApiCall('/contact', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Export publicApiCall for direct use in components
export { publicApiCall }

export default {
  readmissionsAPI,
  slotsAPI,
  dashboardAPI,
  cmsAPI,
  coursesAPI,
  merchandiseAPI,
  uploadsAPI,
  publicReadmissionsAPI,
  publicSlotsAPI,
  contactAPI
}
