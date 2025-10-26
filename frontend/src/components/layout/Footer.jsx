import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Courses</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/courses" className="text-base text-gray-500 hover:text-gray-900">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/readmissions" className="text-base text-gray-500 hover:text-gray-900">
                  Readmissions
                </Link>
              </li>
              <li>
                <Link to="/admission" className="text-base text-gray-500 hover:text-gray-900">
                  Admission
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900 flex items-center justify-center md:justify-end">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} GyanIN Learning Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer