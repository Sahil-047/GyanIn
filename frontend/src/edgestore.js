import { createEdgeStoreProvider } from '@edgestore/react'
import API_CONFIG from './config'

// Get the EdgeStore base path from config
// CRITICAL: In production, this MUST be an absolute URL to api.gyanin.academy
const getEdgeStoreBasePath = () => {
  const baseURL = API_CONFIG?.baseURL?.trim() || ''
  const edgestorePath = API_CONFIG?.edgestoreBasePath || '/api/edgestore'
  
  console.log('[EdgeStore] ===== INITIALIZATION =====')
  console.log('[EdgeStore] API_CONFIG:', API_CONFIG)
  console.log('[EdgeStore] baseURL from config:', baseURL)
  console.log('[EdgeStore] edgestorePath:', edgestorePath)
  
  // PRODUCTION: Check if we're in production (has absolute URL)
  if (baseURL && (baseURL.startsWith('http://') || baseURL.startsWith('https://'))) {
    // Construct absolute URL
    const cleanBaseURL = baseURL.replace(/\/+$/, '') // Remove trailing slashes
    const cleanPath = edgestorePath.startsWith('/') ? edgestorePath : `/${edgestorePath}`
    const fullPath = `${cleanBaseURL}${cleanPath}`
    
    console.log('[EdgeStore] ✅ PRODUCTION MODE')
    console.log('[EdgeStore] Cleaned baseURL:', cleanBaseURL)
    console.log('[EdgeStore] Final absolute path:', fullPath)
    
    // CRITICAL VALIDATION: Must be absolute
    if (!fullPath.startsWith('http://') && !fullPath.startsWith('https://')) {
      console.error('[EdgeStore] ❌ FATAL: Path is not absolute!', fullPath)
      throw new Error(`EdgeStore basePath must be absolute URL. Got: ${fullPath}`)
    }
    
    // Additional check: Must be api.gyanin.academy (not gyanin.academy)
    if (fullPath.includes('gyanin.academy') && !fullPath.includes('api.gyanin.academy')) {
      console.error('[EdgeStore] ❌ FATAL: URL points to wrong domain!', fullPath)
      console.error('[EdgeStore] Should be: https://api.gyanin.academy/api/edgestore')
      throw new Error(`EdgeStore URL must point to api.gyanin.academy. Got: ${fullPath}`)
    }
    
    console.log('[EdgeStore] ✅ Validation passed')
    console.log('[EdgeStore] ====================')
    return fullPath
  }
  
  // DEVELOPMENT: Use relative path
  console.log('[EdgeStore] ⚠️  DEVELOPMENT MODE (relative path)')
  console.log('[EdgeStore] Using relative path:', edgestorePath)
  console.log('[EdgeStore] ====================')
  return edgestorePath
}

// Get base path at module load
const basePath = getEdgeStoreBasePath()

// Log final value
console.log('[EdgeStore] FINAL basePath value:', basePath)
console.log('[EdgeStore] Type:', typeof basePath)
console.log('[EdgeStore] Starts with https?:', basePath.startsWith('https://'))

// Configure Edge Store
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  basePath: basePath,
})


