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

// Intercept fetch to rewrite EdgeStore URLs if needed
if (typeof window !== 'undefined' && window.__EDGESTORE_BACKEND_URL__) {
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    const url = args[0]
    
    // If this is an EdgeStore request going to the wrong domain, rewrite it
    if (typeof url === 'string' && url.includes('/api/edgestore')) {
      // Check if it's going to gyanin.academy instead of api.gyanin.academy
      if (url.includes('gyanin.academy/api/edgestore') && !url.includes('api.gyanin.academy')) {
        const correctUrl = url.replace(/https?:\/\/gyanin\.academy\/api\/edgestore/g, window.__EDGESTORE_BACKEND_URL__)
        console.log('[EdgeStore] 🔧 INTERCEPTED: Rewriting URL')
        console.log('[EdgeStore]   From:', url)
        console.log('[EdgeStore]   To:', correctUrl)
        args[0] = correctUrl
      }
    }
    
    return originalFetch.apply(this, args)
  }
  
  console.log('[EdgeStore] ✅ Fetch interceptor installed')
}

// Configure Edge Store
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: basePath,
})


