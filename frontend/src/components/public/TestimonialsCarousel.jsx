import { useEffect, useState } from 'react'
import { cmsAPI } from '../../utils/api'

const TestimonialsCarousel = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await cmsAPI.getCMSSection('testimonials')
        const testimonials = res?.data?.data?.testimonials || []
        if (mounted) setItems(testimonials.filter(t => t.isActive !== false))
      } catch (e) {
        setItems([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // No controls/auto-advance needed for card layout; keep state for potential future use

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-6 flex justify-center items-center min-h-[220px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!items.length) return null

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t, i) => (
          <div key={t.id || i} className="relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
            {/* Image */}
            <div className="h-64">
              {t.image ? (
                <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                  {t.name?.charAt(0) || 'T'}
                </div>
              )}
            </div>
            {/* Corner arrow icon */}
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/70 backdrop-blur flex items-center justify-center border border-white/60">
              <svg className="w-4 h-4 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            {/* Bottom glass panel */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="px-5 py-4 bg-white/70 backdrop-blur-md">
                {/* Stars */}
                <div className="flex items-center gap-1 text-[#F59E0B] mb-2">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} className={`w-4 h-4 ${s < (t.rating || 5) ? 'fill-current' : 'fill-transparent stroke-current'}`} viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192z" />
                    </svg>
                  ))}
                </div>
                {/* Name & role */}
                <div className="text-white/0">
                  {/* hidden anchor for glass gradient spacing */}
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">{t.name}</h4>
                {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                {/* Quote truncated */}
                {t.quote && (
                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">{t.quote}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestimonialsCarousel

