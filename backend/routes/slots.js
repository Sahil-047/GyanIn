const express = require('express');
const { body, validationResult } = require('express-validator');
const Slot = require('../models/Slot');

const router = express.Router();

// Validation rules
const slotValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Batch name must be at least 2 characters'),
  // Course removed from required fields
  body('subject').trim().isLength({ min: 2 }).withMessage('Subject must be at least 2 characters'),
  body('class').isInt({ min: 1, max: 12 }).withMessage('Class must be a number between 1 and 12'),
  body('type').isIn(['online', 'offline']).withMessage('Type must be online or offline'),
  // startTime and endTime removed from validation
  body('days').isArray({ min: 1 }).withMessage('At least one day must be selected'),
  body('capacity').isInt({ min: 1, max: 50 }).withMessage('Capacity must be between 1 and 50'),
  body('instructor').trim().isLength({ min: 2 }).withMessage('Teacher name must be at least 2 characters'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters')
];

// GET /api/admin/slots - Get all slots
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            course,
            instructor,
            isActive,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = {};

        if (course && course !== 'All') {
            filter.course = course;
        }

        if (instructor) {
            filter.instructor = { $regex: instructor, $options: 'i' };
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { course: { $regex: search, $options: 'i' } },
                { instructor: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const slots = await Slot.find(filter)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Slot.countDocuments(filter);

        res.json({
            success: true,
            data: slots,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch slots',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/slots/stats - Get slot statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            total,
            active,
            inactive,
            totalCapacity,
            totalEnrolled
        ] = await Promise.all([
            Slot.countDocuments(),
            Slot.countDocuments({ isActive: true }),
            Slot.countDocuments({ isActive: false }),
            Slot.aggregate([
                { $group: { _id: null, total: { $sum: '$capacity' } } }
            ]),
            Slot.aggregate([
                { $group: { _id: null, total: { $sum: '$enrolledStudents' } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                total,
                active,
                inactive,
                totalCapacity: totalCapacity[0]?.total || 0,
                totalEnrolled: totalEnrolled[0]?.total || 0
            }
        });

    } catch (error) {
        console.error('Get slot stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch slot statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/slots/:id - Get single slot
router.get('/:id', async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        res.json({
            success: true,
            data: slot
        });

    } catch (error) {
        console.error('Get slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch slot',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/slots - Create new slot
router.post('/', slotValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const slot = new Slot(req.body);
        await slot.save();

        res.status(201).json({
            success: true,
            message: 'Slot created successfully',
            data: slot
        });

    } catch (error) {
        console.error('Create slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create slot',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/slots/:id - Update slot
router.put('/:id', slotValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        res.json({
            success: true,
            message: 'Slot updated successfully',
            data: slot
        });

    } catch (error) {
        console.error('Update slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update slot',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/slots/:id/toggle - Toggle slot active status
router.put('/:id/toggle', async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        slot.isActive = !slot.isActive;
        await slot.save();

        res.json({
            success: true,
            message: `Slot ${slot.isActive ? 'activated' : 'deactivated'} successfully`,
            data: slot
        });

    } catch (error) {
        console.error('Toggle slot status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle slot status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/slots/:id/enroll - Update enrolled students count
router.put('/:id/enroll', async (req, res) => {
    try {
        const { enrolledStudents } = req.body;

        if (typeof enrolledStudents !== 'number' || enrolledStudents < 0) {
            return res.status(400).json({
                success: false,
                message: 'Enrolled students must be a non-negative number'
            });
        }

        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        if (enrolledStudents > slot.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Enrolled students cannot exceed slot capacity'
            });
        }

        slot.enrolledStudents = enrolledStudents;
        await slot.save();

        res.json({
            success: true,
            message: 'Enrolled students updated successfully',
            data: slot
        });

    } catch (error) {
        console.error('Update enrolled students error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update enrolled students',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/admin/slots/:id - Delete slot
router.delete('/:id', async (req, res) => {
    try {
        const slot = await Slot.findByIdAndDelete(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        res.json({
            success: true,
            message: 'Slot deleted successfully'
        });

    } catch (error) {
        console.error('Delete slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete slot',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
