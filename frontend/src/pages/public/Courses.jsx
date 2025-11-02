import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../utils/api';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await coursesAPI.getCourses();
        
        if (response.success) {
          setCourses(response.data);
          
          // Extract unique categories, filtering out empty strings
          const uniqueCategories = ['all', ...new Set(response.data.map(course => course.category).filter(cat => cat && cat.trim()))];
          setCategories(uniqueCategories.map((cat, index) => ({
            id: cat,
            name: index === 0 ? 'All Courses' : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')
          })));
          
          // Extract unique instructors
          const uniqueInstructors = ['all', ...new Set(response.data.map(course => course.instructor).filter(inst => inst && inst.trim()))];
          setInstructors(uniqueInstructors.map((inst, index) => ({
            id: inst,
            name: index === 0 ? 'All Teachers' : inst
          })));
        }
      } catch (err) {
        
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const instructorMatch = selectedInstructor === 'all' || course.instructor === selectedInstructor;
    return categoryMatch && instructorMatch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'students':
        return b.students - a.students;
      default:
        return b.students - a.students; // popular by default
    }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              All Courses
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              Discover our comprehensive collection of courses designed to help you master new skills and advance your career.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Filter by Category</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.filter(category => category.id && category.name).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#0061FF] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Teacher Filter */}
          {instructors.length > 1 && (
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Filter by Teacher</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {instructors.filter(instructor => instructor.id && instructor.name).map((instructor) => (
                  <button
                    key={instructor.id}
                    onClick={() => setSelectedInstructor(instructor.id)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      selectedInstructor === instructor.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {instructor.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            {selectedInstructor !== 'all' && ` by ${selectedInstructor}`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#0061FF]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 sm:py-16 md:py-20 px-4">
            <p className="text-red-600 text-base sm:text-lg">{error}</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            {sortedCourses.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-20 px-4">
                <p className="text-gray-600 text-base sm:text-lg">No courses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {sortedCourses.map((course) => (
                  <div
                    key={course._id || course.id}
                    className="bg-gray-100 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    {/* Course Image */}
                    <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4">
                        <span className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold shadow-md">
                          {course.level || course.class ? `Class ${course.class}` : 'Featured'}
                        </span>
                      </div>
                      {course.rating && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                          <div className="bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center space-x-0.5 sm:space-x-1 shadow-md">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">{course.rating}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-4 sm:p-5 md:p-6">
                      {/* Price */}
                      <div className="flex justify-end mb-2">
                        <span className="text-[#0061FF] text-xl sm:text-2xl font-bold">
                          ₹{course.price}
                        </span>
                      </div>

                      {/* Title and Instructor */}
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 line-clamp-2">{course.title}</h3>
                      <div className="flex items-center flex-wrap mb-2 sm:mb-3">
                        <span className="text-gray-600 text-xs sm:text-sm mr-1">By</span>
                        <span className="text-[#0061FF] font-semibold text-xs sm:text-sm bg-blue-50 px-2 py-0.5 sm:py-1 rounded">
                          {course.instructor}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Tags */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          {course.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Course Stats */}
                      <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-0 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
                        {course.duration && (
                          <div className="flex items-center">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.2,16.2L11,13V7h1.5v5.2l4.5,2.7L16.2,16.2z" />
                            </svg>
                            <span className="whitespace-nowrap">{course.duration}</span>
                          </div>
                        )}
                        {course.lessons && (
                          <div className="flex items-center">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z" />
                            </svg>
                            <span className="whitespace-nowrap">{course.lessons} Lessons</span>
                          </div>
                        )}
                        {course.students && (
                          <div className="flex items-center">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="whitespace-nowrap">{course.students}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {course.enrollmentUrl ? (
                        <a
                          href={course.enrollmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 sm:py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-colors duration-200 inline-block text-center text-sm sm:text-base"
                        >
                          Enroll Now
                        </a>
                      ) : (
                        <Link
                          to="/admissions"
                          className="w-full py-2.5 sm:py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-colors duration-200 inline-block text-center text-sm sm:text-base"
                        >
                          Enroll Now
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
