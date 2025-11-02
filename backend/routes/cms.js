const express = require('express');
const { body, validationResult } = require('express-validator');
const CMS = require('../models/CMS');
const Course = require('../models/Course');
const edgestoreHandler = require('./edgestore');

// Initialize EdgeStore backend client for deleting files
const { initEdgeStoreClient } = require('@edgestore/server/core');
const backendClient = initEdgeStoreClient({
  accessKey: process.env.EDGE_STORE_ACCESS_KEY,
  secretKey: process.env.EDGE_STORE_SECRET_KEY,
});

const router = express.Router();

// Helper function to delete image from EdgeStore
const deleteImageFromEdgeStore = async (url) => {
    try {
        // Determine which bucket the URL belongs to
        if (url.includes('edgestore') || url.includes('publicFiles')) {
            // Try Teachers bucket first (since carousel images are in Teachers bucket)
            try {
                await backendClient.Teachers.delete({ url });
                return true;
            } catch (err) {
                // If Teachers fails, try Courses bucket
                try {
                    await backendClient.Courses.delete({ url });
                    return true;
                } catch (err2) {
                    console.error('Error deleting from both buckets:', err2.message);
                    return false;
                }
            }
        }
        return true; // Not an EdgeStore URL, return success
    } catch (error) {
        console.error('Error deleting image from EdgeStore:', error.message);
        return false;
    }
};

// Validation rules
const cmsValidation = [
    body('section').isIn(['hero', 'about', 'courses', 'carousel', 'offers']).withMessage('Invalid section'),
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

        if (!['hero', 'about', 'courses', 'carousel', 'offers'].includes(section)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid section'
            });
        }

        const cmsContent = await CMS.findOne({ section }).sort({ createdAt: -1 });

        if (!cmsContent) {
            
            return res.status(404).json({
                success: false,
                message: 'CMS content not found for this section'
            });
        }

        if (section === 'offers') {
            

            // Ensure offers array exists and has the correct structure
            if (!cmsContent.data.offers) {
                cmsContent.data.offers = [];
            }

        // Map each offer to ensure consistent structure
        cmsContent.data.offers = cmsContent.data.offers.map(offer => ({
          id: offer.id,
          name: offer.name || offer.title,
          offer: offer.offer || offer.description,
          slotId: offer.slotId || '',
          courseId: offer.courseId || '',
          color: offer.color,
          discount: offer.discount || '',
          validUntil: offer.validUntil || '',
          isActive: typeof offer.isActive === 'boolean' ? offer.isActive : true
        }));
        }

        

        res.json({
            success: true,
            data: cmsContent
        });

    } catch (error) {
        
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
        const { title, description, instructor, price, class: courseClass, image } = req.body;

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
        if (instructor && price && courseClass) {
            const fullCourseData = {
                title,
                description,
                instructor,
                price,
                class: courseClass,
                duration: '', // Default empty since field was removed
                category: '', // Default empty since field was removed
                image: image || 'default-course.jpg',
                rating: 0,
                students: 0,
                tags: [],
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
        
        res.status(500).json({
            success: false,
            message: 'Failed to add course to CMS',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/cms/carousel - Add carousel item to CMS
router.post('/carousel', async (req, res) => {
    try {
        
        const { teacherName, description, teacherImage, scheduleImage } = req.body;

        if (!teacherName || !description) {
            return res.status(400).json({
                success: false,
                message: 'Teacher name and description are required'
            });
        }

        // Find or get carousel section
        let carouselSection = await CMS.findOne({ section: 'carousel' }).lean();

        

        if (!carouselSection) {
            carouselSection = {
                section: 'carousel',
                data: { carouselItems: [] }
            };
        }

        // Ensure data structure exists
        if (!carouselSection.data || !carouselSection.data.carouselItems) {
            carouselSection.data = { carouselItems: [] };
        }

        const newCarouselItem = {
            id: Date.now(), // Simple ID generation
            teacher: {
                name: teacherName,
                description: description,
                image: teacherImage || 'https://via.placeholder.com/300x300?text=Teacher',
                scheduleImage: scheduleImage || ''
            }
        };

        

        // Get existing items and add new one
        const existingItems = carouselSection.data.carouselItems || [];
        existingItems.push(newCarouselItem);

        

        // Use findOneAndUpdate for atomic operation
        const savedSection = await CMS.findOneAndUpdate(
            { section: 'carousel' },
            {
                $set: {
                    section: 'carousel',
                    'data.carouselItems': existingItems,
                    isActive: true,
                    updatedAt: new Date()
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        

        res.status(201).json({
            success: true,
            message: 'Carousel item added successfully',
            data: newCarouselItem
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Failed to add carousel item to CMS',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/cms/carousel/:id - Update carousel item
router.put('/carousel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherName, description, teacherImage, scheduleImage } = req.body;

        if (!teacherName || !description) {
            return res.status(400).json({
                success: false,
                message: 'Teacher name and description are required'
            });
        }

        const carouselSection = await CMS.findOne({ section: 'carousel' });
        if (!carouselSection || !carouselSection.data || !carouselSection.data.carouselItems) {
            return res.status(404).json({
                success: false,
                message: 'Carousel section not found'
            });
        }

        const itemIndex = carouselSection.data.carouselItems.findIndex(item => item.id.toString() === id.toString());
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Carousel item not found'
            });
        }

        // Update the carousel item
        carouselSection.data.carouselItems[itemIndex] = {
            id: carouselSection.data.carouselItems[itemIndex].id,
            teacher: {
                name: teacherName,
                description: description,
                image: teacherImage || 'https://via.placeholder.com/300x300?text=Teacher',
                scheduleImage: scheduleImage || ''
            }
        };

        const updatedSection = await CMS.findOneAndUpdate(
            { section: 'carousel' },
            { 
                $set: { 
                    'data.carouselItems': carouselSection.data.carouselItems,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Carousel item updated successfully',
            data: carouselSection.data.carouselItems[itemIndex]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update carousel item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/admin/cms/carousel/:id - Delete carousel item
router.delete('/carousel/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const carouselSection = await CMS.findOne({ section: 'carousel' });
        if (!carouselSection || !carouselSection.data || !carouselSection.data.carouselItems) {
            return res.status(404).json({
                success: false,
                message: 'Carousel section not found'
            });
        }

        const itemIndex = carouselSection.data.carouselItems.findIndex(item => item.id.toString() === id.toString());
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Carousel item not found'
            });
        }

        // Get the item to be deleted to extract image URLs
        const itemToDelete = carouselSection.data.carouselItems[itemIndex];
        
        // Delete images from EdgeStore
        const teacherImage = itemToDelete?.teacher?.image;
        const scheduleImage = itemToDelete?.teacher?.scheduleImage;
        
        // Delete teacher image from EdgeStore if it exists and is from EdgeStore
        if (teacherImage && (teacherImage.includes('edgestore') || teacherImage.includes('publicFiles'))) {
            await deleteImageFromEdgeStore(teacherImage);
        }
        
        // Delete schedule image from EdgeStore if it exists and is from EdgeStore
        if (scheduleImage && (scheduleImage.includes('edgestore') || scheduleImage.includes('publicFiles'))) {
            await deleteImageFromEdgeStore(scheduleImage);
        }

        carouselSection.data.carouselItems.splice(itemIndex, 1);

        const updatedSection = await CMS.findOneAndUpdate(
            { section: 'carousel' },
            { 
                $set: { 
                    'data.carouselItems': carouselSection.data.carouselItems,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Carousel item deleted successfully'
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Failed to delete carousel item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/cms/offers/:id - Update offer in CMS
router.put('/offers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, offer, slotId, courseId, color, discount, validUntil, isActive = true } = req.body;

        if (!name || !offer) {
            return res.status(400).json({
                success: false,
                message: 'Offer name and offer description are required'
            });
        }

        const offersSection = await CMS.findOne({ section: 'offers' });
        if (!offersSection || !offersSection.data || !offersSection.data.offers) {
            return res.status(404).json({
                success: false,
                message: 'Offers section not found'
            });
        }

        const offerIndex = offersSection.data.offers.findIndex(offerItem => 
            offerItem.id.toString() === id.toString()
        );
        
        if (offerIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        // Update the offer
        offersSection.data.offers[offerIndex] = {
            id: offersSection.data.offers[offerIndex].id,
            name,
            offer,
            slotId: slotId || '',
            courseId: courseId || '',
            color: color || 'from-blue-500 to-blue-600',
            discount: discount || '',
            validUntil: validUntil || '',
            isActive
        };

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

        res.json({
            success: true,
            message: 'Offer updated successfully',
            data: offersSection.data.offers[offerIndex]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update offer',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/admin/cms/offers/:id - Delete offer from CMS
router.delete('/offers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        

        // Find the offers section
        const offersSection = await CMS.findOne({ section: 'offers' });
        if (!offersSection || !offersSection.data || !offersSection.data.offers) {
            return res.status(404).json({
                success: false,
                message: 'Offers section not found'
            });
        }

        
        
        // Find the offer index
        const offerIndex = offersSection.data.offers.findIndex(offer => {
            
            return offer.id.toString() === id.toString()
        });
        
        
        
        if (offerIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        // Remove the offer from the array
        const removedOffer = offersSection.data.offers.splice(offerIndex, 1)[0];
        

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
        
        

        res.json({
            success: true,
            message: 'Offer deleted successfully'
        });

    } catch (error) {
        
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
        
        const { name, offer, slotId, courseId, color, discount, validUntil, isActive = true } = req.body;

        if (!name || !offer) {
        
            return res.status(400).json({
                success: false,
                message: 'Offer name and offer description are required'
            });
        }

        // Find or create offers section with explicit projection
        let offersSection = await CMS.findOne({ section: 'offers' }).lean();

        // Log the raw document from MongoDB
        

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
            slotId: slotId || '',
            courseId: courseId || '',
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
            slotId: offer.slotId || '',
            courseId: offer.courseId || '',
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
        

        res.status(201).json({
            success: true,
            message: 'Offer added successfully',
            data: newOffer
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Failed to add offer to CMS',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
