const mongoose = require('mongoose');

const readmissionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
    // Note: Each phone number can only be associated with one student
  },
  slotName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Removed: email, reason, previousCourse per new requirements
  notes: {
    type: String,
    trim: true
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
readmissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Ensure contact is trimmed
  if (this.contact) {
    this.contact = this.contact.trim();
  }
  next();
});

// Ensure unique index is created on contact field
readmissionSchema.index({ contact: 1 }, { unique: true });

module.exports = mongoose.model('Readmission', readmissionSchema);
