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
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: getEdgeStoreBasePath(),
})


