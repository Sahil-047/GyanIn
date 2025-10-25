const express = require('express');
const { body, validationResult } = require('express-validator');
const CMS = require('../models/CMS');
const Course = require('../models/Course');

const router = express.Router();

// Validation rules
const cmsValidation = [
    body('section').isIn(['hero', 'about', 'courses', 'testimonials', 'carousel', 'offers']).withMessage('Invalid section'),
    body('data').isObject().withMessage('Data must be an object')
];

// GET /api/admin/cms - Get all CMS content
router.get('/', async (req, res) => {
    try {
        const { section } = req.query;

        const filter = {};
        if (section) {
            filter.section = section;
        }

        const cmsContent = await CMS.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: cmsContent
        });

    } catch (error) {
        console.error('Get CMS content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch CMS content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/cms/:section - Get specific section content
router.get('/:section', async (req, res) => {
    try {
        const { section } = req.params;

        if (!['hero', 'about', 'courses', 'testimonials', 'carousel', 'offers'].includes(section)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid section'
            });
        }

        const cmsContent = await CMS.findOne({ section }).sort({ createdAt: -1 });

        if (!cmsContent) {
            console.log(`No CMS content found for section: ${section}`);
            return res.status(404).json({
                success: false,
                message: 'CMS content not found for this section'
            });
        }

        if (section === 'offers') {
            console.log('Found offers section:');
            console.log('- Document ID:', cmsContent._id);
            console.log('- Created At:', cmsContent.createdAt);
            console.log('- Is Active:', cmsContent.isActive);
            console.log('- Number of offers:', cmsContent.data.offers?.length || 0);
            console.log('- Offers array:', JSON.stringify(cmsContent.data.offers, null, 2));

            // Ensure offers array exists and has the correct structure
            if (!cmsContent.data.offers) {
                cmsContent.data.offers = [];
            }

            // Map each offer to ensure consistent structure
            cmsContent.data.offers = cmsContent.data.offers.map(offer => ({
                id: offer.id,
                name: offer.name || offer.title,
                offer: offer.offer || offer.description,
                logo: offer.logo,
                color: offer.color,
                discount: offer.discount || '',
                validUntil: offer.validUntil || '',
                isActive: typeof offer.isActive === 'boolean' ? offer.isActive : true
            }));
        }

        console.log(`Fetched ${section} content:`, JSON.stringify(cmsContent, null, 2));

        res.json({
            success: true,
            data: cmsContent
        });

    } catch (error) {
        console.error('Get CMS section error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch CMS section',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/cms - Create or update CMS content
router.post('/', cmsValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { section, data } = req.body;

        // Check if content for this section already exists
        let cmsContent = await CMS.findOne({ section });

        if (cmsContent) {
            // Update existing content
            cmsContent.data = data;
            await cmsContent.save();
        } else {
            // Create new content
            cmsContent = new CMS({ section, data });
            await cmsContent.save();
        }

        res.status(201).json({
            success: true,
            message: 'CMS content saved successfully',
            data: cmsContent
        });

    } catch (error) {
        console.error('Save CMS content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save CMS content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/cms/:id - Update specific CMS content
router.put('/:id', cmsValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const cmsContent = await CMS.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!cmsContent) {
            return res.status(404).json({
                success: false,
                message: 'CMS content not found'
            });
        }

        res.json({
            success: true,
            message: 'CMS content updated successfully',
            data: cmsContent
        });

    } catch (error) {
        console.error('Update CMS content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update CMS content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/cms/:id/toggle - Toggle CMS content active status
router.put('/:id/toggle', async (req, res) => {
    try {
        const cmsContent = await CMS.findById(req.params.id);

        if (!cmsContent) {
            return res.status(404).json({
                success: false,
                message: 'CMS content not found'
            });
        }

        cmsContent.isActive = !cmsContent.isActive;
        await cmsContent.save();

        res.json({
            success: true,
            message: `CMS content ${cmsContent.isActive ? 'activated' : 'deactivated'} successfully`,
            data: cmsContent
        });

    } catch (error) {
        console.error('Toggle CMS content status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle CMS content status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/admin/cms/:id - Delete CMS content
router.delete('/:id', async (req, res) => {
    try {
        const cmsContent = await CMS.findByIdAndDelete(req.params.id);

        if (!cmsContent) {
            return res.status(404).json({
                success: false,
                message: 'CMS content not found'
            });
        }

        res.json({
            success: true,
            message: 'CMS content deleted successfully'
        });

    } catch (error) {
        console.error('Delete CMS content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete CMS content',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/cms/courses - Add course to CMS
router.post('/courses', async (req, res) => {
    try {
        const { title, description, instructor, price, duration, level, category, image, rating, students, tags } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        // Find or create courses section
        let coursesSection = await CMS.findOne({ section: 'courses' });

        if (!coursesSection) {
            coursesSection = new CMS({
                section: 'courses',
                data: { courses: [] }
            });
        }

        const newCourse = {
            id: Date.now(), // Simple ID generation
            title,
            description,
            image: image || 'default-course.jpg'
        };

        coursesSection.data.courses.push(newCourse);
        await coursesSection.save();

        // Also add to the courses collection with full course details
        if (instructor && price && duration && level && category) {
            const fullCourseData = {
                title,
                description,
                instructor,
                price,
                duration,
                level,
                category,
                image: image || 'default-course.jpg',
                rating: rating || 0,
                students: students || 0,
                tags: tags || [],
                isActive: true
            };

            const newFullCourse = new Course(fullCourseData);
            await newFullCourse.save();
        }

        res.status(201).json({
            success: true,
            message: 'Course added successfully',
            data: newCourse
        });

    } catch (error) {
        console.error('Add course to CMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add course to CMS',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/cms/testimonials - Add testimonial to CMS
router.post('/testimonials', async (req, res) => {
    try {
        const { name, role, content, avatar } = req.body;

        if (!name || !role || !content) {
            return res.status(400).json({
                success: false,
                message: 'Name, role, and content are required'
            });
        }

        // Find or create testimonials section
        let testimonialsSection = await CMS.findOne({ section: 'testimonials' });

        if (!testimonialsSection) {
            testimonialsSection = new CMS({
                section: 'testimonials',
                data: { testimonials: [] }
            });
        }

        const newTestimonial = {
            id: Date.now(), // Simple ID generation
            name,
            role,
            content,
            avatar: avatar || 'default-avatar.jpg'
        };

        testimonialsSection.data.testimonials.push(newTestimonial);
        await testimonialsSection.save();

        res.status(201).json({
            success: true,
            message: 'Testimonial added successfully',
            data: newTestimonial
        });

    } catch (error) {
        console.error('Add testimonial to CMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add testimonial to CMS',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/cms/carousel - Add carousel item to CMS
router.post('/carousel', async (req, res) => {
    try {
        const { title, subtitle, description, image, teacherName, teacherRole, teacherImage } = req.body;

        if (!title || !subtitle) {
            return res.status(400).json({
                success: false,
                message: 'Title and subtitle are required'
            });
        }

        // Find or create carousel section
        let carouselSection = await CMS.findOne({ section: 'carousel' });

        if (!carouselSection) {
            carouselSection = new CMS({
                section: 'carousel',
                data: { carouselItems: [] }
            });
        }

        const newCarouselItem = {
            id: Date.now(), // Simple ID generation
            title,
            subtitle,
            description: description || '',
            image: image || 'default-carousel.jpg',
            teacher: {
                name: teacherName || '',
                role: teacherRole || '',
                image: teacherImage || 'default-teacher.jpg'
            }
        };

        carouselSection.data.carouselItems.push(newCarouselItem);
        await carouselSection.save();

        res.status(201).json({
            success: true,
            message: 'Carousel item added successfully',
            data: newCarouselItem
        });

    } catch (error) {
        console.error('Add carousel item to CMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add carousel item to CMS',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/admin/cms/offers/:id - Delete offer from CMS
router.delete('/offers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting offer with ID:', id);

        // Find the offers section
        const offersSection = await CMS.findOne({ section: 'offers' });
        if (!offersSection || !offersSection.data || !offersSection.data.offers) {
            return res.status(404).json({
                success: false,
                message: 'Offers section not found'
            });
        }

        console.log('Current offers:', JSON.stringify(offersSection.data.offers, null, 2));
        console.log('Looking for offer with ID:', id);
        
        // Find the offer index
        const offerIndex = offersSection.data.offers.findIndex(offer => {
            console.log('Comparing offer ID:', offer.id, 'with:', id);
            return offer.id.toString() === id.toString()
        });
        
        console.log('Found offer at index:', offerIndex);
        
        if (offerIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        // Remove the offer from the array
        const removedOffer = offersSection.data.offers.splice(offerIndex, 1)[0];
        console.log('Removed offer:', JSON.stringify(removedOffer, null, 2));
        console.log('Updated offers array:', JSON.stringify(offersSection.data.offers, null, 2));

        // Use findOneAndUpdate for atomic operation
        const updatedSection = await CMS.findOneAndUpdate(
            { section: 'offers' },
            { 
                $set: { 
                    'data.offers': offersSection.data.offers,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
        
        console.log('Updated document:', JSON.stringify(updatedSection, null, 2));

        res.json({
            success: true,
            message: 'Offer deleted successfully'
        });

    } catch (error) {
        console.error('Delete offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete offer',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/cms/offers - Add offer to CMS
router.post('/offers', async (req, res) => {
    try {
        console.log('Received offer creation request:', req.body);
        const { name, offer, logo, color, discount, validUntil, isActive = true } = req.body;

        if (!name || !offer) {
            console.log('Validation failed: missing name or offer');
            return res.status(400).json({
                success: false,
                message: 'Company name and offer description are required'
            });
        }

        // Find or create offers section with explicit projection
        let offersSection = await CMS.findOne({ section: 'offers' }).lean();

        // Log the raw document from MongoDB
        console.log('Raw document from MongoDB:', JSON.stringify(offersSection, null, 2));

        if (!offersSection) {
            // Create new document
            offersSection = {
                section: 'offers',
                data: { offers: [] },
                isActive: true
            };
        } else if (!offersSection.data || !offersSection.data.offers) {
            // Fix missing data structure
            offersSection.data = { offers: [] };
        }

        // Create new CMS document or update existing one
        const newOffer = {
            id: Date.now(),
            name,
            offer,
            logo: logo || name.substring(0, 2).toUpperCase(),
            color: color || 'from-blue-500 to-blue-600',
            discount: discount || '',
            validUntil: validUntil || '',
            isActive
        };

        // Get existing offers and ensure they have the correct structure
        const existingOffers = (offersSection.data.offers || []).map(offer => ({
            id: offer.id,
            name: offer.name || offer.title,
            offer: offer.offer || offer.description,
            logo: offer.logo,
            color: offer.color,
            discount: offer.discount || '',
            validUntil: offer.validUntil || '',
            isActive: typeof offer.isActive === 'boolean' ? offer.isActive : true
        }));

        // Add new offer to the array
        existingOffers.push(newOffer);

        // Create update operation
        const updateOperation = {
            $set: {
                section: 'offers',
                'data.offers': existingOffers,
                isActive: true,
                updatedAt: new Date()
            }
        };

        // Log the update operation
        console.log('Update operation:', JSON.stringify(updateOperation, null, 2));

        // Use findOneAndUpdate to ensure atomic operation
        const savedSection = await CMS.findOneAndUpdate(
            { section: 'offers' },
            updateOperation,
            { 
                new: true,  // Return updated document
                upsert: true,  // Create if doesn't exist
                runValidators: true  // Run schema validation
            }
        );
        console.log('Saved offers section:', JSON.stringify(savedSection, null, 2));

        res.status(201).json({
            success: true,
            message: 'Offer added successfully',
            data: newOffer
        });

    } catch (error) {
        console.error('Add offer to CMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add offer to CMS',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
