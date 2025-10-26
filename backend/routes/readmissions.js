const express = require('express');
const { body, validationResult } = require('express-validator');
const Readmission = require('../models/Readmission');
const Slot = require('../models/Slot');

const router = express.Router();

// Validation rules
const readmissionValidation = [
    body('studentName').trim().isLength({ min: 2 }).withMessage('Student name must be at least 2 characters'),
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

        // Enrich readmissions with slot information
        const readmissionsWithSlotInfo = await Promise.all(
            readmissions.map(async (readmission) => {
                const slot = await Slot.findOne({ name: readmission.slotName });
                const readmissionData = readmission.toObject();
                
                if (slot) {
                    readmissionData.slotInfo = {
                        enrolledStudents: slot.enrolledStudents,
                        capacity: slot.capacity,
                        availableSlots: slot.capacity - slot.enrolledStudents,
                        isFull: slot.enrolledStudents >= slot.capacity,
                        isActive: slot.isActive
                    };
                }
                return readmissionData;
            })
        );

        res.json({
            success: true,
            data: readmissionsWithSlotInfo,
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

        // Get slot information to show capacity status
        const slot = await Slot.findOne({ name: readmission.slotName });
        
        const readmissionData = readmission.toObject();
        if (slot) {
            readmissionData.slotInfo = {
                name: slot.name,
                enrolledStudents: slot.enrolledStudents,
                capacity: slot.capacity,
                availableSlots: slot.capacity - slot.enrolledStudents,
                isFull: slot.enrolledStudents >= slot.capacity,
                isActive: slot.isActive
            };
        }

        res.json({
            success: true,
            data: readmissionData
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

        // Find the slot by name to verify it exists
        const slot = await Slot.findOne({ name: req.body.slotName });
        
        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Selected slot not found'
            });
        }

        // Check if slot has available capacity (for display purposes)
        // Note: Slot enrollment will only increment when admin approves the readmission
        if (slot.enrolledStudents >= slot.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Selected slot is full. Please choose another slot.'
            });
        }

        // Create the readmission with default pending status
        const readmissionData = {
            ...req.body,
            status: 'pending' // Ensure status is pending for new readmissions
        };
        const readmission = new Readmission(readmissionData);
        await readmission.save();

        res.status(201).json({
            success: true,
            message: 'Readmission created successfully. Waiting for admin approval.',
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

        const oldReadmission = await Readmission.findById(req.params.id);
        if (!oldReadmission) {
            return res.status(404).json({
                success: false,
                message: 'Readmission not found'
            });
        }

        // If slot is being changed, only update enrollment if readmission is approved
        if (req.body.slotName && req.body.slotName !== oldReadmission.slotName && oldReadmission.status === 'approved') {
            // Decrement old slot
            const oldSlot = await Slot.findOne({ name: oldReadmission.slotName });
            if (oldSlot && oldSlot.enrolledStudents > 0) {
                oldSlot.enrolledStudents -= 1;
                await oldSlot.save();
            }

            // Check new slot capacity and increment
            const newSlot = await Slot.findOne({ name: req.body.slotName });
            if (!newSlot) {
                return res.status(404).json({
                    success: false,
                    message: 'Selected slot not found'
                });
            }

            if (newSlot.enrolledStudents >= newSlot.capacity) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected slot is full. Please choose another slot.'
                });
            }

            newSlot.enrolledStudents += 1;
            await newSlot.save();
        }

        const readmission = await Readmission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

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

        // Get the current readmission to check previous status
        const currentReadmission = await Readmission.findById(req.params.id);
        
        if (!currentReadmission) {
            return res.status(404).json({
                success: false,
                message: 'Readmission not found'
            });
        }

        const previousStatus = currentReadmission.status;

        // If approving, check slot capacity and increment enrollment
        if (status === 'approved' && previousStatus !== 'approved') {
            const slot = await Slot.findOne({ name: currentReadmission.slotName });
            
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    message: 'Slot not found. Cannot approve readmission.'
                });
            }

            // Check if slot is still active
            if (!slot.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot approve: Selected slot is no longer active.'
                });
            }

            // Strict capacity check: enrolled + potential new student must not exceed capacity
            const availableSlots = slot.capacity - slot.enrolledStudents;
            
            if (availableSlots <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot approve: Slot "${slot.name}" is FULL (${slot.enrolledStudents}/${slot.capacity}). Please reject this request or free up capacity first.`
                });
            }

            // Additional safety check before incrementing
            if (slot.enrolledStudents + 1 > slot.capacity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot approve: Adding this student would exceed slot capacity (${slot.enrolledStudents + 1}/${slot.capacity}).`
                });
            }

            // Increment slot enrollment
            slot.enrolledStudents += 1;
            await slot.save();
            
            console.log(`✓ Approved readmission: Slot "${slot.name}" enrollment updated to ${slot.enrolledStudents}/${slot.capacity}`);
        }

        // If rejecting a previously approved readmission, decrement slot enrollment
        if (status === 'rejected' && previousStatus === 'approved') {
            const slot = await Slot.findOne({ name: currentReadmission.slotName });
            
            if (slot && slot.enrolledStudents > 0) {
                slot.enrolledStudents -= 1;
                await slot.save();
            }
        }

        // Update readmission status
        const updateData = { status };
        if (notes) updateData.notes = notes;

        const readmission = await Readmission.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

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
        const readmission = await Readmission.findById(req.params.id);

        if (!readmission) {
            return res.status(404).json({
                success: false,
                message: 'Readmission not found'
            });
        }

        // Only decrement slot enrollment if the readmission was approved
        if (readmission.status === 'approved') {
            const slot = await Slot.findOne({ name: readmission.slotName });
            if (slot && slot.enrolledStudents > 0) {
                slot.enrolledStudents -= 1;
                await slot.save();
            }
        }

        // Delete the readmission
        await Readmission.findByIdAndDelete(req.params.id);

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
