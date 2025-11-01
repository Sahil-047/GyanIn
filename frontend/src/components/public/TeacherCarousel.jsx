import { useState, useEffect } from 'react';
import TeacherModal from './TeacherModal';
import { cmsAPI } from '../../utils/api';

const TeacherCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carouselItems, setCarouselItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch carousel data from CMS
    useEffect(() => {
        const fetchCarouselData = async () => {
            try {
                const response = await cmsAPI.getCMSSection('carousel');
                if (response.success && response.data.data.carouselItems) {
                    setCarouselItems(response.data.data.carouselItems);
                } else {
                    // Fallback to mock data if CMS is empty
                    setCarouselItems([
                        {
                            id: 1,
                            title: 'Meet Our Expert',
                            subtitle: 'Dr. Priya Sharma',
                            description: 'Dr. Priya Sharma has over 10 years of experience in web development and teaching. She specializes in modern JavaScript frameworks and has helped hundreds of students launch their careers in tech.',
                            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                            teacher: {
                                name: 'Dr. Priya Sharma',
                                role: 'Web Development Lead',
                                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                            }
                        }
                    ]);
                }
            } catch (error) {
                
                // Fallback to mock data on error
                setCarouselItems([
                    {
                        id: 1,
                        title: 'Meet Our Expert',
                        subtitle: 'Dr. Priya Sharma',
                        description: 'Dr. Priya Sharma has over 10 years of experience in web development and teaching. She specializes in modern JavaScript frameworks and has helped hundreds of students launch their careers in tech.',
                        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                        teacher: {
                            name: 'Dr. Priya Sharma',
                            role: 'Web Development Lead',
                            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                        }
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCarouselData();
    }, []);

    // Auto-scroll functionality
    useEffect(() => {
        if (carouselItems.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [carouselItems.length]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    };

    const handleBack = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselItems.length) % carouselItems.length);
    };

    const handleTeacherClick = (teacherData) => {
        // Ensure we pass the full teacher object including scheduleImage
        // Support both nested teacher structure and flat structure
        const teacher = teacherData?.teacher || teacherData;
        setSelectedTeacher({
            ...teacher,
            scheduleImage: teacher?.scheduleImage || teacherData?.teacher?.scheduleImage || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTeacher(null);
    };

    if (loading) {
        return (
            <div className="w-full flex-grow mb-4 sm:mb-6 md:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row p-4 sm:p-6 md:p-8 items-center justify-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (carouselItems.length === 0) {
        return (
            <div className="w-full flex-grow mb-4 sm:mb-6 md:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row p-4 sm:p-6 md:p-8 items-center justify-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                        <p className="text-sm sm:text-base text-gray-500">No carousel items available</p>
                    </div>
                </div>
            </div>
        );
    }

    const activeItem = carouselItems[currentIndex];

    // Extract data supporting both old and new structure
    const teacherName = activeItem.teacher?.name || activeItem.subtitle || activeItem.title || 'Expert Teacher';
    const teacherDescription = activeItem.teacher?.description || activeItem.description || 'Learn from industry experts with years of experience.';
    const teacherImage = activeItem.teacher?.image || activeItem.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
    const teacherRole = activeItem.teacher?.role || 'Professional Instructor';

    return (
        <div className="w-full flex-grow mb-4 sm:mb-6 md:mb-8">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row p-4 sm:p-6 md:p-8 items-center justify-between min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                    {/* Text Content */}
                    <div className="w-full md:w-1/2 text-center md:text-left mb-6 sm:mb-8 md:mb-0 md:pr-6 lg:pr-8">
                        <h2 className="text-[#0061FF] text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                            Meet Our Expert
                        </h2>

                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2">
                            {teacherName}
                        </h3>

                        <p className="text-gray-600 text-sm sm:text-base font-medium mb-3 sm:mb-4">
                            {teacherRole}
                        </p>

                        <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 line-clamp-3 sm:line-clamp-4">
                            {teacherDescription}
                        </p>

                        <button
                            onClick={() => handleTeacherClick(activeItem.teacher || activeItem)}
                            className="inline-flex items-center px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-[#0061FF] text-white rounded-lg text-xs sm:text-sm md:text-base font-semibold hover:bg-blue-700 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="hidden sm:inline">View Profile</span>
                            <span className="sm:hidden">Profile</span>
                        </button>
                    </div>

                    {/* Teacher Avatar */}
                    <div className="w-full md:w-1/2 flex justify-center">
                        <div
                            onClick={() => handleTeacherClick(activeItem.teacher || activeItem)}
                            className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 rounded-full border-2 sm:border-3 md:border-4 border-blue-200 shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
                        >
                            <img
                                src={teacherImage}
                                alt={teacherName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Dots and Buttons */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 bg-white px-3 sm:px-4 py-2">
                <button
                    onClick={handleBack}
                    className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-[#0061FF] transition-colors duration-200"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex gap-1.5 sm:gap-2">
                    {carouselItems.map((_, index) => (
                        <div
                            key={index}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${index === currentIndex ? 'bg-[#0061FF]' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-[#0061FF] transition-colors duration-200"
                >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Teacher Modal */}
            {isModalOpen && selectedTeacher && (
                <TeacherModal teacher={selectedTeacher} onClose={closeModal} />
            )}
        </div>
    );
};

export default TeacherCarousel;