const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  queryType: {
    type: String,
    required: true,
    enum: ['general', 'course', 'other']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new'
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
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance optimization
contactSchema.index({ status: 1, createdAt: -1 }); // For filtering by status and sorting
contactSchema.index({ queryType: 1, createdAt: -1 }); // For filtering by query type
contactSchema.index({ email: 1 }); // For email lookups

module.exports = mongoose.model('Contact', contactSchema);
