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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-4xl font-bold text-[#0061FF]">
              GyanIN
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-3 py-2 text-md font-medium ${
                isActive('/') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/courses"
              className={`inline-flex items-center px-3 py-2 text-md font-medium ${
                isActive('/courses') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Courses
            </Link>
            <Link
              to="/teachers"
              className={`inline-flex items-center px-3 py-2 text-md font-medium ${
                isActive('/teachers') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Teachers
            </Link>
            <Link
              to="/admissions"
              className={`inline-flex items-center px-3 py-2 text-md font-medium ${
                isActive('/admissions') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Admissions
            </Link>
            <Link
              to="/contact"
              className={`inline-flex items-center px-3 py-2 text-md font-medium ${
                isActive('/contact') 
                  ? 'text-[#0061FF]' 
                  : 'text-gray-500 hover:text-[#0061FF]'
              }`}
            >
              Contact Us
            </Link>
          </div>

          {/* Right side buttons and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-[#0061FF] border border-[#0061FF] rounded-md hover:bg-blue-50"
              >
                Log In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/') 
                ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-[#0061FF]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/courses"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/courses') 
                ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-[#0061FF]'
            }`}
          >
            Courses
          </Link>
          <Link
            to="/teachers"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/teachers') 
                ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-[#0061FF]'
            }`}
          >
            Teachers
          </Link>
          <Link
            to="/admissions"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/admissions') 
                ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-[#0061FF]'
            }`}
          >
            Admissions
          </Link>
          <Link
            to="/contact"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/contact') 
                ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-[#0061FF]'
            }`}
          >
            Contact Us
          </Link>
          <Link
            to="/login"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/login') 
                ? 'border-[#0061FF] text-[#0061FF] bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-[#0061FF]'
            }`}
          >
            Log In
          </Link>
          
        </div>
      </div>
    </nav>
  )
}

export default Navbar