// Simple in-memory cache middleware
// Can be upgraded to Redis later for production

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

// Cache entry structure: { data, timestamp, ttl }
const getCacheKey = (req) => {
  // Normalize the URL to handle trailing slashes and query params consistently
  const url = req.originalUrl.split('?')[0]; // Remove query string for key matching
  // Filter out cache-busting parameters (t, _t, timestamp, etc.)
  const filteredQuery = {};
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      // Skip cache-busting parameters
      if (!['t', '_t', 'timestamp', 'cache', 'nocache'].includes(key.toLowerCase())) {
        filteredQuery[key] = req.query[key];
      }
    });
  }
  const queryStr = JSON.stringify(filteredQuery);
  return `${req.method}:${url}:${queryStr}`;
};

const cacheMiddleware = (ttl = CACHE_TTL) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check for explicit cache-busting parameters
    const hasCacheBust = req.query && (
      req.query.t || req.query._t || req.query.timestamp || 
      req.query.cache === 'false' || req.query.nocache === 'true'
    );

    const key = getCacheKey(req);
    const cached = cache.get(key);

    // If cache-busting parameter is present, skip cache
    if (hasCacheBust) {
      // Still override res.json to cache the response (for future requests without cache-bust)
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: ttl
        });
        return originalJson(data);
      };
      return next();
    }

    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      // Cache hit
      return res.json(cached.data);
    }

    // Cache miss - override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Cache the response
      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttl
      });
      return originalJson(data);
    };

    next();
  };
};

// Clear cache for specific patterns
const clearCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Clear cache by section (for CMS updates)
const clearCacheBySection = (section) => {
  
  // Get all cache keys and clear matching ones
  const keysToDelete = [];
  for (const key of cache.keys()) {
    // Match the exact cache key format: METHOD:/api/admin/cms/section:{}
    // Also match variations with trailing slashes, query params, etc.
    if (
      key.includes(`/api/admin/cms/${section}`) || 
      key.includes(`/api/cms/${section}`) ||
      key.includes(`cms/${section}`) ||
      key.includes(`cms?section=${section}`)
    ) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => cache.delete(key));
};

// Get cache stats
const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearCacheBySection,
  getCacheStats
};

