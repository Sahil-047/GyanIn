import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0061FF]">
              GyanIN
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/courses"
              className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors ${
                isActive('/courses') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              All Courses
            </Link>
            <Link
              to="/teachers"
              className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors ${
                isActive('/teachers') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Teachers
            </Link>
            <Link
              to="/merchandise"
              className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors ${
                isActive('/merchandise') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Merchandise
            </Link>
            <Link
              to="/admissions"
              className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors ${
                isActive('/admissions') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Admissions
            </Link>
            <Link
              to="/contact"
              className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Contact Us
            </Link>
          </div>

          {/* Right side buttons and mobile menu button */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <Link
                to="/login"
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-[#0061FF] border border-[#0061FF] rounded-md hover:bg-blue-50 transition-colors"
              >
                Log In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'top-2.5 rotate-45' : 'top-0 rotate-0'
                  }`}
                ></span>
                <span
                  className={`absolute left-0 top-2.5 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                ></span>
                <span
                  className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'top-2.5 -rotate-45' : 'top-5 rotate-0'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1 px-2">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={`block pl-3 pr-4 py-2.5 sm:py-3 border-l-4 text-base font-medium transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } ${isActive('/') 
              ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-[#0061FF] hover:bg-gray-50'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.05s' : '0s' }}
          >
            Home
          </Link>
          
          <Link
            to="/courses"
            onClick={() => setIsMenuOpen(false)}
            className={`block pl-3 pr-4 py-2.5 sm:py-3 border-l-4 text-base font-medium transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } ${isActive('/courses') 
              ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-[#0061FF] hover:bg-gray-50'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.1s' : '0s' }}
          >
            All Courses
          </Link>
          <Link
            to="/teachers"
            onClick={() => setIsMenuOpen(false)}
            className={`block pl-3 pr-4 py-2.5 sm:py-3 border-l-4 text-base font-medium transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } ${isActive('/teachers') 
              ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-[#0061FF] hover:bg-gray-50'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.15s' : '0s' }}
          >
            Teachers
          </Link>
          <Link
            to="/merchandise"
            onClick={() => setIsMenuOpen(false)}
            className={`block pl-3 pr-4 py-2.5 sm:py-3 border-l-4 text-base font-medium transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } ${isActive('/merchandise') 
              ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-[#0061FF] hover:bg-gray-50'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.2s' : '0s' }}
          >
            Merchandise
          </Link>
          <Link
            to="/admissions"
            onClick={() => setIsMenuOpen(false)}
            className={`block pl-3 pr-4 py-2.5 sm:py-3 border-l-4 text-base font-medium transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } ${isActive('/admissions') 
              ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-[#0061FF] hover:bg-gray-50'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.25s' : '0s' }}
          >
            Admissions
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className={`block pl-3 pr-4 py-2.5 sm:py-3 border-l-4 text-base font-medium transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } ${isActive('/contact') 
              ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-[#0061FF] hover:bg-gray-50'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.3s' : '0s' }}
          >
            Contact Us
          </Link>
          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className={`block pl-3 pr-4 py-2.5 sm:py-3 border-l-4 text-base font-medium transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } ${isActive('/login') 
              ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-[#0061FF] hover:bg-gray-50'
            }`}
            style={{ transitionDelay: isMenuOpen ? '0.3s' : '0s' }}
          >
            Log In
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar