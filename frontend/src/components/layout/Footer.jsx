import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 tracking-wider uppercase">Courses</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 md:space-y-4">
              <li>
                <Link to="/courses" className="text-sm sm:text-base text-gray-500 hover:text-gray-900 transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/readmissions" className="text-sm sm:text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Readmissions
                </Link>
              </li>
              <li>
                <Link to="/admission" className="text-sm sm:text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Admission
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center sm:text-left lg:text-center">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 md:space-y-4">
              <li>
                <Link to="/contact" className="text-sm sm:text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center sm:text-right col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 md:space-y-4">
              <li>
                <a 
                  href="https://www.facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm sm:text-base text-gray-500 hover:text-gray-900 flex items-center justify-center sm:justify-end transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm md:text-base text-gray-400 text-center">
            © {new Date().getFullYear()} GyanIN Learning Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer