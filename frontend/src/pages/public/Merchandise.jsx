import { useEffect, useState } from 'react'

const Merchandise = () => {
  const [merchandise, setMerchandise] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading merchandise data
    const fetchMerchandise = async () => {
      try {
        setLoading(true)
        // Mock merchandise data - Replace with actual API call
        const mockMerchandise = [
          {
            id: 1,
            name: 'GyanIN T-Shirt',
            description: 'Premium quality cotton t-shirt with GyanIN branding',
            price: 299,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
            category: 'Apparel'
          },
          {
            id: 2,
            name: 'Study Planner Notebook',
            description: 'Aesthetic planner to organize your study schedule',
            price: 149,
            image: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=500&q=80',
            category: 'Stationery'
          },
          {
            id: 3,
            name: 'GyanIN Mug',
            description: 'Keep your motivation hot with this inspiring mug',
            price: 199,
            image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
            category: 'Accessories'
          },
          {
            id: 4,
            name: 'Premium Pen Set',
            description: 'Professional pen set for exams and notes',
            price: 249,
            image: 'https://images.unsplash.com/photo-1583484953889-a8b38fe6a4d7?w=500&q=80',
            category: 'Stationery'
          },
          {
            id: 5,
            name: 'Backpack',
            description: 'Durable backpack perfect for students',
            price: 899,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
            category: 'Accessories'
          },
          {
            id: 6,
            name: 'Hoodie',
            description: 'Comfortable hoodie with GyanIN logo',
            price: 599,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80',
            category: 'Apparel'
          }
        ]
        
        setMerchandise(mockMerchandise)
      } catch (e) {
        console.error('Failed to load merchandise:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchMerchandise()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">GyanIN Merchandise</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Show your GyanIN pride with our exclusive merchandise collection
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600" />
          </div>
        ) : merchandise.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 sm:p-8 text-center text-gray-500 shadow-lg text-sm sm:text-base">
            No merchandise available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {merchandise.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                {/* Product Image Section */}
                <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity"></div>
                  <img
                    src={item.image || 'https://via.placeholder.com/400'}
                    alt={item.name}
                    className="w-full h-full object-cover p-4"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
                    <span className="text-xs font-semibold text-gray-700">{item.category}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 md:mb-6 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-bold text-blue-600">₹{item.price}</span>
                    </div>
                    <button className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs sm:text-sm md:text-base font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Add to Cart
                    </button>
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

export default Merchandise

