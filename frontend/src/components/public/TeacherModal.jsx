import { useState, useEffect } from 'react';

const TeacherModal = ({ teacher, onClose }) => {
  const [tabValue, setTabValue] = useState(0);

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  // Mock data for achievements and courses
  const achievements = [
    'Published research papers in leading journals',
    'Developed curriculum for multiple courses',
    'Industry consultant for major tech companies',
    'Mentored over 100 successful students'
  ];

  const courses = ['Advanced Web Development', 'Data Science Fundamentals', 'Mobile App Development', 'Cybersecurity Basics'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-[#0061FF] text-white rounded-t-xl">
            <h2 className="text-xl font-semibold">Teacher Profile</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Teacher header */}
            <div className="flex flex-col md:flex-row items-center mb-6">
              <div className="mb-4 md:mb-0 md:mr-6">
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg object-cover"
                />
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {teacher.name}
                </h3>
                <p className="text-[#0061FF] font-medium mb-2">
                  {teacher.role}
                </p>
                <p className="text-gray-600 mb-4">
                  {teacher.education}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Tabs */}
            <div className="w-full">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => handleTabChange(0)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${tabValue === 0
                        ? 'border-[#0061FF] text-[#0061FF]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Biography
                    </div>
                  </button>
                  <button
                    onClick={() => handleTabChange(1)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${tabValue === 1
                        ? 'border-[#0061FF] text-[#0061FF]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Courses
                    </div>
                  </button>
                  <button
                    onClick={() => handleTabChange(2)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${tabValue === 2
                        ? 'border-[#0061FF] text-[#0061FF]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Achievements
                    </div>
                  </button>
                </nav>
              </div>

              {/* Biography Tab */}
              {tabValue === 0 && (
                <div className="py-6">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {teacher.bio}
                  </p>

                  <div className="bg-[#0061FF] text-white p-4 rounded-lg">
                    <p className="text-sm italic mb-2">
                      "Education is not the filling of a pail, but the lighting of a fire."
                    </p>
                    <p className="text-xs text-right">
                      — Teaching Philosophy
                    </p>
                  </div>
                </div>
              )}

              {/* Courses Tab */}
              {tabValue === 1 && (
                <div className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-[#0061FF] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {course}
                          </h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {index % 2 === 0 ? 'Beginner to Advanced' : 'Intermediate Level'}
                        </p>
                        <button className="text-sm bg-[#0061FF] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                          Learn More
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {tabValue === 2 && (
                <div className="py-6">
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-[#0061FF] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-700">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-b-xl">
            <p className="text-gray-600 text-sm">
              Want to learn from {teacher.name.split(' ')[0]}?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button className="flex items-center px-6 py-2 bg-[#0061FF] text-white rounded-lg hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                Book a Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherModal;