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
  if (baseURL && (baseURL.startsWith('http://') || baseURL.startsWith('https://'))) {
    const cleanBaseURL = baseURL.replace(/\/+$/, '')
    const cleanPath = edgestorePath.startsWith('/') ? edgestorePath : `/${edgestorePath}`
    const fullPath = `${cleanBaseURL}${cleanPath}`
    
    console.log('[EdgeStore] ✅ PRODUCTION MODE (cross-origin)')
    console.log('[EdgeStore] Target backend:', fullPath)
    
    // EdgeStore has a bug: it resolves absolute URLs relative to window.location.origin
    // Workaround: Store the full URL and intercept fetch calls
    // For now, we'll use the absolute URL and see if EdgeStore respects it
    // If not, we may need to patch fetch or use a proxy
    
    // Store the production backend URL in a way EdgeStore can't mess with
    window.__EDGESTORE_BACKEND_URL__ = fullPath
    
    console.log('[EdgeStore] Stored backend URL in window.__EDGESTORE_BACKEND_URL__:', fullPath)
    console.log('[EdgeStore] Attempting to use absolute URL (EdgeStore may override this)')
    
    return fullPath
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


