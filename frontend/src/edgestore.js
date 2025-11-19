import { createEdgeStoreProvider } from '@edgestore/react'
import API_CONFIG from './config'

// WORKAROUND: EdgeStore library appears to resolve absolute URLs relative to window.location.origin
// So we need to intercept fetch calls or use a different approach

const getEdgeStoreBasePath = () => {
  const baseURL = API_CONFIG?.baseURL?.trim() || ''
  const edgestorePath = API_CONFIG?.edgestoreBasePath || '/api/edgestore'
  
  // PRODUCTION: We have a cross-origin backend
  // IMPORTANT: EdgeStore has a bug where it resolves absolute URLs relative to window.location.origin
  // So we MUST use a relative path and let the interceptor in main.jsx fix it
  if (baseURL && (baseURL.startsWith('http://') || baseURL.startsWith('https://'))) {
    const cleanBaseURL = baseURL.replace(/\/+$/, '')
    const cleanPath = edgestorePath.startsWith('/') ? edgestorePath : `/${edgestorePath}`
    const fullPath = `${cleanBaseURL}${cleanPath}`
    
    // CRITICAL: Use relative path because EdgeStore rewrites absolute URLs
    // The interceptor in main.jsx will catch and rewrite requests
    return edgestorePath
  }
  
  // DEVELOPMENT: Use relative path
  return edgestorePath
}

const basePath = getEdgeStoreBasePath()

// Configure Edge Store
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: basePath,
})


