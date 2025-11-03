import { useState } from 'react'
import ReadmissionsPublic from './Readmissions'
import { FaEnvelope, FaPhone, FaWhatsapp, FaUserGraduate, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

const Admissions = ({ defaultView = 'admission' }) => {
  const [activeView, setActiveView] = useState(defaultView)

  const contactDetails = {
    phone: '+91 98765 43210',
    email: 'info@gyanin.com',
    emailAdmissions: 'admissions@gyanin.com',
    address: '123 Education Street, Learning City, LC 12345',
    officeHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    whatsapp: '+91 98765 43210'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Header and Switcher */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-md rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admissions</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Choose an option below to proceed</p>
            </div>

            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden w-full md:w-auto">
              <button
                onClick={() => setActiveView('admission')}
                className={`flex-1 md:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                  activeView === 'admission' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                New Admission
              </button>
              <button
                onClick={() => setActiveView('readmission')}
                className={`flex-1 md:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border-l border-gray-200 transition-colors ${
                  activeView === 'readmission' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Readmission
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow-xl rounded-lg sm:rounded-xl overflow-hidden">
          {activeView === 'admission' ? (
            <div className="p-6 sm:p-8 md:p-10">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Get in Touch</h2>
                  <p className="text-gray-600 text-base sm:text-lg">Choose your preferred method to connect with our admissions team</p>
                </div>

                {/* Primary Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="group bg-white border-2 border-blue-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FaPhone className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone</h3>
                        <p className="text-xl font-bold text-gray-900 break-all mb-3">{contactDetails.phone}</p>
                        <a href={`tel:${contactDetails.phone}`} className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                          <FaPhone className="w-4 h-4 mr-2" />
                          Call Now
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white border-2 border-green-100 rounded-2xl p-6 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FaWhatsapp className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">WhatsApp</h3>
                        <p className="text-xl font-bold text-gray-900 break-all mb-3">{contactDetails.whatsapp}</p>
                        <a href={`https://wa.me/${contactDetails.whatsapp.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors">
                          <FaWhatsapp className="w-4 h-4 mr-2" />
                          Chat Now
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white border-2 border-purple-100 rounded-2xl p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FaEnvelope className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">General Email</h3>
                        <p className="text-lg font-bold text-gray-900 break-all mb-3">{contactDetails.email}</p>
                        <a href={`mailto:${contactDetails.email}`} className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                          <FaEnvelope className="w-4 h-4 mr-2" />
                          Send Email
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white border-2 border-indigo-100 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FaUserGraduate className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Admissions</h3>
                        <p className="text-lg font-bold text-gray-900 break-all mb-3">{contactDetails.emailAdmissions}</p>
                        <a href={`mailto:${contactDetails.emailAdmissions}`} className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                          <FaEnvelope className="w-4 h-4 mr-2" />
                          Contact Admissions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-0">
              <ReadmissionsPublic />
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}

export default Admissions


