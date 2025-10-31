import { useEffect, useState } from 'react'
import { cmsAPI } from '../../utils/api'

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const response = await cmsAPI.getCMSSection('carousel')
        if (response.success && response.data.data.carouselItems) {
          // Transform carousel items to teacher format
          const teachersList = response.data.data.carouselItems.map((item) => {
            const teacher = item.teacher || {}
            return {
              _id: item.id || item._id,
              id: item.id,
              name: teacher.name || item.title || item.subtitle || 'Teacher',
              description: teacher.description || item.description || '',
              bio: teacher.description || item.description || '',
              image: teacher.image || item.image || 'https://via.placeholder.com/96',
              role: teacher.role || 'Instructor',
              subject: teacher.subject || teacher.role || 'Instructor',
              scheduleImage: teacher.scheduleImage || ''
            }
          })
          setTeachers(teachersList)
        } else {
          setTeachers([])
        }
      } catch (e) {
        setError('Failed to load teachers')
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  const handleViewMore = (teacher) => {
    setSelectedTeacher(teacher)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTeacher(null)
  }

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && showModal) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [showModal])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Expert Teachers</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the passionate educators dedicated to helping you achieve your learning goals
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-center">
            {error}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-500 shadow-lg">
            No teachers to display right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((t) => (
              <div 
                key={t._id} 
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                {/* Teacher Image Section */}
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity"></div>
                  <img
                    src={t.image || 'https://via.placeholder.com/400'}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-2xl font-bold text-white mb-1">{t.name}</h3>
                    <p className="text-blue-200 font-medium">{t.subject || t.role || 'Instructor'}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {t.bio && (
                    <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4">
                      {t.bio}
                    </p>
                  )}

                  <button
                    onClick={() => handleViewMore(t)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Details Modal */}
      {showModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
                <h2 className="text-2xl font-bold">Teacher Profile & Schedule</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Side - Teacher Info */}
                  <div className="lg:w-1/3 flex flex-col items-center text-center">
                    <div className="mb-6">
                      <img
                        src={selectedTeacher.image || 'https://via.placeholder.com/300'}
                        alt={selectedTeacher.name}
                        className="w-48 h-48 rounded-full border-4 border-blue-200 shadow-xl object-cover"
                      />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedTeacher.name}
                    </h3>
                    <p className="text-blue-600 text-lg font-semibold mb-6">
                      {selectedTeacher.subject || selectedTeacher.role || 'Instructor'}
                    </p>
                    {selectedTeacher.bio && (
                      <p className="text-gray-700 leading-relaxed">
                        {selectedTeacher.bio}
                      </p>
                    )}
                  </div>

                  {/* Right Side - Schedule Image */}
                  <div className="lg:w-2/3">
                    {selectedTeacher.scheduleImage ? (
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Schedule
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                          <img
                            src={selectedTeacher.scheduleImage}
                            alt={`${selectedTeacher.name} Schedule`}
                            className="w-full rounded-lg shadow-lg object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No schedule available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-6 bg-gray-50 rounded-b-2xl border-t">
                <button
                  onClick={closeModal}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Teachers


