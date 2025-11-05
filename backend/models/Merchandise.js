const mongoose = require('mongoose');

const merchandiseSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
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
  stock: {
    type: Number,
    required: false,
    default: 0,
    min: 0
  },
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
merchandiseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance optimization
merchandiseSchema.index({ category: 1, isActive: 1 }); // For filtering by category
merchandiseSchema.index({ stock: 1, isActive: 1 }); // For filtering available items
merchandiseSchema.index({ createdAt: -1 }); // For sorting by newest

module.exports = mongoose.model('Merchandise', merchandiseSchema);

