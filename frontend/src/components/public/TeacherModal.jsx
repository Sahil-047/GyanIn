import { useEffect } from 'react';

const TeacherModal = ({ teacher, onClose }) => {
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

  // Extract data supporting both old and new structure
  const teacherName = teacher?.name || teacher?.subtitle || teacher?.title || 'Teacher';
  const teacherDescription = teacher?.description || teacher?.bio || 'Experienced instructor';
  const teacherImage = teacher?.image || teacher?.teacherImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
  const teacherRole = teacher?.role || 'Professional Instructor';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-sm sm:max-w-lg md:max-w-2xl bg-white rounded-lg sm:rounded-xl shadow-2xl mx-auto my-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 bg-[#0061FF] text-white rounded-t-lg sm:rounded-t-xl">
            <h2 className="text-lg sm:text-xl font-semibold">Teacher Profile</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Simplified */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Teacher Image */}
              <div className="mb-4 sm:mb-5 md:mb-6">
                <img
                  src={teacherImage}
                  alt={teacherName}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-2 sm:border-3 md:border-4 border-blue-200 shadow-lg object-cover"
                />
              </div>

              {/* Teacher Name */}
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                {teacherName}
              </h3>

              {/* Teacher Role */}
              <p className="text-[#0061FF] text-base sm:text-lg font-medium mb-4 sm:mb-5 md:mb-6">
                {teacherRole}
              </p>

              {/* Teacher Description */}
              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl px-2">
                {teacherDescription}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 sm:p-5 md:p-6 bg-gray-50 rounded-b-lg sm:rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-[#0061FF] text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherModal;
