// Simple in-memory cache middleware
// Can be upgraded to Redis later for production

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

// Cache entry structure: { data, timestamp, ttl }
const getCacheKey = (req) => {
  return `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
};

const cacheMiddleware = (ttl = CACHE_TTL) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = getCacheKey(req);
    const cached = cache.get(key);

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
  clearCache(`/api/admin/cms/${section}`);
  clearCache(`/api/admin/cms`);
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

