const express = require('express');
const { body, validationResult } = require('express-validator');
const Readmission = require('../models/Readmission');

const router = express.Router();

// Validation rules
const readmissionValidation = [
    body('studentName').trim().isLength({ min: 2 }).withMessage('Student name must be at least 2 characters'),
    body('studentId').trim().isLength({ min: 3 }).withMessage('Student ID must be at least 3 characters'),
    body('course').trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters'),
    body('contact').trim().isLength({ min: 10 }).withMessage('Contact must be at least 10 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('slotName').trim().isLength({ min: 2 }).withMessage('Slot name must be at least 2 characters')
];

// GET /api/admin/readmissions - Get all readmissions
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            course,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (course && course !== 'All') {
            filter.course = course;
        }

        if (search) {
            filter.$or = [
                { studentName: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { course: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const readmissions = await Readmission.find(filter)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Readmission.countDocuments(filter);

        res.json({
            success: true,
            data: readmissions,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get readmissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch readmissions',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/readmissions/stats - Get readmission statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            total,
            pending,
            approved,
            rejected
        ] = await Promise.all([
            Readmission.countDocuments(),
            Readmission.countDocuments({ status: 'pending' }),
            Readmission.countDocuments({ status: 'approved' }),
            Readmission.countDocuments({ status: 'rejected' })
        ]);

        res.json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected
            }
        });

    } catch (error) {
        console.error('Get readmission stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch readmission statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/readmissions/:id - Get single readmission
router.get('/:id', async (req, res) => {
    try {
        const readmission = await Readmission.findById(req.params.id);

        if (!readmission) {
            return res.status(404).json({
                success: false,
                message: 'Readmission not found'
            });
        }

        res.json({
            success: true,
            data: readmission
        });

    } catch (error) {
        console.error('Get readmission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch readmission',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/admin/readmissions - Create new readmission
router.post('/', readmissionValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const readmission = new Readmission(req.body);
        await readmission.save();

        res.status(201).json({
            success: true,
            message: 'Readmission created successfully',
            data: readmission
        });

    } catch (error) {
        console.error('Create readmission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create readmission',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/readmissions/:id - Update readmission
router.put('/:id', readmissionValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const readmission = await Readmission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!readmission) {
            return res.status(404).json({
                success: false,
                message: 'Readmission not found'
            });
        }

        res.json({
            success: true,
            message: 'Readmission updated successfully',
            data: readmission
        });

    } catch (error) {
        console.error('Update readmission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update readmission',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/readmissions/:id/status - Update readmission status
router.put('/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, approved, or rejected'
            });
        }

        const updateData = { status };
        if (notes) updateData.notes = notes;

        const readmission = await Readmission.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!readmission) {
            return res.status(404).json({
                success: false,
                message: 'Readmission not found'
            });
        }

        res.json({
            success: true,
            message: 'Readmission status updated successfully',
            data: readmission
        });

    } catch (error) {
        console.error('Update readmission status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update readmission status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/admin/readmissions/:id - Delete readmission
router.delete('/:id', async (req, res) => {
    try {
        const readmission = await Readmission.findByIdAndDelete(req.params.id);

        if (!readmission) {
            return res.status(404).json({
                success: false,
                message: 'Readmission not found'
            });
        }

        res.json({
            success: true,
            message: 'Readmission deleted successfully'
        });

    } catch (error) {
        console.error('Delete readmission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete readmission',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
