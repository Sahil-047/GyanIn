import { createEdgeStoreProvider } from '@edgestore/react'
import API_CONFIG from './config'

// Get the EdgeStore base path from config
const getEdgeStoreBasePath = () => {
  // Check if we have a baseURL configured (production mode)
  if (API_CONFIG.baseURL && API_CONFIG.baseURL.trim() !== '') {
    // Production: Use full absolute URL
    const baseURL = API_CONFIG.baseURL.trim()
    const edgestorePath = API_CONFIG.edgestoreBasePath || '/api/edgestore'
    // Ensure proper formatting: baseURL + edgestorePath
    // baseURL should be like 'https://api.gyanin.academy'
    // edgestorePath should be like '/api/edgestore'
    const fullPath = `${baseURL}${edgestorePath}`
    console.log('[EdgeStore] Production mode - basePath:', fullPath)
    return fullPath
  }
  // Development: Use relative path (goes through Vite proxy)
  const relativePath = API_CONFIG.edgestoreBasePath || '/api/edgestore'
  console.log('[EdgeStore] Development mode - basePath:', relativePath)
  return relativePath
}

// Get the configured base path
const basePath = getEdgeStoreBasePath()

// Debug: Log the final basePath being used
console.log('[EdgeStore] Final basePath configuration:', basePath)

// Configure Edge Store
// Note: Stores (Courses, Teachers) are defined in backend/routes/edgestore.js
// The frontend just needs to connect to the correct basePath
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: basePath,
})


