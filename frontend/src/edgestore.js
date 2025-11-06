import { createEdgeStoreProvider } from '@edgestore/react'
import API_CONFIG from './config'

// WORKAROUND: EdgeStore library appears to resolve absolute URLs relative to window.location.origin
// So we need to intercept fetch calls or use a different approach

const getEdgeStoreBasePath = () => {
  const baseURL = API_CONFIG?.baseURL?.trim() || ''
  const edgestorePath = API_CONFIG?.edgestoreBasePath || '/api/edgestore'
  
  console.log('[EdgeStore] ===== INITIALIZATION =====')
  console.log('[EdgeStore] API_CONFIG:', API_CONFIG)
  console.log('[EdgeStore] baseURL from config:', baseURL)
  console.log('[EdgeStore] edgestorePath:', edgestorePath)
  
  // PRODUCTION: We have a cross-origin backend
  // IMPORTANT: EdgeStore has a bug where it resolves absolute URLs relative to window.location.origin
  // So we MUST use a relative path and let the interceptor in main.jsx fix it
  if (baseURL && (baseURL.startsWith('http://') || baseURL.startsWith('https://'))) {
    const cleanBaseURL = baseURL.replace(/\/+$/, '')
    const cleanPath = edgestorePath.startsWith('/') ? edgestorePath : `/${edgestorePath}`
    const fullPath = `${cleanBaseURL}${cleanPath}`
    
    console.log('[EdgeStore] ✅ PRODUCTION MODE (cross-origin)')
    console.log('[EdgeStore] Target backend:', fullPath)
    console.log('[EdgeStore] ⚠️  Using RELATIVE path (interceptor will fix URL)')
    
    // CRITICAL: Use relative path because EdgeStore rewrites absolute URLs
    // The interceptor in main.jsx will catch and rewrite requests
    return edgestorePath
  }
  
  // DEVELOPMENT: Use relative path
  console.log('[EdgeStore] ⚠️  DEVELOPMENT MODE (relative path)')
  return edgestorePath
}

const basePath = getEdgeStoreBasePath()

console.log('[EdgeStore] FINAL basePath value:', basePath)
console.log('[EdgeStore] Note: URL interceptors should already be installed in main.jsx')

// Configure Edge Store
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: basePath,
})


