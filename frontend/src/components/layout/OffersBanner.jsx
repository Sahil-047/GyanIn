import { useState, useEffect } from 'react'
import { cmsAPI } from '../../utils/api'
import toast from 'react-hot-toast'

// Convert Tailwind color class to hex color
const getColorFromTailwind = (tailwindClass) => {
    if (!tailwindClass) return '#EC4899' // Default pink

    // Extract color name and shade from classes like "from-pink-500 to-pink-600"
    const match = tailwindClass.match(/(?:from-|to-)?(\w+)-(\d+)/)
    if (!match) return '#EC4899'

    const [, colorName, shade] = match

    // Tailwind color palette mapping
    const colorMap = {
        pink: {
            400: '#F472B6',
            500: '#EC4899',
            600: '#DB2777'
        },
        blue: {
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB'
        },
        green: {
            400: '#4ADE80',
            500: '#22C55E',
            600: '#16A34A'
        },
        purple: {
            400: '#A78BFA',
            500: '#8B5CF6',
            600: '#7C3AED'
        },
        orange: {
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C'
        },
        red: {
            400: '#F87171',
            500: '#EF4444',
            600: '#DC2626'
        },
        teal: {
            400: '#2DD4BF',
            500: '#14B8A6',
            600: '#0D9488'
        },
        indigo: {
            400: '#818CF8',
            500: '#6366F1',
            600: '#4F46E5'
        },
        cyan: {
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2'
        },
        emerald: {
            400: '#34D399',
            500: '#10B981',
            600: '#059669'
        }
    }

    const shadeNum = parseInt(shade)
    const closestShade = shadeNum >= 600 ? 600 : shadeNum >= 500 ? 500 : 400

    return colorMap[colorName]?.[closestShade] || '#EC4899'
}

const OffersBanner = () => {
    const [manualOffers, setManualOffers] = useState([])
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    // Fetch manual offers
    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await cmsAPI.getCMSSection('offers')
                if (response.success) {
                    const offersData = response.data.data?.offers || []
                    const activeOffers = offersData.filter(offer => offer.isActive !== false)
                    setManualOffers(activeOffers)
                }
            } catch (error) {
                toast.error('Failed to load offers. Please refresh the page.')
            }
        }
        fetchOffers()
    }, [])

    // Handle scroll to hide/show banner
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Show banner when at the top, hide when scrolling down
            if (currentScrollY <= 10) {
                setIsVisible(true)
            } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down - hide banner
                setIsVisible(false)
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up - show banner
                setIsVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

    if (manualOffers.length === 0) return null

    // Get the first active offer for display
    const activeOffer = manualOffers[0]

    // Get background color from CMS offer or default to pink
    const backgroundColor = getColorFromTailwind(activeOffer?.color)

    return (
        <div
            className="w-full sticky top-0 z-[60] flex items-center justify-center relative overflow-hidden transition-transform duration-300 ease-in-out"
            style={{
                backgroundColor: backgroundColor,
                paddingTop: '10px',
                paddingBottom: '10px',
                minHeight: '60px',
                transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
            }}
        >
            {/* Faded Offer Name text - Centered Background (Hidden on Mobile) */}
            <div
                className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full"
                style={{
                    fontSize: 'clamp(24px, 5vw, 60px)',
                    fontWeight: 'bold',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: 1,
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    letterSpacing: 'clamp(1px, 0.5vw, 4px)',
                    userSelect: 'none',
                    padding: '0 20px'
                }}
            >
                {activeOffer?.name?.toUpperCase() || 'SALE'}
            </div>

            {/* Small Promotional Text - Mobile Only */}
            <div className="block sm:hidden max-w-7xl mx-auto px-2 sm:px-4 relative z-10 w-full">
                <div className="flex-shrink-0 text-center">
                    <span
                        className="text-white font-extrabold uppercase"
                        style={{
                            fontSize: 'clamp(12px, 2.5vw, 16px)',
                            fontWeight: 900,
                            letterSpacing: '0.3px',
                            whiteSpace: 'normal',
                            lineHeight: '1.3',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        {activeOffer.offer || activeOffer.name || 'SPECIAL OFFER'}
                        {activeOffer.discount && ` - ${activeOffer.discount.toUpperCase()}`}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default OffersBanner

