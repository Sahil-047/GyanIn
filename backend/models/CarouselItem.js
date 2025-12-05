const mongoose = require('mongoose');

const DEFAULT_TEACHER_IMAGE = 'https://via.placeholder.com/300x300?text=Teacher';

const carouselItemSchema = new mongoose.Schema({
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  teacherImage: {
    type: String,
    required: true,
    trim: true,
    default: DEFAULT_TEACHER_IMAGE
  },
  scheduleImage: {
    type: String,
    trim: true,
    default: ''
  },
  schedule1Image: {
    type: String,
    trim: true,
    default: ''
  },
  schedule2Image: {
    type: String,
    trim: true,
    default: ''
  },
  legacyId: {
    type: String,
    trim: true,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

carouselItemSchema.pre('save', function(next) {
  if (!this.teacherImage) {
    this.teacherImage = DEFAULT_TEACHER_IMAGE;
  }
  next();
});

module.exports = {
  CarouselItem: mongoose.model('CarouselItem', carouselItemSchema),
  DEFAULT_TEACHER_IMAGE
};

