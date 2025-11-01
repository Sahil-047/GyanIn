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
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">Admission Contact Details</h2>
                  <p className="text-gray-600 text-sm sm:text-base mt-2">Reach out to us for admissions and inquiries</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FaPhone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</h3>
                        <p className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-all">{contactDetails.phone}</p>
                        <a href={`tel:${contactDetails.phone}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm">
                          <FaPhone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                          Call Now
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-green-200">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FaEnvelope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</h3>
                        <p className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-all">{contactDetails.email}</p>
                        <a href={`mailto:${contactDetails.email}`} className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm">
                          <FaEnvelope className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                          Send Email
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FaUserGraduate className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Admissions</h3>
                        <p className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-all">{contactDetails.emailAdmissions}</p>
                        <a href={`mailto:${contactDetails.emailAdmissions}`} className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-xs sm:text-sm">
                          <FaEnvelope className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                          Email Admissions
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-emerald-200">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">WhatsApp</h3>
                        <p className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-all">{contactDetails.whatsapp}</p>
                        <a href={`https://wa.me/${contactDetails.whatsapp.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-xs sm:text-sm">
                          <FaWhatsapp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FaMapMarkerAlt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</h3>
                        <p className="text-sm sm:text-base text-gray-900">{contactDetails.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FaClock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Office Hours</h3>
                        <p className="text-sm sm:text-base text-gray-900">{contactDetails.officeHours}</p>
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


