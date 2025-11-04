import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TeacherCarousel from '../../components/public/TeacherCarousel';
import { cmsAPI, coursesAPI, slotsAPI } from '../../utils/api';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [offers, setOffers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = 'Welcome to Gyanin academy, your journey to mastery begins here.';

  // Fetch CMS data
  useEffect(() => {
    const fetchCMSData = async () => {
      try {
        // Fetch courses from courses API instead of CMS
        const [coursesResponse, offersResponse, slotsResponse] = await Promise.allSettled([
          coursesAPI.getCourses({ limit: 3 }),
          cmsAPI.getCMSSection('offers'),
          slotsAPI.getSlots({ limit: 100 })
        ]);

        // Set courses from courses API
        if (coursesResponse.status === 'fulfilled' && coursesResponse.value.success) {
          // Limit to 3 courses even if API returns more
          const coursesData = coursesResponse.value.data || [];
          setCourses(coursesData.slice(0, 3));
        } else {
          // Fallback to mock data - only 3 courses
          setCourses([
            {
              id: 1,
              title: 'Data Science Essentials',
              description: 'Master the fundamentals of data science with hands-on projects and real-world applications.',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 2,
              title: 'Digital Marketing Pro',
              description: 'Learn advanced digital marketing strategies and tools to grow your business online.',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 3,
              title: 'UI/UX Design Essentials',
              description: 'Create beautiful and user-friendly designs with modern UI/UX principles and tools.',
              image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
          ]);
        }

        // Set offers
        if (offersResponse.status === 'fulfilled' && offersResponse.value.success) {
          setOffers(offersResponse.value.data.data.offers || []);
        } else {
          // Fallback to mock data
          setOffers([
            { name: "TechCorp", offer: "20% Off All Courses", logo: "TC", color: "from-blue-500 to-blue-600" },
            { name: "EduTech Solutions", offer: "Free Trial Available", logo: "ET", color: "from-green-500 to-green-600" },
            { name: "LearnPro", offer: "Student Discount 15%", logo: "LP", color: "from-purple-500 to-purple-600" },
            { name: "SkillMaster", offer: "Bundle Deals Up to 30%", logo: "SM", color: "from-orange-500 to-orange-600" },
            { name: "CodeAcademy Pro", offer: "Premium Access Free", logo: "CA", color: "from-red-500 to-red-600" },
            { name: "DataScience Hub", offer: "Certification Included", logo: "DH", color: "from-teal-500 to-teal-600" },
            { name: "WebDev Masters", offer: "Mentorship Program", logo: "WM", color: "from-indigo-500 to-indigo-600" },
            { name: "AI Learning Lab", offer: "Project Portfolio", logo: "AL", color: "from-pink-500 to-pink-600" },
            { name: "CloudTech", offer: "AWS Credits Included", logo: "CT", color: "from-cyan-500 to-cyan-600" },
            { name: "DevOps Academy", offer: "Industry Certification", logo: "DA", color: "from-emerald-500 to-emerald-600" }
          ]);
        }

        // Set slots
        if (slotsResponse.status === 'fulfilled' && slotsResponse.value.success) {
          setSlots(slotsResponse.value.data || []);
        }
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    fetchCMSData();
  }, []);

  // Autotyping effect
  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 100); // Adjust speed here (lower = faster, 100ms = medium speed)

    return () => clearInterval(typingInterval);
  }, []); // Run once on mount
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section with Teacher Carousel */}
      <section className="w-full bg-white py-8 sm:py-10 md:py-12 lg:py-16 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/bg-hero.png)' }}>
        <div className="absolute inset-0 bg-white/90"></div>
        <div className="w-full mt-6 sm:mt-8 md:mt-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="flex flex-col justify-center space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left md:pr-8 order-2 md:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-0.5 h-[1em] bg-current ml-1 animate-pulse">|</span>
                )}
              </h1>
              <p className="text-gray-600 text-base sm:text-lg md:text-xl">
                Join us and start your journey to mastery.
              </p>
              <div className="flex justify-center md:justify-start">
                <Link 
                  to="/courses"
                  className="group relative inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-blue-600 hover:bg-black text-white rounded-full text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <span className="relative z-10">Explore Courses</span>
                  <span className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-full">
                    <span 
                      className="relative w-6 h-6 transition-transform duration-300 group-hover:rotate-45" 
                      style={{ transformOrigin: 'center center' }}
                    >
                      {/* Arrow shaft */}
                      <span 
                        className="absolute top-1/2 left-0 w-3 h-0.5 bg-gray-800 transform -translate-y-1/2 origin-left"
                        style={{ left: '10%' }}
                      ></span>
                      {/* Arrow head */}
                      <span 
                        className="absolute top-1/2 right-0 transform -translate-y-1/2"
                        style={{ 
                          width: 0, 
                          height: 0,
                          borderLeft: '4px solid #1f2937',
                          borderTop: '3px solid transparent',
                          borderBottom: '3px solid transparent',
                          right: '10%'
                        }}
                      ></span>
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column - Teacher Carousel */}
            <div className="w-full order-1 md:order-2">
              <TeacherCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Courses Section */}
      <section className="w-full bg-white py-8 sm:py-12 md:py-16 border-t border-gray-200">
        <div className="w-full">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 px-4">
            <h3 className="text-gray-800 text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Ongoing Courses
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              Currently running batches with available seats
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll">
                {/* Duplicate offers multiple times for continuous scrolling */}
                {Array.from({ length: Math.max(5, Math.ceil(10 / offers.length)) }).map((_, repeatIndex) => (
                  <div key={`set-${repeatIndex}`} className="flex items-center flex-shrink-0">
                    {offers.map((offer, index) => (
                      <div
                        key={`${repeatIndex}-${index}`}
                        className="flex-shrink-0 mx-4 my-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-w-[280px] max-w-[320px] border border-gray-200 overflow-hidden relative"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${offer.color || 'from-blue-500 to-blue-600'}`}></div>
                        <div className="p-6">
                          <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg leading-tight">{offer.name || offer.title}</h4>
                              {offer.isActive && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                  {offer.isActive ? 'Active' : 'Premium'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="my-4 pb-2">
                            <p className="text-gray-800 font-medium text-base leading-relaxed">{offer.offer || offer.description}</p>
                          </div>
                          {offer.slotId && slots.find(s => s._id === offer.slotId) && (() => {
                            const availableSeats = slots.find(s => s._id === offer.slotId).capacity - slots.find(s => s._id === offer.slotId).enrolledStudents;
                            const isLowAvailability = availableSeats < 10;
                            return (
                              <div className="my-3 pt-3 border-t border-gray-100">
                                <div className={`inline-flex items-center px-3 py-1.5 rounded-lg ${isLowAvailability ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                                  <svg className={`w-4 h-4 mr-1.5 ${isLowAvailability ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <p className={`${isLowAvailability ? 'text-red-600' : 'text-green-600'} font-semibold text-sm`}>
                                    {availableSeats} Seats Available
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                          {!offer.slotId && offer.discount && (
                            <div className="my-3 pt-3 border-t border-gray-100">
                              <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                                <p className="text-blue-600 font-semibold text-sm">{offer.discount}</p>
                              </div>
                            </div>
                          )}
                          {offer.validUntil && (
                            <div className="flex items-center text-gray-400 text-xs mt-4 pt-3 border-t border-gray-100">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="w-full bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
            Our Featured Courses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-[180px] sm:h-[200px] bg-gray-200 animate-pulse"></div>
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-7 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              courses.map((course, index) => (
                <div
                  key={course._id || course.id || index}
                  className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="h-[180px] sm:h-[200px] bg-slate-200 relative">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">{course.title?.charAt(0) || 'C'}</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs font-bold">
                      {course.level || course.class ? `Class ${course.class}` : 'Featured'}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                    {/* Price - Fixed height container */}
                    <div className="flex flex-col items-end mb-2 gap-1 min-h-[3.5rem] sm:min-h-[4rem] justify-start">
                      {course.monthlyPrice && course.yearlyPrice ? (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[#0061FF] text-base sm:text-lg font-bold">
                              ₹{course.monthlyPrice}
                            </span>
                            <span className="text-gray-500 text-xs">/month</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[#0061FF] text-base sm:text-lg font-bold">
                              ₹{course.yearlyPrice}
                            </span>
                            <span className="text-gray-500 text-xs">/year</span>
                          </div>
                        </>
                      ) : course.monthlyPrice ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-[#0061FF] text-lg sm:text-xl font-bold">
                            ₹{course.monthlyPrice}
                          </span>
                          <span className="text-gray-500 text-xs">/month</span>
                        </div>
                      ) : course.yearlyPrice ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-[#0061FF] text-lg sm:text-xl font-bold">
                            ₹{course.yearlyPrice}
                          </span>
                          <span className="text-gray-500 text-xs">/year</span>
                        </div>
                      ) : (
                        <span className="text-[#0061FF] text-lg sm:text-xl font-bold">
                          ₹{course.price || '299.99'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {course.description || 'Learn from industry experts with practical projects.'}
                    </p>

                    {(course.duration || course.tags) && (
                      <div className="flex justify-between mt-4">
                        {course.duration && (
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.2,16.2L11,13V7h1.5v5.2l4.5,2.7L16.2,16.2z" />
                            </svg>
                            <span className="text-sm">{course.duration}</span>
                          </div>
                        )}

                        {course.tags && course.tags.length > 0 && (
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z" />
                            </svg>
                            <span className="text-sm">{course.tags.length} Tags</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button - Push to bottom */}
                    <div className="mt-auto pt-4">
                      {course.enrollmentUrl ? (
                        <a
                          href={course.enrollmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 sm:py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-colors duration-200 text-sm sm:text-base inline-block text-center"
                        >
                          Enroll Now
                        </a>
                      ) : (
                        <Link
                          to="/admissions"
                          className="w-full py-2.5 sm:py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-colors duration-200 text-sm sm:text-base inline-block text-center"
                        >
                          Enroll Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 sm:mt-10 md:mt-12">
          <Link
            to="/courses"
            className="inline-flex items-center px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-[#0061FF] text-white rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            All Courses
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
            Why Choose GyanIN
          </h2>
          <p className="text-gray-600 text-sm sm:text-base text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16 px-4">
            Gain clarity & achieve your educational goals with expert guidance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z" />
                  </svg>
                ),
                title: '4k+ hours videos',
                description: 'Hours of meticulously designed courses, created and taught by industry-leading professionals.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                ),
                title: 'A Great Community',
                description: 'We value our global community\'s support and embrace diversity to create a welcoming space for everyone to learn.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                ),
                title: 'Learn-by-Doing, Teach with Purpose',
                description: 'Our philosophy: hands-on learning creates impact. Every course fosters practical skills and transparency.'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center px-4 sm:px-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-blue-50 text-[#0061FF] flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 p-3 sm:p-3.5 md:p-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6">{feature.icon}</div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="w-full bg-[#0061FF] text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] rounded-full bg-[#0047b3] opacity-20"></div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
            Unlock Your Learning Potential Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-center max-w-3xl mx-auto mb-6 sm:mb-8 opacity-90 px-2">
            Join thousands of learners around the world who are advancing their careers with our expertly crafted courses.
          </p>
          <div className="text-center">
            <Link
              to="/courses"
              className="inline-flex px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-[#0061FF] rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;