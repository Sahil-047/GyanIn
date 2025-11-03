const express = require('express');
const { body, validationResult } = require('express-validator');
const Merchandise = require('../models/Merchandise');

const router = express.Router();

// Validation rules for creating merchandise
const merchandiseValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional({ nullable: true }).trim(),
  body('image').optional().isURL().withMessage('Image must be a valid URL')
];

// Validation rules for updating merchandise (all fields optional)
const merchandiseUpdateValidation = [
  body('title').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional({ nullable: true, checkFalsy: true }).trim(),
  body('image').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Image must be a valid URL'),
  body('stock').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('isActive').optional({ nullable: true }).isBoolean().withMessage('isActive must be a boolean')
];

// GET /api/merchandise - Get all merchandise
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search 
    } = req.query;

    const filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const merchandise = await Merchandise.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Merchandise.countDocuments(filter);

    res.json({
      success: true,
      data: merchandise,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchandise',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/merchandise/categories - Get all merchandise categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Merchandise.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/merchandise/:id - Get single merchandise item
router.get('/:id', async (req, res) => {
  try {
    const merchandise = await Merchandise.findById(req.params.id);

    if (!merchandise) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise not found'
      });
    }

    res.json({
      success: true,
      data: merchandise
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchandise',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/merchandise - Create new merchandise (for admin)
router.post('/', merchandiseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const merchandise = new Merchandise(req.body);
    await merchandise.save();

    res.status(201).json({
      success: true,
      message: 'Merchandise created successfully',
      data: merchandise
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create merchandise',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/merchandise/:id - Update merchandise (for admin)
router.put('/:id', merchandiseUpdateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const merchandise = await Merchandise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!merchandise) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise not found'
      });
    }

    res.json({
      success: true,
      message: 'Merchandise updated successfully',
      data: merchandise
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update merchandise',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/merchandise/:id - Delete merchandise (for admin)
router.delete('/:id', async (req, res) => {
  try {
    const merchandise = await Merchandise.findByIdAndDelete(req.params.id);

    if (!merchandise) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise not found'
      });
    }

    res.json({
      success: true,
      message: 'Merchandise deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete merchandise',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

