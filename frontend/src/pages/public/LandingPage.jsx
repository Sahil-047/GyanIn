import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TeacherCarousel from '../../components/public/TeacherCarousel';
import { cmsAPI, coursesAPI } from '../../utils/api';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [offers, setOffers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch CMS data
  useEffect(() => {
    const fetchCMSData = async () => {
      try {
        // Fetch courses from courses API instead of CMS
        const [coursesResponse, offersResponse, testimonialsResponse] = await Promise.allSettled([
          coursesAPI.getCourses({ limit: 6 }),
          cmsAPI.getCMSSection('offers'),
          cmsAPI.getCMSSection('testimonials')
        ]);

        // Set courses from courses API
        if (coursesResponse.status === 'fulfilled' && coursesResponse.value.success) {
          setCourses(coursesResponse.value.data || []);
        } else {
          // Fallback to mock data
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

        // Set testimonials
        if (testimonialsResponse.status === 'fulfilled' && testimonialsResponse.value.success) {
          setTestimonials(testimonialsResponse.value.data.data.testimonials || []);
        } else {
          // Fallback to mock data
          setTestimonials([
            {
              id: 1,
              name: 'John Doe',
              role: 'Student',
              content: 'GyanIN helped me advance my career in tech. The courses are practical and industry-relevant.',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            },
            {
              id: 2,
              name: 'Jane Smith',
              role: 'Professional',
              content: 'The instructors are amazing and the learning platform is user-friendly. Highly recommended!',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching CMS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSData();
  }, []);
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section with Teacher Carousel */}
      <section className="w-full bg-white py-12 md:py-16">
        <div className="w-full mt-10 max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="flex flex-col justify-center space-y-6 md:pr-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Unlock Your Potential With New Skills
              </h1>
              <p className="text-gray-600 text-lg md:text-xl">
                Unlock a world of opportunities and take control of your future by mastering new skills that empower you to achieve your goals.
              </p>
              <div>
                <Link 
                  to="/admin/dashboard"
                  className="inline-flex px-8 py-4 bg-[#0061FF] text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            {/* Right Column - Teacher Carousel */}
            <div className="w-full">
              <TeacherCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Sales & Offers Section */}
      <section className="w-full bg-white py-16 border-t border-gray-200">
        <div className="w-full">
          <div className="text-center mb-12">
            <h3 className="text-gray-800 text-2xl font-bold mb-2">
              Sales & Offers
            </h3>
            <p className="text-gray-600 text-sm">
              Exclusive offers and discounts for our learners
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
                        className="flex-shrink-0 mx-4 my-4 bg-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[280px] max-w-[320px]"
                      >
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`w-16 h-16 bg-gradient-to-r ${offer.color || 'from-blue-500 to-blue-600'} rounded-xl flex items-center justify-center shadow-lg`}>
                              <span className="text-white font-bold text-lg">{offer.logo || offer.title?.charAt(0) || 'O'}</span>
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="font-bold text-gray-900 text-lg">{offer.name || offer.title}</h4>
                              <div className="flex items-center mt-1">
                                <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-yellow-600 font-semibold text-sm">
                                  {offer.isActive ? 'Active Offer' : 'Premium Partner'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-200 rounded-lg my-2 px-3">
                            <p className="text-gray-700 font-medium text-sm">{offer.offer || offer.description}</p>
                          </div>
                          {offer.discount && (
                            <div className="bg-red-100 text-red-800 rounded-lg my-2 px-3 py-1">
                              <p className="font-bold text-sm">{offer.discount}</p>
                            </div>
                          )}
                          {offer.validUntil && (
                            <div className="text-xs text-gray-500 mb-2">
                              Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                            </div>
                          )}
                          <button className="w-full mt-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2 px-4 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200">
                            Claim Offer
                          </button>
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
      <section className="w-full bg-white py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our Featured Courses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-[200px] bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              courses.map((course, index) => (
                <div 
                  key={course._id || course.id || index}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-[200px] bg-slate-200 relative">
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
                    <span className="absolute top-3 left-3 bg-white px-3 py-1 rounded text-xs font-bold">
                      {course.level || 'Featured'}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-end mb-2">
                      <span className="text-[#0061FF] text-xl font-bold">
                        ₹{course.price || '299.99'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
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

                    <button className="w-full mt-6 py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200">
                      View Course
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* View All Courses Button */}
        <div className="text-center mt-12">
          <Link 
            to="/courses"
            className="inline-flex items-center px-8 py-4 bg-[#0061FF] text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            View All Courses
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Choose GyanIN
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Gain clarity & achieve your educational goals with expert guidance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0061FF] flex items-center justify-center mx-auto mb-6 p-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="w-full bg-white py-20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What Our Students Say
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
              Hear from our successful learners who have transformed their careers with GyanIN.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id || index} className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      {testimonial.avatar ? (
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {testimonial.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 italic">
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="w-full bg-[#0061FF] text-white py-20 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-[#0047b3] opacity-20"></div>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Unlock Your Learning Potential Today
          </h2>
          <p className="text-xl text-center max-w-3xl mx-auto mb-8 opacity-90">
            Join thousands of learners around the world who are advancing their careers with our expertly crafted courses.
          </p>
          <div className="text-center">
            <Link 
              to="/admin/dashboard"
              className="inline-flex px-8 py-4 bg-white text-[#0061FF] rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
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