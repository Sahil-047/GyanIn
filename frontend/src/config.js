// API Configuration
// Switch between development and production by commenting/uncommenting the appropriate section
// 
// DEVELOPMENT OPTIONS:
//   1. Local backend (localhost:5000): baseURL: '' (empty string, uses Vite proxy)
//   2. Hosted backend (api.gyanin.academy): baseURL: 'https://api.gyanin.academy'
//
// TO SWITCH TO PRODUCTION:
//   1. Comment out the DEVELOPMENT section below (add /* and */)
//   2. Uncomment the PRODUCTION section below (remove /* and */)
//   3. For production: npm run build

// ============================================
// DEVELOPMENT CONFIGURATION (Currently Active)
// ============================================
// Development: Using hosted backend API (api.gyanin.academy)
// Frontend: http://localhost:3000 (local Vite dev server)
// Backend: https://api.gyanin.academy (hosted backend)
// 
// To use local backend instead, change baseURL to: '' (empty string)
const API_CONFIG = {
  baseURL: 'https://api.gyanin.academy', // Hosted backend URL for development
  edgestoreBasePath: '/api/edgestore',
};

// ============================================
// PRODUCTION CONFIGURATION (commented out)
// ============================================
// Production: Backend API on api.gyanin.academy
// Frontend: https://gyanin.academy
// Backend: https://api.gyanin.academy
// Note: baseURL should be the domain only (without /api)
/*
const API_CONFIG = {
  baseURL: 'https://api.gyanin.academy', // Production backend URL
  edgestoreBasePath: '/api/edgestore',
};
*/

export default API_CONFIG;

