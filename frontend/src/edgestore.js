import { createEdgeStoreProvider } from '@edgestore/react'
import API_CONFIG from './config'

// Get the EdgeStore base path from config
const getEdgeStoreBasePath = () => {
  if (API_CONFIG.baseURL) {
    // Production: Use full URL
    return `${API_CONFIG.baseURL}${API_CONFIG.edgestoreBasePath}`
  }
  // Development: Use relative path (goes through Vite proxy)
  return API_CONFIG.edgestoreBasePath
}

// Configure Edge Store
// Note: Stores (Courses, Teachers) are defined in backend/routes/edgestore.js
// The frontend just needs to connect to the correct basePath
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: getEdgeStoreBasePath(),
})


