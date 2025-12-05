const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const edgestoreHandler = require('./routes/edgestore');
const { syncCarouselItems, bootstrapCarouselItems } = require('./utils/syncCarouselItems');
const { CarouselItem } = require('./models/CarouselItem');
const CMS = require('./models/CMS');
const Readmission = require('./models/Readmission');

// Middleware
// CORS configuration: flexible handling for development and production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, or same-origin requests)
    // This is safe and necessary for server-to-server communication
    if (!origin) {
      return callback(null, true);
    }

    // Development mode: Allow all origins for easier development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Production mode: Check against allowed origins
    // Support multiple origins separated by commas in FRONTEND_URL
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim()).filter(url => url.length > 0)
      : ['https://gyanin.academy', 'https://www.gyanin.academy'];

    // If ALLOW_ALL_ORIGINS is set to true, allow all origins (use with caution)
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }

    // Normalize origins for comparison (remove trailing slashes)
    const normalizeUrl = (url) => url.replace(/\/$/, '');
    const normalizedOrigin = normalizeUrl(origin);
    
    // Check if the origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = normalizeUrl(allowed);
      
      // Exact match
      if (normalizedOrigin === normalizedAllowed) {
        return true;
      }
      
      // Check HTTP/HTTPS variants (for flexibility)
      if (normalizedAllowed.startsWith('https://')) {
        const httpVersion = normalizedAllowed.replace(/^https:/, 'http:');
        if (normalizedOrigin === httpVersion) {
          return true;
        }
      }
      
      if (normalizedAllowed.startsWith('http://')) {
        const httpsVersion = normalizedAllowed.replace(/^http:/, 'https:');
        if (normalizedOrigin === httpsVersion) {
          return true;
        }
      }

      // Check for wildcard subdomains (e.g., *.gyanin.academy)
      if (normalizedAllowed.includes('*')) {
        const regexPattern = normalizedAllowed
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(normalizedOrigin)) {
          return true;
        }
      }

      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // In production, reject unauthorized origins
      callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization'
  ],
  maxAge: 86400, // 24 hours - how long the browser can cache preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Additional CORS logging in production for debugging
if (process.env.NODE_ENV === 'production' && process.env.CORS_DEBUG === 'true') {
  app.use((req, res, next) => {
    next();
  });
}
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gyanin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  try {
    const carouselItemCount = await CarouselItem.countDocuments();

    if (carouselItemCount === 0) {
      const cmsDoc = await CMS.findOne({ section: 'carousel' }).lean();
      const cmsItems = cmsDoc?.data?.carouselItems;

      if (Array.isArray(cmsItems) && cmsItems.length > 0) {
        await bootstrapCarouselItems();
      }
    }

    await syncCarouselItems();
    
    // Ensure unique index exists on Readmission contact field
    try {
      await Readmission.collection.createIndex({ contact: 1 }, { unique: true, sparse: true });
    } catch (indexError) {
      // Index creation failed - may be due to existing duplicates
    }
  } catch (error) {
    // Error during database initialization
  }
})
.catch(err => {
  // Database connection error
});

// Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/merchandise', require('./routes/merchandise'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/public/slots', require('./routes/slots'));
app.use('/api/public/readmissions', require('./routes/readmissions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/readmissions', require('./routes/readmissions'));
app.use('/api/admin/slots', require('./routes/slots'));
app.use('/api/admin/cms', require('./routes/cms'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/edgestore', edgestoreHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GyanIN API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle CORS errors specifically
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Origin not allowed by CORS policy',
      origin: req.headers.origin || 'none'
    });
  }

  // Handle other errors

  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
});

module.exports = app;
