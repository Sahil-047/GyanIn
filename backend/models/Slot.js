const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: false,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['online', 'offline']
  },
  startTime: {
    type: String,
    required: false,
    trim: true
  },
  endTime: {
    type: String,
    required: false,
    trim: true
  },
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  timings: [{
    type: String,
    enum: ['Day', 'Noon', 'Evening', 'Night']
  }],
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
    default: 25
  },
  enrolledStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  instructor: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: false,
    trim: true
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
slotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance optimization
slotSchema.index({ class: 1, isActive: 1 }); // For filtering by class
slotSchema.index({ subject: 1, isActive: 1 }); // For filtering by subject
slotSchema.index({ type: 1, isActive: 1 }); // For filtering by type (online/offline)
slotSchema.index({ createdAt: -1 }); // For sorting by newest

module.exports = mongoose.model('Slot', slotSchema);
