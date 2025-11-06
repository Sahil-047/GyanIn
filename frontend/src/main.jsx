import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// CRITICAL: Install EdgeStore URL interceptor BEFORE importing EdgeStore
// This intercepts fetch and XMLHttpRequest to fix cross-origin URL issues
import API_CONFIG from './config'

if (typeof window !== 'undefined' && API_CONFIG?.baseURL) {
  const backendURL = `${API_CONFIG.baseURL.replace(/\/+$/, '')}${API_CONFIG.edgestoreBasePath || '/api/edgestore'}`
  
  // Store the correct backend URL
  window.__EDGESTORE_BACKEND_URL__ = backendURL
  
  console.log('[Main] Installing EdgeStore URL interceptor')
  console.log('[Main] Correct backend URL:', backendURL)
  
  // Intercept fetch
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    const url = args[0]
    if (typeof url === 'string' && url.includes('/api/edgestore')) {
      if (url.includes('gyanin.academy/api/edgestore') && !url.includes('api.gyanin.academy')) {
        const corrected = url.replace(/https?:\/\/[^/]+\/api\/edgestore/g, backendURL)
        console.log('[Main] 🔧 Fetch interceptor: Rewriting', url, '→', corrected)
        args[0] = corrected
      }
    }
    return originalFetch.apply(this, args)
  }
  
  // Intercept XMLHttpRequest (EdgeStore might use this)
  const originalXHROpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && url.includes('/api/edgestore')) {
      if (url.includes('gyanin.academy/api/edgestore') && !url.includes('api.gyanin.academy')) {
        const corrected = url.replace(/https?:\/\/[^/]+\/api\/edgestore/g, backendURL)
        console.log('[Main] 🔧 XHR interceptor: Rewriting', url, '→', corrected)
        url = corrected
      }
    }
    return originalXHROpen.call(this, method, url, ...rest)
  }
  
  console.log('[Main] ✅ EdgeStore interceptors installed (fetch + XHR)')
}

import { EdgeStoreProvider } from './edgestore'

// Create a custom Material UI theme matching Learnly's color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0061FF', // Bright blue like Learnly
      light: '#E6F0FF',
      dark: '#0047B3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#111827', // Dark slate for text
      light: '#4B5563',
      dark: '#030712',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9FAFB',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <EdgeStoreProvider>
          <App />
        </EdgeStoreProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)