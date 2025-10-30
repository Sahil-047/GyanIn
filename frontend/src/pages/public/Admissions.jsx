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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header and Switcher */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admissions</h1>
              <p className="text-gray-600 mt-1">Choose an option below to proceed</p>
            </div>

            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setActiveView('admission')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeView === 'admission' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                New Admission
              </button>
              <button
                onClick={() => setActiveView('readmission')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-200 ${
                  activeView === 'readmission' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Readmission
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {activeView === 'admission' ? (
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Admission Contact Details</h2>
                  <p className="text-gray-600 mt-2">Reach out to us for admissions and inquiries</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <FaPhone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</h3>
                        <p className="text-lg font-bold text-gray-900 mb-2">{contactDetails.phone}</p>
                        <a href={`tel:${contactDetails.phone}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                          <FaPhone className="w-3.5 h-3.5 mr-2" />
                          Call Now
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                        <FaEnvelope className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</h3>
                        <p className="text-lg font-bold text-gray-900 mb-2 break-all">{contactDetails.email}</p>
                        <a href={`mailto:${contactDetails.email}`} className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm">
                          <FaEnvelope className="w-3.5 h-3.5 mr-2" />
                          Send Email
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                        <FaUserGraduate className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Admissions</h3>
                        <p className="text-lg font-bold text-gray-900 mb-2 break-all">{contactDetails.emailAdmissions}</p>
                        <a href={`mailto:${contactDetails.emailAdmissions}`} className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm">
                          <FaEnvelope className="w-3.5 h-3.5 mr-2" />
                          Email Admissions
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                        <FaWhatsapp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">WhatsApp</h3>
                        <p className="text-lg font-bold text-gray-900 mb-2">{contactDetails.whatsapp}</p>
                        <a href={`https://wa.me/${contactDetails.whatsapp.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                          <FaWhatsapp className="w-3.5 h-3.5 mr-2" />
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                        <FaMapMarkerAlt className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</h3>
                        <p className="text-gray-900">{contactDetails.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                        <FaClock className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Office Hours</h3>
                        <p className="text-gray-900">{contactDetails.officeHours}</p>
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


