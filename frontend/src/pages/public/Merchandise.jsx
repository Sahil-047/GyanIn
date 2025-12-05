import { useEffect, useState } from 'react'
import { merchandiseAPI } from '../../utils/api'
import toast from 'react-hot-toast'

const MERCH_FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSf8TbkqfVMJlnHa7yVdui89FY3zKLphZzCSNNfpsHIeFsZ9Qw/viewform?usp=header'

const Merchandise = () => {
  const [merchandise, setMerchandise] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMerchandise = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await merchandiseAPI.getMerchandise({ limit: 100 })

        if (response.success) {
          const items = response.data || []
          setMerchandise(items)

          // Extract unique categories
          const uniqueCategories = ['all', ...new Set(items.map(item => item.category).filter(cat => cat && cat.trim()))]
          setCategories(uniqueCategories.map((cat, index) => ({
            id: cat,
            name: index === 0 ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')
          })))
        } else {
          setError('Failed to load merchandise')
        }
      } catch (e) {
        toast.error('Failed to load merchandise. Please try again later.')
        setError('Failed to load merchandise. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchMerchandise()
  }, [])

  const filteredMerchandise = merchandise.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Gyanin Merchandise
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              Show your Gyanin pride with our exclusive merchandise collection. Quality products designed for learners like you.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {categories.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="mb-6 sm:mb-8">
            <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Filter by Category</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.filter(category => category.id && category.name).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${selectedCategory === category.id
                      ? 'bg-[#0061FF] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-2 sm:mb-3">
            <p className="text-sm sm:text-base text-gray-600">
              Showing {filteredMerchandise.length} item{filteredMerchandise.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-4 sm:pb-6 md:pb-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#0061FF]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 sm:py-16 md:py-20 px-4">
            <p className="text-red-600 text-base sm:text-lg">{error}</p>
          </div>
        )}

        {/* Merchandise Grid */}
        {!loading && !error && (
          <>
            {filteredMerchandise.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-20 px-4">
                <p className="text-gray-600 text-base sm:text-lg">No merchandise available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {filteredMerchandise.map((item) => {
                  const isOutOfStock = item.stock !== undefined && item.stock <= 0

                  return (
                  <div
                    key={item._id || item.id}
                    className="bg-gray-100 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-white flex items-center justify-center p-4">
                      <img
                        src={item.image || 'https://via.placeholder.com/400'}
                        alt={item.title || 'Merchandise item'}
                        className="w-full h-full object-contain"
                      />
                      {item.category && (
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-2.5 md:left-2.5">
                          <span className="bg-white px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-bold shadow-md">
                            {item.category}
                          </span>
                        </div>
                      )}
                      {item.stock !== undefined && item.stock <= 0 && (
                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-2.5 md:right-2.5">
                          <span className="bg-red-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-bold shadow-md">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Content */}
                    <div className="p-3 sm:p-4 md:p-5">
                      {/* Price */}
                      <div className="flex justify-end mb-1.5">
                        <span className="text-[#0061FF] text-lg sm:text-xl md:text-2xl font-bold">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 line-clamp-2">{item.title}</h3>

                      {/* Description */}
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-2.5 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Stock Info */}
                      {item.stock !== undefined && (
                        <div className="flex items-center mb-2 sm:mb-2.5 text-xs sm:text-sm text-gray-500">
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          <span className={`font-medium ${item.stock <= 0 ? 'text-red-600' : item.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                            {item.stock <= 0 ? 'Out of Stock' : `${item.stock} ${item.stock === 1 ? 'item' : 'items'} available`}
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="w-full py-2 sm:py-2.5 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#0061FF] text-xs sm:text-sm"
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <a
                          href={MERCH_FORM_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex justify-center py-2 sm:py-2.5 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-colors duration-200 text-xs sm:text-sm"
                        >
                          Buy Now
                        </a>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Merchandise

