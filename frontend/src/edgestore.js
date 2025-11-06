import { createEdgeStoreProvider } from '@edgestore/react'
import API_CONFIG from './config'

// Get the EdgeStore base path from config
const getEdgeStoreBasePath = () => {
  // Force check: In production, baseURL MUST be set and must be absolute
  const baseURL = API_CONFIG?.baseURL?.trim() || ''
  const edgestorePath = API_CONFIG?.edgestoreBasePath || '/api/edgestore'
  
  // Production: If baseURL is provided and is a valid absolute URL
  if (baseURL && (baseURL.startsWith('http://') || baseURL.startsWith('https://'))) {
    // Ensure no double slashes
    const cleanBaseURL = baseURL.replace(/\/+$/, '')
    const cleanPath = edgestorePath.startsWith('/') ? edgestorePath : `/${edgestorePath}`
    const fullPath = `${cleanBaseURL}${cleanPath}`
    
    // Log for debugging
    console.log('[EdgeStore] Production mode detected')
    console.log('[EdgeStore] baseURL:', baseURL)
    console.log('[EdgeStore] Full basePath:', fullPath)
    
    // Validate it's absolute
    if (!fullPath.startsWith('http://') && !fullPath.startsWith('https://')) {
      console.error('[EdgeStore] ERROR: Expected absolute URL but got:', fullPath)
      throw new Error('EdgeStore basePath must be absolute URL in production')
    }
    
    return fullPath
  }
  
  // Development: Use relative path (goes through Vite proxy)
  const relativePath = edgestorePath
  console.log('[EdgeStore] Development mode - using relative path:', relativePath)
  console.log('[EdgeStore] baseURL was:', baseURL || '(empty)')
  return relativePath
}

// Get the configured base path at module load time
const basePath = getEdgeStoreBasePath()

// Final validation and logging
console.log('[EdgeStore] === Configuration ===')
console.log('[EdgeStore] Final basePath:', basePath)
console.log('[EdgeStore] Is absolute URL?', basePath.startsWith('http://') || basePath.startsWith('https://'))
console.log('[EdgeStore] ====================')

// Configure Edge Store
// Note: Stores (Courses, Teachers) are defined in backend/routes/edgestore.js
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: basePath,
})


