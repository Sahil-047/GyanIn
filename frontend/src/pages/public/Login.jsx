import { useNavigate } from 'react-router-dom'
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from 'react-icons/fa'

const Login = () => {
    const navigate = useNavigate()

    const cards = [
        {
            key: 'student',
            title: 'Student Login',
            description: 'Access your courses, schedules and updates',
            icon: <FaUserGraduate className="w-6 h-6 text-blue-600" />,
            onClick: () => window.open('https://web.classplusapp.com/', '_blank'),
            styles: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/40',
        },
        {
            key: 'teacher',
            title: 'Teacher Login',
            description: 'Manage your classes, slots and student progress',
            icon: <FaChalkboardTeacher className="w-6 h-6 text-emerald-600" />,
            onClick: () => window.open('https://web.classplusapp.com/', '_blank'),
            styles: 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/40',
        },
        {
            key: 'admin',
            title: 'Admin Login',
            description: 'Go to the admin dashboard to manage the platform',
            icon: <FaUserShield className="w-6 h-6 text-indigo-600" />,
            onClick: () => navigate('/admin/login'),
            styles: 'border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/40',
        },
    ]

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl p-8 md:p-10">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Choose Login Type</h1>
                        <p className="text-gray-600 mt-2">Select how you want to sign in</p>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cards.map(card => (
                            <button
                                key={card.key}
                                type="button"
                                onClick={card.onClick}
                                className={`group text-left w-full h-full shadow-lg bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${card.styles}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        {card.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                                        <p className="mt-1 text-sm text-gray-600">{card.description}</p>
                                    </div>
                                </div>

                            </button>
                        ))}
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Student and Teacher login is available through{' '}
                        <a 
                            href="https://web.classplusapp.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                            ClassPlus
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login


