const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const CMS = require('../models/CMS');
const Course = require('../models/Course');
const edgestoreHandler = require('./edgestore');
const { cacheMiddleware, clearCacheBySection } = require('../middleware/cache');
const { CarouselItem, DEFAULT_TEACHER_IMAGE } = require('../models/CarouselItem');
const { syncCarouselItems, formatCarouselItem } = require('../utils/syncCarouselItems');

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

const resolveCarouselItemById = async (id) => {
    if (!id) return null;

    if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await CarouselItem.findById(id);
        if (doc) return doc;
    }

    return CarouselItem.findOne({ legacyId: String(id) });
};

// Validation rules
const cmsValidation = [
    body('section').isIn(['hero', 'about', 'courses', 'carousel', 'offers', 'testimonials', 'ongoingCourses']).withMessage('Invalid section'),
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

// GET /api/admin/cms/:section - Get specific section content (cached for 5 minutes)
router.get('/:section', cacheMiddleware(5 * 60 * 1000), async (req, res) => {
    try {
        const { section } = req.params;

        if (!['hero', 'about', 'courses', 'carousel', 'offers', 'testimonials', 'ongoingCourses'].includes(section)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid section'
            });
        }

        // ROOT CAUSE FIX: ALWAYS get ALL documents and merge ALL items
        const allDocuments = await CMS.find({ section }).lean();
        
        console.log(`[CMS GET ${section}] Found ${allDocuments.length} document(s)`);
        
        let cmsContent = null;
        let allItems = [];
        
        if (allDocuments.length === 0) {
            cmsContent = null;
        } else {
            // ALWAYS merge ALL documents - this is the fix
            cmsContent = allDocuments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

            if (section === 'carousel' && (!cmsContent?.data || !Array.isArray(cmsContent.data.carouselItems))) {
                await syncCarouselItems();
                const refreshedDoc = await CMS.findOne({ section }).lean();
                if (refreshedDoc) {
                    cmsContent = refreshedDoc;
                    allDocuments.splice(0, allDocuments.length, refreshedDoc);
                }
            }
            
            // Merge ALL items from ALL documents
            if (section === 'carousel') {
                allDocuments.forEach(doc => {
                    if (doc.data?.carouselItems && Array.isArray(doc.data.carouselItems)) {
                        allItems.push(...doc.data.carouselItems);
                    }
                });
                // Remove duplicates by ID, keep latest
                const itemMap = new Map();
                allItems.forEach(item => {
                    if (item.id) {
                        itemMap.set(item.id, item);
                    }
                });
                cmsContent.data.carouselItems = Array.from(itemMap.values());
                console.log(`[CMS GET ${section}] Merged ${allItems.length} total items into ${cmsContent.data.carouselItems.length} unique items`);
            } else if (section === 'offers') {
                allDocuments.forEach(doc => {
                    if (doc.data?.offers && Array.isArray(doc.data.offers)) {
                        allItems.push(...doc.data.offers);
                    }
                });
                const itemMap = new Map();
                allItems.forEach(item => {
                    if (item.id) {
                        itemMap.set(item.id, item);
                    }
                });
                cmsContent.data.offers = Array.from(itemMap.values());
            } else if (section === 'testimonials') {
                allDocuments.forEach(doc => {
                    if (doc.data?.testimonials && Array.isArray(doc.data.testimonials)) {
                        allItems.push(...doc.data.testimonials);
                    }
                });
                const itemMap = new Map();
                allItems.forEach(item => {
                    if (item.id) {
                        itemMap.set(item.id, item);
                    }
                });
                cmsContent.data.testimonials = Array.from(itemMap.values());
            } else if (section === 'ongoingCourses') {
                allDocuments.forEach(doc => {
                    if (doc.data?.ongoingCourses && Array.isArray(doc.data.ongoingCourses)) {
                        allItems.push(...doc.data.ongoingCourses);
                    }
                });
                const itemMap = new Map();
                allItems.forEach(item => {
                    const id = item.id || item.slotId;
                    if (id) {
                        itemMap.set(id, item);
                    }
                });
                cmsContent.data.ongoingCourses = Array.from(itemMap.values());
            }
        }
        
        // Debug logging
        if (cmsContent && cmsContent.data) {
            const count = section === 'carousel' ? cmsContent.data.carouselItems?.length || 0 :
                         section === 'offers' ? cmsContent.data.offers?.length || 0 :
                         section === 'testimonials' ? cmsContent.data.testimonials?.length || 0 :
                         cmsContent.data.ongoingCourses?.length || 0;
            console.log(`[CMS GET ${section}] RETURNING ${count} items from ${allDocuments.length} document(s)`);
            if (section === 'carousel' && cmsContent.data.carouselItems) {
                console.log(`[CMS GET ${section}] Carousel items:`, JSON.stringify(cmsContent.data.carouselItems.map(item => ({
                    id: item.id,
                    teacherName: item.teacher?.name,
                    hasImage: !!item.teacher?.image
                })), null, 2));
            }
        }

        // Return empty structure instead of 404 to prevent caching 404 responses
        if (!cmsContent) {
            // Return empty data structure based on section type
            let emptyData = {};
            
            switch(section) {
                case 'carousel':
                    emptyData = { carouselItems: [] };
                    break;
                case 'offers':
                    emptyData = { offers: [] };
                    break;
                case 'testimonials':
                    emptyData = { testimonials: [] };
                    break;
                case 'ongoingCourses':
                    emptyData = { ongoingCourses: [] };
                    break;
                case 'courses':
                    emptyData = { courses: [] };
                    break;
                default:
                    emptyData = {};
            }
            
            return res.json({
                success: true,
                data: {
                    section: section,
                    data: emptyData,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
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
        
        // Normalize testimonials shape
        if (section === 'testimonials') {
            if (!cmsContent.data.testimonials) cmsContent.data.testimonials = [];
            cmsContent.data.testimonials = cmsContent.data.testimonials.map(t => ({
                id: t.id,
                name: t.name || '',
                role: t.role || '',
                quote: t.quote || t.text || '',
                image: t.image || '',
                rating: typeof t.rating === 'number' ? t.rating : 5,
                isActive: typeof t.isActive === 'boolean' ? t.isActive : true
            }));
        }

        // Normalize ongoing courses shape
        if (section === 'ongoingCourses') {
            if (!cmsContent.data.ongoingCourses) cmsContent.data.ongoingCourses = [];
            cmsContent.data.ongoingCourses = cmsContent.data.ongoingCourses.map(course => ({
                id: course.id,
                name: course.name || course.title || '',
                title: course.title || course.name || '',
                offer: course.offer || course.description || '',
                description: course.description || course.offer || '',
                slotId: course.slotId || '',
                courseId: course.courseId || '',
                color: course.color || 'from-blue-500 to-blue-600',
                isActive: typeof course.isActive === 'boolean' ? course.isActive : true,
                isHidden: typeof course.isHidden === 'boolean' ? course.isHidden : false,
                availableSeats: course.availableSeats || 0,
                capacity: course.capacity || 0,
                enrolledStudents: course.enrolledStudents || 0,
                instructor: course.instructor || '',
                class: course.class || 0,
                subject: course.subject || '',
                type: course.type || '',
                location: course.location || '',
                days: course.days || [],
                startTime: course.startTime || '',
                endTime: course.endTime || ''
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

        // Clear cache for this section
        clearCacheBySection(section);

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

        // Clear cache for this section
        clearCacheBySection(cmsContent.section);

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

        // Clear cache for this section
        clearCacheBySection(cmsContent.section);

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

        // Clear cache for this section
        clearCacheBySection(cmsContent.section);

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
        const { teacherName, description, teacherImage, scheduleImage, schedule1Image, schedule2Image } = req.body;

        if (!teacherName || !description) {
            return res.status(400).json({
                success: false,
                message: 'Teacher name and description are required'
            });
        }

        const carouselItem = new CarouselItem({
            teacherName: teacherName.trim(),
            description: description.trim(),
            teacherImage: (teacherImage && teacherImage.trim()) || DEFAULT_TEACHER_IMAGE,
            scheduleImage: scheduleImage || '',
            schedule1Image: schedule1Image || '',
            schedule2Image: schedule2Image || ''
        });

        await carouselItem.save();

        const formattedItem = formatCarouselItem(carouselItem.toObject());

        await syncCarouselItems();

        res.status(201).json({
            success: true,
            message: 'Carousel item added successfully',
            data: formattedItem
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
        const { teacherName, description, teacherImage, scheduleImage, schedule1Image, schedule2Image } = req.body;

        if (!teacherName || !description) {
            return res.status(400).json({
                success: false,
                message: 'Teacher name and description are required'
            });
        }

        const carouselItem = await resolveCarouselItemById(id);

        if (!carouselItem) {
            return res.status(404).json({
                success: false,
                message: 'Carousel item not found'
            });
        }

        carouselItem.teacherName = teacherName.trim();
        carouselItem.description = description.trim();
        carouselItem.teacherImage = (teacherImage && teacherImage.trim()) || carouselItem.teacherImage || DEFAULT_TEACHER_IMAGE;
        carouselItem.scheduleImage = scheduleImage || carouselItem.scheduleImage || '';
        carouselItem.schedule1Image = schedule1Image || carouselItem.schedule1Image || carouselItem.scheduleImage || '';
        carouselItem.schedule2Image = schedule2Image || carouselItem.schedule2Image || '';

        await carouselItem.save();

        const formattedItem = formatCarouselItem(carouselItem.toObject());

        await syncCarouselItems();

        res.json({
            success: true,
            message: 'Carousel item updated successfully',
            data: formattedItem
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

        const carouselItem = await resolveCarouselItemById(id);

        if (!carouselItem) {
            return res.status(404).json({
                success: false,
                message: 'Carousel item not found'
            });
        }

        // Delete images from EdgeStore
        const teacherImage = carouselItem.teacherImage;
        const scheduleImage = carouselItem.scheduleImage;
        const schedule1Image = carouselItem.schedule1Image;
        const schedule2Image = carouselItem.schedule2Image;

        if (teacherImage && (teacherImage.includes('edgestore') || teacherImage.includes('publicFiles'))) {
            await deleteImageFromEdgeStore(teacherImage);
        }

        if (scheduleImage && (scheduleImage.includes('edgestore') || scheduleImage.includes('publicFiles'))) {
            await deleteImageFromEdgeStore(scheduleImage);
        }

        if (schedule1Image && (schedule1Image.includes('edgestore') || schedule1Image.includes('publicFiles'))) {
            await deleteImageFromEdgeStore(schedule1Image);
        }

        if (schedule2Image && (schedule2Image.includes('edgestore') || schedule2Image.includes('publicFiles'))) {
            await deleteImageFromEdgeStore(schedule2Image);
        }

        await CarouselItem.deleteOne({ _id: carouselItem._id });

        await syncCarouselItems();

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

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Offer name is required'
            });
        }

        const offersSection = await CMS.findOne({ section: 'offers' });
        if (!offersSection || !offersSection.data || !offersSection.data.offers) {
            return res.status(404).json({
                success: false,
                message: 'Offers section not found'
            });
        }

        // Ensure data structure exists
        if (!offersSection.data.offers || !Array.isArray(offersSection.data.offers) || offersSection.data.offers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No offers found. The offers list is empty.',
                debug: process.env.NODE_ENV === 'development' ? {
                    requestedId: id,
                    sectionExists: true,
                    offersCount: 0
                } : undefined
            });
        }

        // Try to parse ID as number (for Date.now() IDs) or keep as string (for MongoDB ObjectIds)
        let offerId = parseInt(id, 10);
        const isNumericId = !isNaN(offerId);
        if (!isNumericId) {
            offerId = id; // Keep as string for MongoDB ObjectId
        }

        // Find the offer index - try multiple comparison methods
        const offerIndex = offersSection.data.offers.findIndex(offerItem => {
            if (!offerItem || offerItem.id === undefined || offerItem.id === null) {
                return false;
            }
            
            // Handle different ID formats
            if (isNumericId) {
                // Numeric ID comparison (Date.now())
                const offerIdValue = typeof offerItem.id === 'number' ? offerItem.id : parseInt(offerItem.id, 10);
                return !isNaN(offerIdValue) && (
                    offerIdValue === offerId || 
                    offerItem.id === offerId || 
                    String(offerItem.id) === String(id) ||
                    String(offerIdValue) === String(id)
                );
            } else {
                // String/ObjectId comparison
                return (
                    String(offerItem.id) === String(id) ||
                    offerItem.id === id ||
                    offerItem.id?.toString() === id.toString() ||
                    offerItem._id?.toString() === id.toString()
                );
            }
        });
        
        if (offerIndex === -1) {
            // Log available offer IDs for debugging
            const availableIds = offersSection.data.offers
                .filter(o => o && o.id !== undefined && o.id !== null)
                .map((o, idx) => ({
                    index: idx,
                    id: o.id,
                    idType: typeof o.id,
                    idString: String(o.id),
                    name: o.name || 'Unnamed'
                }));
            
            return res.status(404).json({
                success: false,
                message: 'Offer not found',
                debug: process.env.NODE_ENV === 'development' ? {
                    requestedId: id,
                    requestedIdParsed: isNumericId ? offerId : 'string',
                    totalOffers: offersSection.data.offers.length,
                    availableOffers: availableIds
                } : undefined
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

        // Clear cache
        clearCacheBySection('offers');

        res.json({
            success: true,
            message: 'Offer updated successfully',
            data: offersSection.data.offers[offerIndex]
        });

    } catch (error) {
        console.error('Error updating offer:', error);
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
        if (!offersSection) {
            return res.status(404).json({
                success: false,
                message: 'Offers section not found'
            });
        }

        // Ensure data structure exists
        if (!offersSection.data) {
            offersSection.data = { offers: [] };
        }
        if (!offersSection.data.offers) {
            offersSection.data.offers = [];
        }

        // Check if offers array is empty
        if (!Array.isArray(offersSection.data.offers) || offersSection.data.offers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No offers found. The offers list is empty.',
                debug: process.env.NODE_ENV === 'development' ? {
                    requestedId: id,
                    sectionExists: true,
                    offersCount: 0
                } : undefined
            });
        }
        
        // Convert ID to number for comparison (since offers use Date.now() which returns a number)
        const offerId = parseInt(id, 10);
        if (isNaN(offerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid offer ID format'
            });
        }

        // Find the offer index - try multiple comparison methods
        const offerIndex = offersSection.data.offers.findIndex(offer => {
            if (!offer || offer.id === undefined || offer.id === null) {
                return false;
            }
            // Handle different ID formats
            const offerIdValue = typeof offer.id === 'number' ? offer.id : parseInt(offer.id, 10);
            return !isNaN(offerIdValue) && (
                offerIdValue === offerId || 
                offer.id === offerId || 
                String(offer.id) === String(id) ||
                String(offerIdValue) === String(id)
            );
        });
        
        if (offerIndex === -1) {
            // Log available offer IDs for debugging
            const availableIds = offersSection.data.offers
                .filter(o => o && o.id !== undefined && o.id !== null)
                .map((o, idx) => ({
                    index: idx,
                    id: o.id,
                    idType: typeof o.id,
                    idString: String(o.id),
                    name: o.name || 'Unnamed'
                }));
            
            return res.status(404).json({
                success: false,
                message: `Offer with ID ${id} not found. The offer may have already been deleted or the ID is incorrect.`,
                debug: process.env.NODE_ENV === 'development' ? {
                    requestedId: id,
                    requestedIdParsed: offerId,
                    totalOffers: offersSection.data.offers.length,
                    availableOffers: availableIds
                } : undefined
            });
        }

        // Remove the offer from the array
        const removedOffer = offersSection.data.offers[offerIndex];
        offersSection.data.offers.splice(offerIndex, 1);

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

        // Clear cache
        clearCacheBySection('offers');

        res.json({
            success: true,
            message: 'Offer deleted successfully',
            data: removedOffer
        });

    } catch (error) {
        console.error('Error deleting offer:', error);
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

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Offer name is required'
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
        
        // Clear cache
        clearCacheBySection('offers');

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

// TESTIMONIALS CRUD
// POST /api/admin/cms/testimonials - Add testimonial
router.post('/testimonials', async (req, res) => {
    try {
        const { name, role, quote, image, rating = 5, isActive = true } = req.body;

        if (!name || !quote) {
            return res.status(400).json({ success: false, message: 'Name and quote are required' });
        }

        let section = await CMS.findOne({ section: 'testimonials' }).lean();
        if (!section) {
            section = { section: 'testimonials', data: { testimonials: [] }, isActive: true };
        } else if (!section.data || !section.data.testimonials) {
            section.data = { testimonials: [] };
        }

        const newItem = {
            id: Date.now(),
            name,
            role: role || '',
            quote,
            image: image || '',
            rating: Number(rating) || 5,
            isActive
        };

        const existing = (section.data.testimonials || []).map(t => ({
            id: t.id,
            name: t.name || '',
            role: t.role || '',
            quote: t.quote || t.text || '',
            image: t.image || '',
            rating: typeof t.rating === 'number' ? t.rating : 5,
            isActive: typeof t.isActive === 'boolean' ? t.isActive : true
        }));

        existing.push(newItem);

        const saved = await CMS.findOneAndUpdate(
            { section: 'testimonials' },
            { $set: { section: 'testimonials', 'data.testimonials': existing, isActive: true, updatedAt: new Date() } },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(201).json({ success: true, message: 'Testimonial added successfully', data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add testimonial', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
    }
});

// PUT /api/admin/cms/testimonials/:id - Update testimonial
router.put('/testimonials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, quote, image, rating = 5, isActive = true } = req.body;

        const section = await CMS.findOne({ section: 'testimonials' });
        if (!section || !section.data || !section.data.testimonials) {
            return res.status(404).json({ success: false, message: 'Testimonials section not found' });
        }

        const idx = section.data.testimonials.findIndex(t => t.id.toString() === id.toString());
        if (idx === -1) return res.status(404).json({ success: false, message: 'Testimonial not found' });

        section.data.testimonials[idx] = {
            id: section.data.testimonials[idx].id,
            name: name || '',
            role: role || '',
            quote: quote || '',
            image: image || section.data.testimonials[idx].image || '',
            rating: Number(rating) || 5,
            isActive
        };

        await CMS.findOneAndUpdate(
            { section: 'testimonials' },
            { $set: { 'data.testimonials': section.data.testimonials, updatedAt: new Date() } },
            { new: true }
        );

        res.json({ success: true, message: 'Testimonial updated successfully', data: section.data.testimonials[idx] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update testimonial', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
    }
});

// DELETE /api/admin/cms/testimonials/:id - Delete testimonial
router.delete('/testimonials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const section = await CMS.findOne({ section: 'testimonials' });
        if (!section || !section.data || !section.data.testimonials) {
            return res.status(404).json({ success: false, message: 'Testimonials section not found' });
        }

        const idx = section.data.testimonials.findIndex(t => t.id.toString() === id.toString());
        if (idx === -1) return res.status(404).json({ success: false, message: 'Testimonial not found' });

        section.data.testimonials.splice(idx, 1);
        await CMS.findOneAndUpdate(
            { section: 'testimonials' },
            { $set: { 'data.testimonials': section.data.testimonials, updatedAt: new Date() } },
            { new: true }
        );

        res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete testimonial', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
    }
});

// PUT /api/admin/cms/ongoingCourses/:id - Update ongoing batch (only affects CMS display, not the actual batch)
router.put('/ongoingCourses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, title, offer, description, color, isActive } = req.body;

        const section = await CMS.findOne({ section: 'ongoingCourses' });
        if (!section || !section.data || !section.data.ongoingCourses) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ongoing batches section not found' 
            });
        }

        const courseIndex = section.data.ongoingCourses.findIndex(c => c.id === id || c.slotId === id);
        if (courseIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ongoing batch not found' 
            });
        }

        // Update only display fields, preserve slot data
        const course = section.data.ongoingCourses[courseIndex];
        section.data.ongoingCourses[courseIndex] = {
            ...course,
            name: name !== undefined ? name : course.name,
            title: title !== undefined ? title : course.title,
            offer: offer !== undefined ? offer : course.offer,
            description: description !== undefined ? description : course.description,
            color: color !== undefined ? color : course.color,
            isActive: isActive !== undefined ? isActive : course.isActive
        };

        await CMS.findOneAndUpdate(
            { section: 'ongoingCourses' },
            { $set: { 'data.ongoingCourses': section.data.ongoingCourses, updatedAt: new Date() } },
            { new: true }
        );

        clearCacheBySection('ongoingCourses');

        res.json({ 
            success: true, 
            message: 'Ongoing batch updated successfully', 
            data: section.data.ongoingCourses[courseIndex] 
        });
    } catch (error) {
        console.error('Error updating ongoing batch:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update ongoing batch', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
        });
    }
});

// DELETE /api/admin/cms/ongoingCourses/:id - Hide ongoing batch from carousel (does NOT delete the actual batch)
router.delete('/ongoingCourses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const section = await CMS.findOne({ section: 'ongoingCourses' });
        if (!section || !section.data || !section.data.ongoingCourses) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ongoing batches section not found' 
            });
        }

        const courseIndex = section.data.ongoingCourses.findIndex(c => c.id === id || c.slotId === id);
        if (courseIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ongoing batch not found' 
            });
        }

        // Mark as hidden instead of deleting (preserves batch, just hides from carousel)
        section.data.ongoingCourses[courseIndex].isHidden = true;
        section.data.ongoingCourses[courseIndex].isActive = false;

        await CMS.findOneAndUpdate(
            { section: 'ongoingCourses' },
            { $set: { 'data.ongoingCourses': section.data.ongoingCourses, updatedAt: new Date() } },
            { new: true }
        );

        clearCacheBySection('ongoingCourses');

        res.json({ 
            success: true, 
            message: 'Ongoing batch removed from carousel (batch not deleted)', 
            data: section.data.ongoingCourses[courseIndex] 
        });
    } catch (error) {
        console.error('Error deleting ongoing batch:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to remove ongoing batch', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
        });
    }
});

module.exports = router;
