const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');

const router = express.Router();

// Validation rules for creating a course
const courseValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('instructor').trim().isLength({ min: 2 }).withMessage('Instructor name must be at least 2 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('category').trim().isLength({ min: 2 }).withMessage('Category must be at least 2 characters'),
  body('image').optional().isURL().withMessage('Image must be a valid URL')
];

// Validation rules for updating a course (all fields optional)
const courseUpdateValidation = [
  body('title').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('instructor').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2 }).withMessage('Instructor name must be at least 2 characters'),
  body('price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('level').optional({ nullable: true }).isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('category').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2 }).withMessage('Category must be at least 2 characters'),
  body('image').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Image must be a valid URL'),
  body('rating').optional({ nullable: true }).isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('students').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Students must be a non-negative integer'),
  body('tags').optional({ nullable: true }).isArray().withMessage('Tags must be an array'),
  body('isActive').optional({ nullable: true }).isBoolean().withMessage('isActive must be a boolean')
];

// GET /api/courses - Get all courses
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      level, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search 
    } = req.query;

    const filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const courses = await Course.find(filter)
      .sort(sortOptions)
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
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/courses/categories - Get all course categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/courses/:id - Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/courses - Create new course (for admin)
router.post('/', courseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const course = new Course(req.body);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/courses/:id - Update course (for admin)
router.put('/:id', courseUpdateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/courses/:id - Delete course (for admin)
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
