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

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gyanin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {})
.catch(err => {});

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
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {});

module.exports = app;
