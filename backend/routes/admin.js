const express = require('express');
const Contact = require('../models/Contact');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Readmission = require('../models/Readmission');
const Slot = require('../models/Slot');
const CMS = require('../models/CMS');

const router = express.Router();

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        const [
            totalContacts,
            newContacts,
            totalCourses,
            activeCourses,
            totalTeachers,
            activeTeachers,
            totalReadmissions,
            pendingReadmissions,
            totalSlots,
            activeSlots,
            recentContacts,
            recentCourses,
            recentReadmissions
        ] = await Promise.all([
            Contact.countDocuments(),
            Contact.countDocuments({ status: 'new' }),
            Course.countDocuments(),
            Course.countDocuments({ isActive: true }),
            Teacher.countDocuments(),
            Teacher.countDocuments({ isActive: true }),
            Readmission.countDocuments(),
            Readmission.countDocuments({ status: 'pending' }),
            Slot.countDocuments(),
            Slot.countDocuments({ isActive: true }),
            Contact.find().sort({ createdAt: -1 }).limit(5),
            Course.find({ isActive: true }).sort({ createdAt: -1 }).limit(5),
            Readmission.find().sort({ createdAt: -1 }).limit(5)
        ]);

        res.json({
            success: true,
            data: {
        statistics: {
          contacts: {
            total: totalContacts,
            new: newContacts,
            inProgress: await Contact.countDocuments({ status: 'in-progress' }),
            resolved: await Contact.countDocuments({ status: 'resolved' })
          },
          courses: {
            total: totalCourses,
            active: activeCourses,
            inactive: totalCourses - activeCourses
          },
          teachers: {
            total: totalTeachers,
            active: activeTeachers,
            inactive: totalTeachers - activeTeachers
          },
          readmissions: {
            total: totalReadmissions,
            pending: pendingReadmissions,
            approved: await Readmission.countDocuments({ status: 'approved' }),
            rejected: await Readmission.countDocuments({ status: 'rejected' })
          },
          slots: {
            total: totalSlots,
            active: activeSlots,
            inactive: totalSlots - activeSlots
          }
        },
        recent: {
          contacts: recentContacts,
          courses: recentCourses,
          readmissions: recentReadmissions
        }
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/contacts - Get all contacts with pagination
router.get('/contacts', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, queryType } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (queryType) filter.queryType = queryType;

        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Contact.countDocuments(filter);

        res.json({
            success: true,
            data: contacts,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get admin contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/courses - Get all courses (including inactive)
router.get('/courses', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, level, isActive } = req.query;

        const filter = {};
        if (category && category !== 'All') filter.category = category;
        if (level) filter.level = level;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const courses = await Course.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Course.countDocuments(filter);

        res.json({
            success: true,
            data: courses,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get admin courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch courses',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/admin/teachers - Get all teachers (including inactive)
router.get('/teachers', async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive } = req.query;

        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const teachers = await Teacher.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Teacher.countDocuments(filter);

        res.json({
            success: true,
            data: teachers,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get admin teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teachers',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/contacts/:id/status - Update contact status
router.put('/contacts/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['new', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: new, in-progress, or resolved'
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated successfully',
            data: contact
        });

    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/courses/:id/toggle - Toggle course active status
router.put('/courses/:id/toggle', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        course.isActive = !course.isActive;
        await course.save();

        res.json({
            success: true,
            message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
            data: course
        });

    } catch (error) {
        console.error('Toggle course status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle course status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/admin/teachers/:id/toggle - Toggle teacher active status
router.put('/teachers/:id/toggle', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        teacher.isActive = !teacher.isActive;
        await teacher.save();

        res.json({
            success: true,
            message: `Teacher ${teacher.isActive ? 'activated' : 'deactivated'} successfully`,
            data: teacher
        });

    } catch (error) {
        console.error('Toggle teacher status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle teacher status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
