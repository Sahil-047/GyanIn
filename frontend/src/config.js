// API Configuration
// Switch between development and production by commenting/uncommenting the appropriate section
// 
// TO SWITCH TO DEVELOPMENT:
//   1. Comment out the PRODUCTION section below (add /* and */)
//   2. Uncomment the DEVELOPMENT section below (remove /* and */)
//   3. For dev: npm run dev (uses Vite proxy)
//
// TO SWITCH TO PRODUCTION:
//   1. Comment out the DEVELOPMENT section below (add /* and */)
//   2. Uncomment the PRODUCTION section below (remove /* and */)
//   3. For production: npm run build

// ============================================
// DEVELOPMENT CONFIGURATION
// ============================================
// Use this for local development (with Vite proxy)
/*
const API_CONFIG = {
  // Development: Use relative path (goes through Vite proxy to localhost:5000)
  baseURL: '', // Empty string means relative path
  edgestoreBasePath: '/api/edgestore',
};
*/

// ============================================
// PRODUCTION CONFIGURATION
// ============================================
// Production: Backend API on api.gyanin.academy
// Frontend: https://gyanin.academy
// Backend: https://api.gyanin.academy
// Note: baseURL should be the domain only (without /api)
const API_CONFIG = {
  // Production: Use full backend URL (domain only, /api will be added in api.js)
  baseURL: 'https://api.gyanin.academy', // Production backend URL
  edgestoreBasePath: '/api/edgestore',
};

export default API_CONFIG;

