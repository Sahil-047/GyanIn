import { useEffect, useState } from 'react'
import { cmsAPI } from '../../utils/api'

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState('schedule1') // 'schedule1' or 'schedule2'
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        // Bypass cache to get fresh data
        const response = await cmsAPI.getCMSSection('carousel', true)
        
        // Check multiple possible response structures
        let items = []
        if (response.success) {
          if (response.data?.data?.carouselItems) {
            items = response.data.data.carouselItems
          } else if (response.data?.carouselItems) {
            items = response.data.carouselItems
          } else if (response.carouselItems) {
            items = response.carouselItems
          }
        }
        
        if (items && items.length > 0) {
          // Transform carousel items to teacher format
          const teachersList = items.map((item) => {
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
              scheduleImage: teacher.scheduleImage || '', // Keep for backward compatibility
              schedule1Image: teacher.schedule1Image || '',
              schedule2Image: teacher.schedule2Image || ''
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

  const handleViewMore = (teacher, schedule = 'schedule1') => {
    setSelectedTeacher(teacher)
    setSelectedSchedule(schedule)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTeacher(null)
    setSelectedSchedule('schedule1')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Our Expert Teachers</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Meet the passionate educators dedicated to helping you achieve your learning goals
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 sm:p-4 text-center text-sm sm:text-base">
            {error}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 sm:p-8 text-center text-gray-500 shadow-lg text-sm sm:text-base">
            No teachers to display right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {teachers.map((t) => (
              <div 
                key={t._id} 
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                {/* Teacher Image Section */}
                <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity"></div>
                  <img
                    src={t.image || 'https://via.placeholder.com/400'}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">{t.name}</h3>
                    <p className="text-blue-200 text-sm sm:text-base font-medium">{t.subject || t.role || 'Instructor'}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 md:p-6">
                  {t.bio && (
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6 line-clamp-3 sm:line-clamp-4">
                      {t.bio}
                    </p>
                  )}

                  {(t.schedule1Image || t.schedule2Image || t.scheduleImage) && (
                    <button
                      onClick={() => handleViewMore(t, 'schedule1')}
                      className="w-full px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs sm:text-sm md:text-base font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Details Modal */}
      {showModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm sm:max-w-2xl md:max-w-4xl bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl mx-auto my-4">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Teacher Profile & Schedule</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors p-1 sm:p-2 hover:bg-white/20 rounded-lg"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
                  {/* Left Side - Teacher Info */}
                  <div className="w-full lg:w-1/3 flex flex-col items-center text-center">
                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <img
                        src={selectedTeacher.image || 'https://via.placeholder.com/300'}
                        alt={selectedTeacher.name}
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-2 sm:border-3 md:border-4 border-blue-200 shadow-xl object-cover"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                      {selectedTeacher.name}
                    </h3>
                    <p className="text-blue-600 text-sm sm:text-base md:text-lg font-semibold mb-4 sm:mb-5 md:mb-6">
                      {selectedTeacher.subject || selectedTeacher.role || 'Instructor'}
                    </p>
                    {selectedTeacher.bio && (
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                        {selectedTeacher.bio}
                      </p>
                    )}
                  </div>

                  {/* Right Side - Schedule Image */}
                  <div className="w-full lg:w-2/3">
                    {/* Schedule Selection Buttons */}
                    {(selectedTeacher.schedule1Image || selectedTeacher.schedule2Image) && (
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setSelectedSchedule('schedule1')}
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                            selectedSchedule === 'schedule1'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Schedule 1
                        </button>
                        <button
                          onClick={() => setSelectedSchedule('schedule2')}
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                            selectedSchedule === 'schedule2'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Schedule 2
                        </button>
                      </div>
                    )}

                    {/* Display Selected Schedule */}
                    {(() => {
                      const scheduleImage = selectedSchedule === 'schedule1' 
                        ? (selectedTeacher.schedule1Image || selectedTeacher.scheduleImage)
                        : selectedTeacher.schedule2Image;

                      return scheduleImage ? (
                        <div>
                          <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Schedule {selectedSchedule === 'schedule1' ? '1' : '2'}
                          </h4>
                          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border-2 border-gray-200">
                            <img
                              src={scheduleImage}
                              alt={`${selectedTeacher.name} Schedule ${selectedSchedule === 'schedule1' ? '1' : '2'}`}
                              className="w-full rounded-lg shadow-lg object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] bg-gray-50 rounded-lg sm:rounded-xl p-6 sm:p-8 border-2 border-dashed border-gray-300">
                          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm sm:text-base md:text-lg">No schedule available</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-4 sm:p-5 md:p-6 bg-gray-50 rounded-b-lg sm:rounded-b-xl md:rounded-b-2xl border-t">
                <button
                  onClick={closeModal}
                  className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-sm sm:text-base shadow-md hover:shadow-lg"
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


