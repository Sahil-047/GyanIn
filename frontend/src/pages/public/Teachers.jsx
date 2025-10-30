import { useEffect, useState } from 'react'
import { publicApiCall } from '../../utils/api'

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const res = await publicApiCall('/teachers')
        if (res.success) {
          setTeachers(res.data || [])
        } else {
          setError(res.message || 'Failed to load teachers')
        }
      } catch (e) {
        setError('Failed to load teachers')
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Our Teachers</h1>
          <p className="text-gray-600 mt-2">Meet the experts who lead our courses</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-center">
            {error}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">No teachers to display right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div key={t._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow border">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={t.image || 'https://via.placeholder.com/96'}
                      alt={t.name}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>
                      <p className="text-sm text-blue-700 font-medium">{t.subject || t.role || 'Instructor'}</p>
                    </div>
                  </div>
                  {t.bio && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-3">{t.bio}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.isArray(t.specializations) && t.specializations.slice(0, 4).map((sp, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-100">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Teachers


