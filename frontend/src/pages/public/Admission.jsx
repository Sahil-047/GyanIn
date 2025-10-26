import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp, FaPhone, FaEnvelope, FaUserGraduate, FaMapMarkerAlt, FaClock, FaTimes } from 'react-icons/fa'

const Admission = () => {
  const [showContactModal, setShowContactModal] = useState(true)

  const contactDetails = {
    phone: '+91 98765 43210',
    email: 'info@gyanin.com',
    emailAdmissions: 'admissions@gyanin.com',
    address: '123 Education Street, Learning City, LC 12345',
    officeHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    whatsapp: '+91 98765 43210'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Contact Details Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
              onClick={() => setShowContactModal(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 rounded-t-2xl">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2">Get in Touch with GyanIN</h2>
                  <p className="text-blue-100 text-lg">Connect with us for admissions and inquiries</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Phone */}
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaPhone className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone</h3>
                        <p className="text-xl font-bold text-gray-900 mb-2">{contactDetails.phone}</p>
                        <a href={`tel:${contactDetails.phone}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                          <FaPhone className="w-3.5 h-3.5 mr-2" />
                          Call Now
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaEnvelope className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</h3>
                        <p className="text-xl font-bold text-gray-900 mb-2 break-all">{contactDetails.email}</p>
                        <a href={`mailto:${contactDetails.email}`} className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm transition-colors">
                          <FaEnvelope className="w-3.5 h-3.5 mr-2" />
                          Send Email
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Admissions Email */}
                  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaUserGraduate className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admissions</h3>
                        <p className="text-xl font-bold text-gray-900 mb-2 break-all">{contactDetails.emailAdmissions}</p>
                        <a href={`mailto:${contactDetails.emailAdmissions}`} className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors">
                          <FaEnvelope className="w-3.5 h-3.5 mr-2" />
                          Email Admissions
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaWhatsapp className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">WhatsApp</h3>
                        <p className="text-xl font-bold text-gray-900 mb-2">{contactDetails.whatsapp}</p>
                        <a href={`https://wa.me/${contactDetails.whatsapp.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors">
                          <FaWhatsapp className="w-3.5 h-3.5 mr-2" />
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address and Office Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                        <FaMapMarkerAlt className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address</h3>
                        <p className="text-gray-900 leading-relaxed">{contactDetails.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaClock className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Office Hours</h3>
                        <p className="text-gray-900">{contactDetails.officeHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-b-2xl border-t">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Admission Information
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Click the button below to view our contact details
            </p>
          </div>

          <button
            onClick={() => setShowContactModal(true)}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaEnvelope className="w-6 h-6 mr-3" />
            View Contact Details
          </button>

          <div className="mt-12">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admission
