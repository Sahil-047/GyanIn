const express = require('express');
const { body, validationResult } = require('express-validator');
const Teacher = require('../models/Teacher');

const router = express.Router();

// Validation rules
const teacherValidation = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('role').trim().isLength({ min: 2 }).withMessage('Role must be at least 2 characters'),
    body('education').trim().isLength({ min: 5 }).withMessage('Education must be at least 5 characters'),
    body('bio').trim().isLength({ min: 20 }).withMessage('Bio must be at least 20 characters'),
    body('image').isURL().withMessage('Image must be a valid URL'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

// GET /api/teachers - Get all teachers
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: teachers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teachers',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/teachers/:id - Get single teacher
router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.json({
            success: true,
            data: teacher
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teacher',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/teachers - Create new teacher (for admin)
router.post('/', teacherValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const teacher = new Teacher(req.body);
        await teacher.save();

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: teacher
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create teacher',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/teachers/:id - Update teacher (for admin)
router.put('/:id', teacherValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.json({
            success: true,
            message: 'Teacher updated successfully',
            data: teacher
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update teacher',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/teachers/:id - Delete teacher (for admin)
router.delete('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.json({
            success: true,
            message: 'Teacher deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete teacher',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
