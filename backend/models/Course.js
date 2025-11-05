const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  monthlyPrice: {
    type: Number,
    required: false,
    min: 0
  },
  yearlyPrice: {
    type: Number,
    required: false,
    min: 0
  },
  duration: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  class: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  category: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  enrollmentUrl: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  students: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance optimization
courseSchema.index({ isActive: 1, class: 1 }); // For filtering active courses by class
courseSchema.index({ category: 1, isActive: 1 }); // For filtering by category
courseSchema.index({ createdAt: -1 }); // For sorting by newest
courseSchema.index({ rating: -1, isActive: 1 }); // For sorting by rating

module.exports = mongoose.model('Course', courseSchema);
