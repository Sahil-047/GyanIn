import { useState } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Static courses data - can be replaced with CMS data in future
  const courses = [
    {
      id: 1,
      title: 'Data Science Essentials',
      instructor: 'Dr. Liam Morgan',
      level: 'Advanced',
      price: '299.99',
      duration: '25h 30min',
      lessons: 12,
      category: 'data-science',
      rating: 4.8,
      students: 1250,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Master the fundamentals of data science with hands-on projects and real-world applications.',
      tags: ['Python', 'Machine Learning', 'Statistics']
    },
    {
      id: 2,
      title: 'Digital Marketing Pro',
      instructor: 'Alex Reveira',
      level: 'Intermediate',
      price: '199.99',
      duration: '18h 45min',
      lessons: 10,
      category: 'marketing',
      rating: 4.6,
      students: 890,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Learn advanced digital marketing strategies and tools to grow your business online.',
      tags: ['SEO', 'Social Media', 'Analytics']
    },
    {
      id: 3,
      title: 'UI/UX Design Essentials',
      instructor: 'Dr. Michael Lee',
      level: 'Beginner',
      price: '99.99',
      duration: '25h 30min',
      lessons: 28,
      category: 'design',
      rating: 4.9,
      students: 2100,
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Create beautiful and user-friendly interfaces with modern design principles.',
      tags: ['Figma', 'Adobe XD', 'Prototyping']
    },
    {
      id: 4,
      title: 'Web Development Bootcamp',
      instructor: 'Sarah Johnson',
      level: 'Beginner',
      price: '399.99',
      duration: '40h 15min',
      lessons: 35,
      category: 'web-development',
      rating: 4.7,
      students: 1800,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
      tags: ['HTML', 'CSS', 'JavaScript', 'React']
    },
    {
      id: 5,
      title: 'Mobile App Development',
      instructor: 'David Chen',
      level: 'Intermediate',
      price: '349.99',
      duration: '32h 20min',
      lessons: 24,
      category: 'mobile-development',
      rating: 4.5,
      students: 950,
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Build native iOS and Android apps using React Native and Flutter.',
      tags: ['React Native', 'Flutter', 'iOS', 'Android']
    },
    {
      id: 6,
      title: 'Cloud Computing & AWS',
      instructor: 'Maria Rodriguez',
      level: 'Advanced',
      price: '449.99',
      duration: '35h 45min',
      lessons: 20,
      category: 'cloud-computing',
      rating: 4.8,
      students: 750,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Master cloud computing concepts and AWS services for scalable applications.',
      tags: ['AWS', 'Docker', 'Kubernetes', 'DevOps']
    },
    {
      id: 7,
      title: 'Cybersecurity Fundamentals',
      instructor: 'James Wilson',
      level: 'Intermediate',
      price: '279.99',
      duration: '22h 30min',
      lessons: 16,
      category: 'cybersecurity',
      rating: 4.6,
      students: 1100,
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Learn essential cybersecurity practices and threat protection strategies.',
      tags: ['Network Security', 'Ethical Hacking', 'Risk Assessment']
    },
    {
      id: 8,
      title: 'Python Programming Mastery',
      instructor: 'Dr. Priya Sharma',
      level: 'Beginner',
      price: '179.99',
      duration: '28h 15min',
      lessons: 30,
      category: 'programming',
      rating: 4.9,
      students: 2500,
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      description: 'Complete Python programming course from basics to advanced concepts.',
      tags: ['Python', 'Django', 'Flask', 'Data Structures']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'web-development', name: 'Web Development' },
    { id: 'mobile-development', name: 'Mobile Development' },
    { id: 'design', name: 'Design' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'cloud-computing', name: 'Cloud Computing' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'programming', name: 'Programming' }
  ];

  const filteredCourses = courses.filter(course => 
    selectedCategory === 'all' || course.category === selectedCategory
  );

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
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive collection of courses designed to help you master new skills and advance your career.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#0061FF] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0061FF]"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="students">Most Students</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCourses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              {/* Course Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    {course.level}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white px-2 py-1 rounded-full flex items-center space-x-1 shadow-md">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Price */}
                <div className="flex justify-end mb-2">
                  <span className="text-[#0061FF] text-2xl font-bold">
                    ₹{course.price}
                  </span>
                </div>

                {/* Title and Instructor */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-500 text-sm mb-3">
                  By {course.instructor}
                </p>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Course Stats */}
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.2,16.2L11,13V7h1.5v5.2l4.5,2.7L16.2,16.2z" />
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z" />
                    </svg>
                    <span>{course.lessons} Lessons</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{course.students}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200">
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-[#0061FF] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
            Load More Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Courses;
