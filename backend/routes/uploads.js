const express = require('express');
const multer = require('multer');
const FormData = require('form-data');

// Use native fetch if available (Node 18+), otherwise require node-fetch
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch {
  fetch = require('node-fetch');
}

const router = express.Router();

// Store file in memory; we will forward to Edge Store
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB default limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Centralized upload handler for teachers/courses images
router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const accessKey = process.env.EDGE_STORE_ACCESS_KEY;
    const secretKey = process.env.EDGE_STORE_SECRET_KEY;

    if (!accessKey || !secretKey) {
      return res.status(501).json({
        success: false,
        message: 'Edge Store is not configured on the server. Add EDGE_STORE_ACCESS_KEY and EDGE_STORE_SECRET_KEY env vars.',
      });
    }

    // Determine bucket from query parameter or body, default to Teachers
    const bucketType = req.query.type || req.body.type || 'teacher'; // 'teacher' or 'course'
    const bucketName = bucketType === 'course' ? 'Courses' : 'Teachers';

    try {
      // Create form data for Edge Store upload
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      formData.append('bucket', bucketName);
      formData.append('project', 'GyanIN');

      // Try Edge Store API endpoint
      const endpoint = 'https://files.edgestore.dev/api/upload';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessKey}:${secretKey}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      // Get response as text first to handle both JSON and HTML responses
      const responseText = await response.text();
      
      // Log response for debugging
      

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // If not JSON, it's likely an HTML error page - return detailed error
        const errorMessage = `Edge Store API returned HTML instead of JSON. This usually means:
1. The API endpoint is incorrect
2. The authentication format is wrong
3. Edge Store might require using their React SDK instead of direct API calls

Response preview: ${responseText.substring(0, 200)}`;
        
        throw new Error(errorMessage);
      }

      if (response.ok && data.url) {
        return res.json({
          success: true,
          url: data.url,
          bucket: bucketName,
        });
      } else {
        throw new Error(data.message || `Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload to Edge Store',
        error: process.env.NODE_ENV === 'development' ? uploadError.message : 'Internal server error',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
});

module.exports = router;


