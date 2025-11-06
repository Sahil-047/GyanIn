const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    enum: ['hero', 'about', 'courses', 'carousel', 'offers', 'testimonials', 'ongoingCourses']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
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
cmsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance optimization
cmsSchema.index({ section: 1, isActive: 1 }); // For queries filtering by section and active status
cmsSchema.index({ updatedAt: -1 }); // For sorting by most recent

// ROOT CAUSE FIX: Ensure only ONE document per section (prevent duplicates)
cmsSchema.index({ section: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('CMS', cmsSchema);
