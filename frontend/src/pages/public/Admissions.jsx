import { useState } from 'react'
import ReadmissionsPublic from './Readmissions'
import { FaEnvelope, FaPhone, FaWhatsapp, FaUserGraduate, FaMapMarkerAlt, FaClock, FaMobileAlt, FaCheckCircle, FaWpforms } from 'react-icons/fa'

const Admissions = ({ defaultView = 'admission' }) => {
  const [activeView, setActiveView] = useState(defaultView)

  const contactDetails = {
    phone: '+91 83340 06669',
    email: 'info@gyanin.com',
    emailAdmissions: 'admissions@gyanin.com',
    address: '8, 2, Mandeville Gardens, Ekdalia, Ballygunge, Kolkata, West Bengal 700019',
    officeHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    whatsapp: '+91 83340 06669',
    appLink: 'https://clp.page.link/w3Xw',
    mapLink: 'https://maps.app.goo.gl/rUkr5az2oH69Cty17'
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
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Admission Process</h2>
                  <p className="text-gray-600 text-base sm:text-lg">Follow these simple steps to complete your admission</p>
                </div>

                {/* Steps Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Row 1 */}
                      <tr className="hover:bg-blue-50/40">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">1</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">App Registration <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 align-middle">Mandatory</span></td>
                        <td className="px-4 sm:px-6 py-4 text-gray-900 font-bold">Registration in our official app GyanIn is mandatory as a Student</td>
                        <td className="px-4 sm:px-6 py-4">
                          <a href={contactDetails.appLink} className="inline-flex items-center justify-center hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer" title="Open GyanIN App">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="#4285F4">
                              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.28,14.5L14.54,11.75L17.28,9L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                            </svg>
                          </a>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-green-50/40">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold">2</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">Contact Us</td>
                        <td className="px-4 sm:px-6 py-4 text-gray-700">Reach out via WhatsApp for admissions inquiry</td>
                        <td className="px-4 sm:px-6 py-4 space-x-3 whitespace-nowrap">
                          <a href={`https://wa.me/${contactDetails.whatsapp.replace(/\D+/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity" title="WhatsApp">
                            <FaWhatsapp className="w-10 h-10 text-[#25D366]" />
                          </a>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="hover:bg-purple-50/40">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold">3</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">Email Admissions</td>
                        <td className="px-4 sm:px-6 py-4 text-gray-700">Send your admission inquiry or application via email</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <a href={`mailto:${contactDetails.emailAdmissions}`} className="inline-flex items-center justify-center hover:opacity-80 transition-opacity" title="Send Email">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="#9C27B0">
                              <path d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M20,8L12,13L4,8V6L12,11L20,6M20,18H4V8L12,13L20,8V18Z"/>
                            </svg>
                          </a>
                        </td>
                      </tr>

                      {/* Row 4 */}
                      <tr className="hover:bg-indigo-50/40">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold">4</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">Visit Our Office</td>
                        <td className="px-4 sm:px-6 py-4 text-gray-700">
                          <div className="text-sm">{contactDetails.address}</div>
                          <div className="text-sm text-gray-500">{contactDetails.officeHours}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <a href={contactDetails.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity" title="Locate on Map">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="#6366F1">
                              <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                            </svg>
                          </a>
                        </td>
                      </tr>

                      {/* Row 5 */}
                      <tr className="hover:bg-pink-50/40">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-600 text-white font-bold">5</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">Application Form</td>
                        <td className="px-4 sm:px-6 py-4 text-gray-700">Submit your application through our secure online form</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSc3d7NWiaJfyMXuiZqfxabmtVLnYwTLHCGmWPLUQunzjrDdUg/viewform?usp=preview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Application Form"
                          >
                            <FaWpforms className="w-10 h-10 text-[#AD47FF]" />
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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


